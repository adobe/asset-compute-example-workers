# worker-ccai

Example of a custom Asset Compute Metadata worker leveraging the [Content and Commerce AI](https://docs.adobe.com/content/help/en/experience-platform/intelligent-services/content-commerce-ai/overview.html) Color extraction API.

It returns the following types of metadata:

| Name | Metadata Type | Description |
| ---- | ------------- | ----------- |
| `ccai:colorNames` | Multi Value Text | List of color names sorted by coverage percentage (high to low) |
| `ccai:colors` | Sequence of structs | List of colors (name, coverage percentage, red, green, blue) |

The worker is based on [Project Firefly](https://github.com/AdobeDocs/project-firefly) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)

## Test

This runs the worker test cases located in [tests](tests) using [aio](https://github.com/adobe/aio-cli):

```bash
npm test
```

## Create Firefly Project

Review the [Asset Compute Extensibility Documentation](https://docs.adobe.com/content/help/en/asset-compute/using/extend/understand-extensibility.html) for more detailed information.

* [Setup a developer environment](https://docs.adobe.com/content/help/en/asset-compute/using/extend/setup-environment.html) including the Firefly project
  * Make sure to add _Content and Commerce AI_ Service Account (JWT) API to the workspaces
* Select your Firefly project
* Select the Workspace
* Click on _Download All_ in the top right corner. This will download the _Adobe I/O Developer Console configuration file_

## Deploy

* Download the sources of this repository
* Go to the `worker-ccai` directory
* Run `npm install`
* Run `aio app use <Path to Adobe I/O Developer Console configuration file>`
  * This will setup your `.env` to point at the Firefly project and workspace
* Run `aio app deploy` to deploy the application

## Integrating with AEM Cloud Service

### Create a Processing Profile

* From the AEM homepage, navigate to Tools -> Assets -> Processing profiles -> Create
* Select the Custom tab
* Enable _Create Metadata Rendition_
* For _Endpoint URL_, input the URL of the worker as seen after running `aio app deploy`
* Click on Save
  
### Associate Processing Profile with Folder

* Select the created Processing Profile
* Click on _Apply Profile to Folder(s)_
* Select a folder
* Click on _Apply_

### Update Metadata Schema

* From the AEM homepage, navigate to Tools -> Assets -> Metadata Schemas
* Select an existing schema like _default_ and click on _Edit_ or click _Create_
* Click on `+` to add a new _Content and Commerce AI_ tab
* Click on "Build Form"
* Drag "Multi Value Text" on the form
  * Name: `Color Extraction List`
  * Map to property: `./jcr:content/metadata/ccai:colorNames`
* Click on Save

### End to end test

* Upload a PNG or JPG to the folder that has the _Processing Profile_ associated with it
* Wait for the asset to stop processing
* Select the asset
* Click on _Properties_
* Switch to the _Content and Commerce AI_ tab
* You should see the list of extracted colors
