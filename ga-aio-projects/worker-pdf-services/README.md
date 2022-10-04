# worker-pdf-services

Worker for calling PDF Services API

Documentation: https://developer.adobe.com/document-services/apis/pdf-services/

## Getting Credentials
1. Navigate to [PDF services documentation](https://developer.adobe.com/document-services/apis/pdf-services/).
2. Click on `Start free trial` (make sure to login with a non-enterprise email, we suggest a personal email)
3. Follow instructions to create new credentials

## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `aio app run` to start your local Dev server
- App will run asset compute devtool

### Example Rendition Object
#### Create PDFs
```
{
    "renditions": [
        {
            "worker": "https://mynamespace.adobeioruntime.net/api/v1/web/dx-asset-compute-worker-1/worker-pdf-services",
            "name": "rendition.pdf",
            "fmt": "pdf",
            "operation": "createPDF"
        }
    ]
}
```
### Export PDFs
api: https://developer.adobe.com/document-services/docs/apis/#tag/Export-PDF

supported formats: doc, docx, pptx, xlsx, rtf

```
{
    "renditions": [
        {
            "worker": "https://mynamespace.adobeioruntime.net/api/v1/web/dx-asset-compute-worker-1/worker-pdf-services",
            "name": "rendition.docx",
            "fmt": "docx",
            "operation": "exportPDF"
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

## Nodejs SDK Personal Account Creds
# DOC_CLOUD_CLIENT_ID=
# DOC_CLOUD_CLIENT_SECRET=
# DOC_CLOUD_ORG_ID=
# DOC_CLOUD_ACCOUNT_ID=
# DOC_CLOUD_PRIVATE_KEY_BASE64=
```
- to base64 your private key, use `base64 -i <path-to-private.key>`

## Debugging in VS Code

While running your local server (`aio app run`), both UI and actions can be debugged, to do so open the vscode debugger
and select the debugging configuration called `WebAndActions`.
Alternatively, there are also debug configs for only UI and each separate action.

## Typescript support for UI

To use typescript use `.tsx` extension for react components and add a `tsconfig.json` 
and make sure you have the below config added
```
 {
  "compilerOptions": {
      "jsx": "react"
    }
  } 
```
