# CC Photoshop Api Worker

## Overview

The CC Photoshop Api Worker wraps the Photoshop APIs to be used by AEM. It is built on using [aio-lib-photoshop](https://github.com/adobe/aio-lib-photoshop-api).

It provides the following functionality:

- [Run a Photoshop Action](#photoshop-action) on a photo

## Enabling the APIs in I/O Console

In order to utilize these APIs, the APIs are added to the existing Asset Compute I/O Console integration that is automatically created by Cloud Manager on behalf of the user. Authentication is done service to service through a JWT created based on the technical account associated with the I/O Console integration. This all done behind the scenes by AEM already. The following APIs exposed in I/O Console are used:

- Photoshop API - Creative Cloud Automation Services

These can be enabled in a AEM Cloud environment by following these steps:

- Log in to <https://console.adobe.io/>
- Switch to the correct organization in the top right corner
- Switch to the Projects page
- Find the AEM Cloud environment, once found click on the AEM Cloud environment
  - You should see the overview page with the Products & Services: I/O Management API, Asset Compute, I/O Events, Experience Platform Launch API, and Asset Compute Journal
- Add _Photoshop API - Creative Cloud Automation Services_:
  - Click on _Add to Project_
  - Select _API_
  - Click on _Photoshop API - Creative Cloud Automation Services_
  - Click on _Next_
  - Select _Service Account (JWT)_
  - Click on _Next_, which takes you to the Create a new Service Account (JWT) credential
    - The public key is already provided
  - Click on _Next_
  - Select _Default Creative Cloud Automation Services configuration_
  - Click on _Save configured API_

## Limitations

- Creative Automation APIs do not support multi-part upload and only support a single URL. This means outputs larger than 100MB on Azure are not currently supported.
- The Creative Processing Profile UI in AEM only supports a single operation

## API
### Photoshop Action

Supported formats:

- Input: `png`, `jpeg`, `psd`
- Output: `png`, `jpeg`, `psd`

```json
{
    "worker": "<custom-worker-url>",
    "name": "rendition.jpg",
    "fmt": "jpg",
    "photoshopActions": "presigned-url"
}
```


## Setup

- Populate the `.env` file in the project root and fill it as shown [below](#env)

## Local Dev

- `aio app run` to start your local Dev server
- App will run on `localhost:9080` by default

By default the UI will be served locally but actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `aio app run --local` option.

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
