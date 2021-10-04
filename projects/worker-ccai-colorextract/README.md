# worker-ccai-colorextract

Example of a custom Asset Compute Metadata worker leveraging the [Content and Commerce AI](https://docs.adobe.com/content/help/en/experience-platform/intelligent-services/content-commerce-ai/overview.html) Color extraction API.

The worker is based on [App Builder](https://developer.adobe.com/app-builder/) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Metadata

The worker returns the following metadata:

| Name | Metadata Type | Description |
| ---- | ------------- | ----------- |
| `ccai:colorNames` | Multi Value Text | List of color names with percentages  |
| `ccai:colorRGB` | Multi Value Text | List of [web colors](https://en.wikipedia.org/wiki/Web_colors) with percentages |
| `ccai:colors` | Sequence of XMP structs | List of color features, with fields `ccai:name`, `ccai:percentage`, `ccai:red`, `ccai:green`, and `ccai:blue`. Intended for advanced AEM customizations. |

The lists have the same order and are sorted from high to low coverage percentage.

This means at index 0:

- `ccai:colorNames` has the name of the most prevalent color with its coverage percentage, e.g. `Orange, 15%`
- `ccai:colorRGB` has the most prevalent RGB value represented as a [web color](https://en.wikipedia.org/wiki/Web_colors) with its coverage percentage, e.g. `#c7b491, 15%`

## Setup

Requirements:

- Access to [Content and Commerce AI](https://docs.adobe.com/content/help/en/experience-platform/intelligent-services/content-commerce-ai/overview.html) in the [Adobe Developer Console](https://console.adobe.io).
- [Node.js](https://nodejs.org/en/)
- [aio cli](https://github.com/adobe/aio-cli)

### Create App Builder Project

Review the [Asset Compute Extensibility Documentation](https://docs.adobe.com/content/help/en/asset-compute/using/extend/understand-extensibility.html) for more detailed information.

- [Setup a developer environment](https://docs.adobe.com/content/help/en/asset-compute/using/extend/setup-environment.html) including the App Builder project
  - Make sure to add _Content and Commerce AI_ Service Account (JWT) API to the workspaces
- Select your App Builder project
- Select the Workspace
- Click on _Download All_ in the top right corner. This will download the _Adobe I/O Developer Console configuration file_

### Deploy

- Download the sources of this repository
- Go to the `worker-ccai-colorextract` directory
- Run `npm install`
- Run `aio app use <Path to Adobe I/O Developer Console configuration file>`
  - This will setup your `.env` file to point at the App Builder project and workspace
- Run `aio app deploy` to deploy the application

### Review logs

- Use `aio app logs` to review the logs of the most recent invocation

## Integrating with AEM Cloud Service

### Create a Processing Profile

- From the AEM homepage, navigate to Tools -> Assets -> Processing profiles -> Create
- Select the Custom tab
- Enable _Create Metadata Rendition_
- For _Endpoint URL_, input the URL of the worker as seen after running `aio app deploy`
- Click on Save
  
### Associate Processing Profile with Folder

- Select the created Processing Profile
- Click on _Apply Profile to Folder(s)_
- Select a folder
- Click on _Apply_

### Update Metadata Schema

- From the AEM homepage, navigate to Tools -> Assets -> Metadata Schemas
- Select an existing schema like _default_ and click on _Edit_ or click _Create_
- Click on `+` to add a new _Content and Commerce AI_ tab
- Click on _Build Form_, Drag _Multi Value Text_ to the first column of the form
  - Name: `Color Names`
  - Map to property: `./jcr:content/metadata/ccai:colorNames`
- Click on _Build Form_, Drag _Multi Value Text_ to the third column of the form
  - Name: `Color RGB`
  - Map to property: `./jcr:content/metadata/ccai:colorRGB`
- Click on Save

### End to end test

- Upload a PNG or JPG to the folder that has the _Processing Profile_ associated with it
- Wait for the asset to stop processing
- Click on the asset
- Click on _Properties_
- Switch to the _Content and Commerce AI_ tab
