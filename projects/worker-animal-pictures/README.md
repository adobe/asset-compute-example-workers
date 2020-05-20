# worker-animal-pictures

Example of a 3rd party Asset Compute worker. `worker-animal-pictures` produces renditions from an HTTP request to an external API based on an incoming parameter.

It is based on [Project Firefly](https://github.com/AdobeDocs/project-firefly) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)

### Test

This executes eslint and the worker test cases located in [tests](tests):

```
npm test
```

### Custom Parameters

**`animal`**

An animal (`string`) value from the following list:
- `dog`
- `cat`
- `elephant`
- `bear`

This worker relies on the custom parameter `animal` to determine what animal photo to fetch. If `animal` is not specified, undefined, or you choose an animal not on the list, this worker will throw a `RenditionFormatUnsupported` error.
