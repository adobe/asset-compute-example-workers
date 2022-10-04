# Azure Cognitive Services Workers

Example of an Asset Compute project leveraging the [Azure Cognitive Services API](https://azure.microsoft.com/en-us/services/cognitive-services/). All of the code in this worker originated from Justin Calloway's [internship project](https://git.corp.adobe.com/calloway/azure_worker).

This project contains two workers: `worker-azure-ocr` and `worker-azure-tagging` based on [App Builder](https://developer.adobe.com/app-builder/) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## worker-azure-ocr

This worker uses the [Azure OCR API](https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/quickstarts/node-print-text).


## worker-azure-tagging

This worker uses the [Azure Analyze Image API](https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/quickstarts/node-analyze).


## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)
- Additionally, the following credentials are needed for calling these APIs:

```
# Azure Cognitive services keys
AZURE_OCP_KEY=<key>
AZURE_OCP_ENDPOINT=https://<region>.api.cognitive.microsoft.com/
```

## Local Dev

- `aio app run` to start your local Dev server
- App will run asset compute devtool

### Example Rendition Object
```
{
    "renditions": [
        {
            "worker": "https://mynamespace.adobeioruntime.net/api/v1/web/dx-asset-compute-worker-1/worker-azure-ocr",
            "name": "rendition.json"
        },
        {
            "worker": "https://mynamespace.adobeioruntime.net/api/v1/web/dx-asset-compute-worker-1/worker-azure-tagging",
            "name": "rendition.json"
        }
    ]
}
```

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions
- Run `aio app test --e2e` to run e2e tests

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `.env`

You can generate this file using the command `aio app use`. 

```bash
# This file must **not** be committed to source control

## please provide your Adobe I/O Runtime credentials
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=
```

