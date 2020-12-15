[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Travis](https://travis-ci.com/adobe/asset-compute-example-workers.svg?branch=master)](https://travis-ci.com/adobe/asset-compute-example-workers)

# Asset Compute Worker Examples

In the `projects` directory, you will find examples of Asset Compute workers that are based on [Project Firefly](https://github.com/AdobeDocs/project-firefly) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## [worker-basic](projects/worker-basic)

Simple example of a 3rd party Asset Compute worker. It generates a rendition by simply copying the source file.

## [worker-animal-pictures](projects/worker-animal-pictures)

Example of a 3rd party Asset Compute worker that produces renditions from an HTTP request to an external API based on an incoming parameter.

## [worker-metadata](projects/worker-metadata)

Example of a 3rd party Asset Compute Metadata worker. It provides examples of generating various types of metadata.

## [worker-ccai-colorextract](projects/worker-ccai-colorextract)

Example of a custom Asset Compute Metadata worker leveraging the [Content and Commerce AI](https://docs.adobe.com/content/help/en/experience-platform/intelligent-services/content-commerce-ai/overview.html) Color extraction API.

## [worker-cc-photoshop](projects/worker-cc-photoshop)

Example of a custom Asset Compute worker that leverages [Adobe I/O Photoshop API SDK](https://github.com/adobe/aio-lib-photoshop-api) to create asset rendition that is a result of applying a selected Photoshop Action to the uploaded source asset.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.


## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
