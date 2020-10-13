# worker-ccai-colorextract

Example of a custom Asset Compute Metadata worker leveraging the [Content and Commerce AI](https://docs.adobe.com/content/help/en/experience-platform/intelligent-services/content-commerce-ai/overview.html) Color extraction API.

The worker is based on [Project Firefly](https://github.com/AdobeDocs/project-firefly) and the [aio](https://github.com/adobe/aio-cli) developer tool.

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

### Create Firefly Project

Review the [Asset Compute Extensibility Documentation](https://docs.adobe.com/content/help/en/asset-compute/using/extend/understand-extensibility.html) for more detailed information.

- [Setup a developer environment](https://docs.adobe.com/content/help/en/asset-compute/using/extend/setup-environment.html) including the Firefly project
  - Make sure to add _Content and Commerce AI_ Service Account (JWT) API to the workspaces<sup>†</sup>
- Select your Firefly project
- Select the Workspace
- Click on _Download All_ in the top right corner. This will download the _Adobe I/O Developer Console configuration file_

> †: If you canot add JWT to the API, make sure your admin has given you developer access to the _Content and Commerce AI_ product in admin console.

## For AEM integration:

> this step basically allows your intended AEM instance to access _Content and Commerce AI_ via this worker.

- In Adobe IO console, navigate to projects
- Find the project belonging to your AEM instance you intent to use this worker for
  - For example, if your AEMaaCS author URL is `https://author-p1234-e56789.adobeaemcloud.com/aem/start.html` you'll find a project names `AEM-p1234-e56789`
- In that project, Add _Content and Commerce AI_ API service. Use the existing JWT auth for it.
- In that project overview, click _Download_ button to download the _Adobe I/O Developer Console configuration file_


### Deploy

- Download the sources of this repository
- Go to the `worker-ccai-colorextract` directory
- Run `npm install`
- Run `aio app use <Path to Adobe I/O Developer Console configuration file>`
  - This will setup your `.env` to point at the Firefly project and workspace
  - this is the file downloaded from the _firefly project YOU created_. Not the other existing AEM one.
- run `aio app use <Path to Adobe I/O Developer Console configuration file>`
  - This is the file downloaded from the _AEM instance firefly project_.
  - When asked about existing `.env` and `.aio` select `m` or `merged`
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
