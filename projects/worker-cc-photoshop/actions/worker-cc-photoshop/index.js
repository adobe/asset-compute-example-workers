'use strict';

const { worker } = require('@adobe/asset-compute-sdk');
const sdk = require('@adobe/aio-lib-photoshop-api');
const libFiles = require('@adobe/aio-lib-files');
const { v4: uuidv4 } = require("uuid");

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
    const { orgId, clientId, accessToken } = getAuthorization(params);

    // initialize sdk
    const files = await libFiles.init();
    const client = await sdk.init(orgId, clientId, accessToken, files);
    
    const fmt = rendition.fmt || "jpg";
    const tempFilename = `${uuidv4()}/rendition.${fmt}`;

    // call methods
    console.log('Call photoshop client', tempFilename);
    const result = await client.applyPhotoshopActions(source.url, tempFilename, { actions: rendition.instructions.photoshopActions });
    console.log('Result from photoshop client', result);
    console.log('Result from photoshop client', JSON.stringify(result.outputs));

    // Working with sources and renditions happens through local files,
    // downloading and uploading is handled by the asset-compute-sdk.
    await files.copy(tempFilename, rendition.path, { localDest: true });
    await files.delete(tempFilename);
}, {
    disableSourceDownload: true
});