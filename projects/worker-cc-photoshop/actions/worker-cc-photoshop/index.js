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

const { worker } = require('@adobe/asset-compute-sdk');
const sdk = require('@adobe/aio-lib-photoshop-api');
const libFiles = require('@adobe/aio-lib-files');
const { v4: uuidv4 } = require("uuid");
const { AioLibFilesMock } = require("../../lib/mock-aio-lib-files");
const path = require("path");
const { downloadFile } = require('@adobe/httptransfer');

/**
 * Acquire authorization
 * 
 * @param {*} params Worker parameters
 * @returns {{orgId, clientId, accessToken}} authorization
 */
function getAuthorization(params) {
    let orgId, clientId, accessToken;
    if (process.env.WORKER_TEST_MODE) {
        orgId = "test-ims-org-id";
        clientId = "test-client-id";
        accessToken = "test-access-token";
    } else {
        ({ orgId, clientId, accessToken } = params.auth);
    }

    if (!orgId || !clientId || !accessToken) {
        throw Error("Request is missing authorization information");
    }

    return { orgId, clientId, accessToken };
}

/**
 * Set up Photoshop Action Options
 * 
 * Resolve file types, add actionName parameter and 
 * set up options for Photoshop Actions Api request
 * 
 * @param {*} client Photoshop Api Client instance
 * @param {Object} instructions Rendition instructions
 * @returns {Object} options for Photoshop Actions Api request
 */
async function setupPhotoshopActionsOptions(client, instructions, files) {
    if (!instructions || !instructions.photoshopAction) {
        throw Error("Photoshop Action url not provided");
    }

    // workaround for action files from AEM
    // we must download the action file and add the `.atn`
    // extension to the file so Photoshop Service can
    // recognize it
    let photoshopAction = instructions.photoshopAction;
    let ext;
    try {
        ext = path.extname(photoshopAction).substring(1).toLowerCase();
    } catch (err) {
    }
    if (!ext) {
        const tempActionFilename = `${uuidv4()}_temp.atn`;
        const aioLibActionFilename = `${uuidv4()}/photoshopaction.atn`;
        await downloadFile(photoshopAction, tempActionFilename);
        await files.copy(tempActionFilename, aioLibActionFilename, { localSrc: true });
        photoshopAction = aioLibActionFilename;
        
    }
    const options = {
        actions: [{
            href: photoshopAction
        }]
    }
    if (options && Array.isArray(options.actions) && instructions.photoshopActionName) {
        options.actions[0].actionName = instructions.photoshopActionName;
    }
    return options;
}

exports.main = worker(async (source, rendition, params) => {
    // Authorization
    const { orgId, clientId, accessToken } = getAuthorization(params);

    // Initialize
    let files;
    if (process.env.WORKER_TEST_MODE) {
        // Mock aio-lib-files in test mode in order to avoid having to mock
        // the Azure and Token Vending Machine (TVM) APIs that aio-lib-files uses.
        // The purpose of the tests is to make sure it uses the Photoshop APIs correctly.
        files = new AioLibFilesMock();
    } else {
        files = await libFiles.init();
    }
    const client = await sdk.init(orgId, clientId, accessToken, files);

    const fmt = rendition.instructions.fmt || "jpg";
    const tempFilename = `${uuidv4()}/rendition.${fmt}`;

    // call photoshopActions API
    const options = await setupPhotoshopActionsOptions(client, rendition.instructions, files);
    const result = await client.applyPhotoshopActions(source.url, tempFilename, options);
    console.log('Response from Photoshop API', result);
    if (result && result.outputs && result.outputs[0].status === 'failed') {
        const errors = result.outputs[0].errors;
        console.error('Photoshop API failed:', errors);
        throw new Error(`Photoshop API failed: ${errors.code} ${errors.title}`);
    } 

    // Working with sources and renditions happens through local files,
    // downloading and uploading is handled by the asset-compute-sdk.
    await files.copy(tempFilename, rendition.path, { localDest: true });
    await files.delete(tempFilename);
}, {
    disableSourceDownload: true
});
