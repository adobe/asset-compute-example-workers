"use strict";

const { worker, GenericError } = require("@adobe/asset-compute-sdk");
const fetch = require("node-fetch");
const fs = require('fs').promises;

const DEFAULT_LANGUAGE = "en";

exports.main = worker(async (source, rendition, params) => {
    console.log('Azure tagging worker.');
    // get Azure credentials for API
    let subscriptionKey = params && params.AZURE_OCP_KEY;
    let endpoint = params && params.AZURE_OCP_ENDPOINT;

    // WORKER_TEST_MODE is true when you are running worker unit
    // tests using the `test-worker` command
    // Dummy authorization parameters needed for mocks 
    if (process.env.WORKER_TEST_MODE) {
        subscriptionKey = "test-azure-key";
        endpoint = "https://westus.api.cognitive.microsoft.com/";
    }

    // format and execute API request
    const language = (rendition.instructions && rendition.instructions.language) || DEFAULT_LANGUAGE;
    const url = `${endpoint}vision/v3.0/analyze?details=Celebrities&language=${language}`;
    const options = {
        method:"POST",
        body: JSON.stringify({
            url: source.url
        }),
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key" : subscriptionKey
        }
    };
    console.log(`Running azure ocr request with source url: ${source.url}; endpoint:${url}`);
    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    console.log('JSON response', jsonResponse);
    if (jsonResponse.code || jsonResponse.error) {  
        // Format error code and message like the following:
        // `The Azure OCR API failed with FailedToProcess: Could not extract image features`
        throw new GenericError(`The Azure Analyze Image Api failed with ${jsonResponse.code}: ${JSON.stringify(jsonResponse.error)}`);
    }

    await fs.writeFile(rendition.path, JSON.stringify(jsonResponse));
}, {
    disableSourceDownload: true // source presigned url is passed directly to azure api
});