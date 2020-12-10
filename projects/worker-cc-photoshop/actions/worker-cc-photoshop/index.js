'use strict';

const { worker } = require('@adobe/asset-compute-sdk');
const sdk = require('@adobe/aio-lib-photoshop-api');
const libFiles = require('@adobe/aio-lib-files')
const fs = require('fs').promises;

const TEMP_FILE = 'output/rendition';

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

exports.main = worker(async (source, rendition, params) => {
    // Authorization
    console.log('Get credentials');
    const { orgId, clientId, accessToken } = getAuthorization(params);
    // initialize sdk
    console.log('Set up photoshop client');
    const files = await libFiles.init();
    const client = await sdk.init(orgId, clientId, accessToken, files);

    const renditionUrl = Array.isArray(rendition.target)? rendition.target[0]: rendition.target;
    const tempFilename = `${TEMP_FILE}.jpg`;

    // call methods
    try {
        console.log('Call photoshop client', renditionUrl);
        const result = await client.applyPhotoshopActions(source.url, tempFilename, { actions: [{
            "href": rendition.instructions.photoshopAction,
            "storage": "external"
          }] });
        console.log('Result from photoshop client', result);
        console.log('Result from photoshop client', JSON.stringify(result.outputs));

    } catch (e) {
        console.error(e)
    }

    // Working with sources and renditions happens through local files,
    // downloading and uploading is handled by the asset-compute-sdk.
    await files.copy(tempFilename, rendition.path, { localDest: true });
    await files.delete(tempFilename);
}, {
    disableSourceDownload: true
});