'use strict';

const { worker, GenericError } = require('@adobe/asset-compute-sdk');
const fetch = require('node-fetch');
const fs = require('fs');

async function renditionCallback(source, rendition, params) {
    // get Azure credentials for API
    let subscriptionKey = params.AZURE_OCP_KEY;
    let endpoint = params.AZURE_OCP_ENDPOINT;

    // prevents tests from failing due to credentials not being set
    if (process.env.WORKER_TEST_MODE) {
        subscriptionKey = "KEY";
        endpoint = "https://westus.api.cognitive.microsoft.com/";
    }

    // check that credentials are set before calling API
    if (!subscriptionKey) { throw new GenericError('Please provide the subscription key'); }
    if (!endpoint) { throw new GenericError('Please provide the endpoint'); }

    // gets language from Nui request.  If not sprecified, default to English
    const requestedLang = (rendition.instructions && rendition.instructions.language) || "en";

    const uriBase = `${endpoint}vision/v3.0/analyze?details=Celebrities&language=${requestedLang}`;

    // set params for API call
    let options = {
        method:'POST',
        body: JSON.stringify({"url": source.url}),
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };

    try {
        const start = Date.now();
        const resp = await fetch(uriBase, options);
        const azureApiDuration = Date.now() - start;
        params.metrics.add({ azureApiDuration: azureApiDuration })
        let jsonResponse = await resp.json();
        if (jsonResponse.code || jsonResponse.error) {  
            // check if API returned an error     
            const error = jsonResponse.code ? jsonResponse.code : jsonResponse.error.code;
            throw new Error(error);
        }
        jsonResponse = JSON.stringify(jsonResponse.categories, null, ' '); // necessary to keep this line so the unit tests pass
        console.log('response json', jsonResponse);
        fs.writeFileSync(rendition.path, jsonResponse);
        return(jsonResponse);
    } catch (e) {
        throw new GenericError('The Azure Analyze Image API call returned an error: ' + e.message);
    }
}
exports.main = worker(renditionCallback);