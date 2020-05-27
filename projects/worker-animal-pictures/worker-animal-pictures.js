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
const { RenditionFormatUnsupportedError } = require('@adobe/asset-compute-sdk/errors');
const { downloadFile } = require('@adobe/httptransfer');
const urls = require('./lib/urls');

function getUrl(animal) {
    switch (animal) {
    case 'cat':
        return urls.cat;
    case 'dog':
        return urls.dog;
    case 'elephant':
        return urls.elephant;
    case 'bear':
        return urls.bear;
    default:
        // throw an error if animal is not valid
        throw new RenditionFormatUnsupportedError('Invalid animal requested, must be one of: `cat`, `dog`, `elephant`, `bear`');
    }
}

async function renditionCallback(source, rendition) {

    // rendition instructions are stored in `rendition.instructions`
    const requestedAnimal = rendition.instructions.animal;
    console.log('Requesting photo of animal: ', requestedAnimal);

    const url = getUrl(requestedAnimal);

    // download file and store it in `rendition.path`
    await downloadFile(url, rendition.path);

}

exports.main = worker(renditionCallback , {
    disableSourceDownload: true // source is not used in this worker, no need to download
});
