# worker-basic

Simple example of a 3rd party Asset Compute worker. It generates a rendition by simply [copying](https://github.com/adobe/asset-compute-example-workers/blob/master/projects/worker-basic/worker-basic.js#L19) the source file.

It is based on [App Builder](https://developer.adobe.com/app-builder/) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)

### Test
This runs the worker test cases located in [tests](tests) using [aio](https://github.com/adobe/aio-cli):

```
npm test
```
