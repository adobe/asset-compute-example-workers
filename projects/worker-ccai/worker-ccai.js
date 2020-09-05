/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
'use strict';

const { worker, SourceCorruptError } = require('@adobe/asset-compute-sdk');
const { serializeXmp } = require("@adobe/asset-compute-xmp");
const axios = require('axios');

const path = require('path');
const { createReadStream } = require('fs');
const fs = require('fs').promises;
const FormData = require('form-data');

const DEFAULT_ANALYZER_ID = "Feature:image-color-histogram:Service-e952f4acd7c2425199b476a2eb459635";
const DEFAULT_CCAI_ENDPOINT = "https://sensei.adobe.io/services/v1/predict";

/**
 * @typedef {Object} Color
 * @property {String} name Color name
 * @property {Number} percentage Coverage percentage (0.0-1.0)
 * @property {Number} red Red channel (0-255)
 * @property {Number} green Green channel (0-255)
 * @property {Number} blue Blue channel (0-255) 
 */

/**
 * Parse the color feature response
 * 
 * @param {*} response JSON response from Content and Commerce AI service
 * @returns {Color[]} Color features returned by the service
 */
function parseColors(response) {
    const colors = [];
    for (const cas of response.cas_responses) {
        if (cas.status === 200 && cas.result.response_type === "feature") {
            for (const r of cas.result.response) {
                if (r.feature_name === "color") {
                    for (const value of r.feature_value) {
                        const [ name, percentage, red, green, blue ] = value.feature_value.split(",");
                        colors.push({
                            name,
                            percentage,
                            red,
                            green,
                            blue
                        });    
                    }
                }
            }
        }
    }
    return colors;
}

/**
 * Sort colors, high coverage to low coverage
 * 
 * @param {Color[]} colors Color features
 * @return {Color[]} Color features sorted by percentage (high to low)
 */
function sortColors(colors) {
    colors.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Convert a percentage to a string
 * 
 * @param {Color} color Color feature
 * @returns Percentage as a string, e.g. 59%
 */
function toPercentageString(color) {
    return `${Math.round(color.percentage * 100.0)}%`;
}

/**
 * Convert a color feature to a web color
 * 
 * @param {Color} color Color feature
 * @returns Web color, e.g. `#a909fe`
 */
function toWebColor(color) {
    const arr = [color.red, color.green, color.blue];
    return `#${Buffer.from(arr).toString('hex')}`;
}

exports.main = worker(async (source, rendition, params) => {
    // Acquire end point and analyzer
    const analyzer_id = rendition.instructions.ANALYZER_ID || DEFAULT_ANALYZER_ID;
    const endpoint = rendition.instructions.CCAI_ENDPOINT || DEFAULT_CCAI_ENDPOINT;
    console.log("Using analyzer:", analyzer_id);
    console.log("Using endpoint:", endpoint);

    // Make sure that the source file is not empty
    const stats = await fs.stat(source.path);
    if (stats.size === 0) {
        throw new SourceCorruptError('source file is empty');
    }

    // Build parameters to send to Sensei service
    const ext = path.extname(source.path);
    const parameters = {
        "application-id": "1234",
        "content-type": "inline",
        "encoding": ext,
        "threshold": "0",
        "top-N": "0",
        "custom": {},
        "data": [{
            "content-id": "0987",
            "content": "inline-image",
            "content-type": "inline",
            "encoding": ext,
            "threshold": "0",
            "top-N": "0",
            "historic-metadata": [],
            "custom": {"exclude_mask": 1}
        }]
    };
    if (rendition.instructions.SENSEI_PARAMS) {
        parameters = JSON.parse(rendition.instructions.SENSEI_PARAMS);
        parameters.encoding = ext;
        parameters.data[0].encoding = ext;
    }

    // Build form to post
    const formData = new FormData();
    formData.append('file', createReadStream(source.path));
    formData.append('contentAnalyzerRequests', JSON.stringify({
        enable_diagnostics: true,
        requests: [{
            analyzer_id,
            parameters
        }]
    }));

    // Execute request
    const response = await axios.post(
        endpoint,
        formData,
        {
            headers: Object.assign({
                'Authorization': 'Bearer ' + params.auth.accessToken,
                'cache-control': 'no-cache,no-cache',
                'Content-Type': 'multipart/form-data',
                'x-api-key': params.auth.clientId,
            }, formData.getHeaders())
        }
    );

    // Convert color features to XMP metadata
    const colors = parseColors(response.data);
    sortColors(colors);
    const xmp = serializeXmp({
        "ccai:colorNames": colors.map(color => color.name),
        "ccai:colorPercentages": colors.map(color => toPercentageString(color)),
        "ccai:colorRGB": colors.map(color => toWebColor(color))
    }, {
        namespaces: {
            ccai: "https://example.com/schema/ccai"
        }
    });

    // Write XMP metadata as output
    await fs.writeFile(rendition.path, xmp);
});
