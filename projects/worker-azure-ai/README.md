# Azure Cognitive Services Workers

Example of an Asset Compute project leveraging the [Azure Cognitive Services API](https://azure.microsoft.com/en-us/services/cognitive-services/). This worker and all of the code originated from Justin Calloway's [internship project](https://git.corp.adobe.com/calloway/azure_worker).

This project contains two workers: `worker-azure-ocr` and `worker-azure-tagging` based on [Project Firefly](https://github.com/AdobeDocs/project-firefly) and the [aio](https://github.com/adobe/aio-cli) developer tool.

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
- App will run on `localhost:9080` by default

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime.

## Test & Coverage

- Run `aio app test` to run unit tests for ui and actions

## Deploy & Cleanup

- `aio app deploy` to build and deploy all actions on Runtime and static files to CDN
- `aio app undeploy` to undeploy the app

## Config

### `.env`

```bash
# This file must not be committed to source control

## please provide your Adobe I/O Runtime credentials
# AIO_RUNTIME_AUTH=
# AIO_RUNTIME_NAMESPACE=

## Credentials needed for using the Asset Compute Developer Tool
## Path to Private Key file for AIO Integration
# ASSET_COMPUTE_PRIVATE_KEY_FILE_PATH=

## Cloud storage credentials for either AWS S3 or Azure Blob Storage
# S3_BUCKET=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AZURE_STORAGE_ACCOUNT=
# AZURE_STORAGE_KEY=
# AZURE_STORAGE_CONTAINER_NAME=
```

### `manifest.yml`

- List your backend actions under the `actions` field within the `__APP_PACKAGE__`
package placeholder. We will take care of replacing the package name placeholder
by your project name and version.
- For each action, use the `function` field to indicate the path to the action
code.
- More documentation for supported action fields can be found
[here](https://github.com/apache/incubator-openwhisk-wskdeploy/blob/master/specification/html/spec_actions.md#actions).

#### Action Dependencies

- You have two options to resolve your actions' dependencies:

  1. **Packaged action file**: Add your action's dependencies to the root
   `package.json` and install them using `npm install`. Then set the `function`
   field in `manifest.yml` to point to the **entry file** of your action
   folder. We will use `parcelJS` to package your code and dependencies into a
   single minified js file. The action will then be deployed as a single file.
   Use this method if you want to reduce the size of your actions.

  2. **Zipped action folder**: In the folder containing the action code add a
     `package.json` with the action's dependencies. Then set the `function`
     field in `manifest.yml` to point to the **folder** of that action. We will
     install the required dependencies within that directory and zip the folder
     before deploying it as a zipped action. Use this method if you want to keep
     your action's dependencies separated.
