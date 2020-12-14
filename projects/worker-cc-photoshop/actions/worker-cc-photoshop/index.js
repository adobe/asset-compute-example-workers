'use strict';

const { worker } = require('@adobe/asset-compute-sdk');
const sdk = require('@adobe/aio-lib-photoshop-api');
const libFiles = require('@adobe/aio-lib-files');
const { v4: uuidv4 } = require("uuid");
const { AioLibFilesMock } = require("../../lib/mock-aio-lib-files");

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

    // call methods
    if (!rendition.instructions.photoshopAction) {
        throw Error("Photoshop Action url not provided");
    }
    const result = await client.applyPhotoshopActions(source.url, tempFilename, { actions: rendition.instructions.photoshopAction });

    if (result && result.outputs && result.outputs[0].status === 'failed') {
        const errors = result.outputs[0].errors;
        console.error(errors);
        throw new Error(`Photoshop API failed: ${errors.code} ${errors.title}`);
    } 

    // Working with sources and renditions happens through local files,
    // downloading and uploading is handled by the asset-compute-sdk.
    await files.copy(tempFilename, rendition.path, { localDest: true });
    await files.delete(tempFilename);
}, {
    disableSourceDownload: true
});