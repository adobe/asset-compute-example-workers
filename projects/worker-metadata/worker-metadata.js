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
const { serializeXmp } = require('@adobe/asset-compute-xmp');
const fs = require('fs').promises;

exports.main = worker(async (source, rendition) => {
    const stat = await fs.stat(source.path);

    // animal parameter example
    const supportedAnimals = ['cat', 'dog', 'elephant', 'bear'];
    const requestedAnimal = rendition.instructions.animal || 'bear';
    if (supportedAnimals.indexOf(requestedAnimal) === -1) {
        throw new RenditionFormatUnsupportedError('Invalid animal requested, must be one of: `cat`, `dog`, `elephant`, `bear`');
    }

    // serialize as XMP metadata
    const xmp = serializeXmp({
        "ns1:name": source.name,
        "ns1:supportedAnimals": supportedAnimals,
        "ns1:filesize": stat.size,
        "ns1:date": new Date('2020-08-28T03:24:00'),
        "ns1:requestedAnimal": requestedAnimal,
        "ns1:url": "http://www.adobe.com"
    }, { namespaces: {
        ns1: "https://example.com/schema/worker-metadata"
    }});

    // save the XMP metadata to disk
    await fs.writeFile(rendition.path, xmp, "utf-8");
});
