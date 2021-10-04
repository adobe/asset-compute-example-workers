# worker-metadata

Example of a 3rd party Asset Compute Metadata worker. It provides examples of generating various types of metadata:

| Name | Metadata Type | Description |
| ---- | ------------- | ----------- |
| `ns1:name` | Single Line Text | Name of the source file |
| `ns1:supportedAnimals` | Multi Value Text | List of supported animals |
| `ns1:filesize` | Number | Size of the source file | 
| `ns1:date` | Date | Example of a date field, fixed to `2020-08-28T03:24:00` |
| `ns1:requestedAnimal` | Text/Enum | One of the selected animals (defaults to `bear`) |
| `ns1:url` | Text/URL | Example of a url field, fixed to <http://www.adobe.com> |

The generated metadata is merged with the XMP metadata extracted from the asset by AEM. Custom metadata can be shown in AEM by adding a new or modifying an existing [Metadata Schema Form](https://docs.adobe.com/content/help/en/experience-manager-65/assets/administer/metadata-schemas.html).

The worker is based on [App Builder](https://developer.adobe.com/app-builder/) and the [aio](https://github.com/adobe/aio-cli) developer tool.

## Install

Requirements:

* [aio cli](https://github.com/adobe/aio-cli)

### Test

This runs the worker test cases located in [tests](tests) using [aio](https://github.com/adobe/aio-cli):

```bash
npm test
```

### Custom Parameters

**`animal`**

An animal (`string`) value from the following list:

* `dog`
* `cat`
* `elephant`
* `bear`

This worker will use the custom parameter `animal` and return it in the `ns1:requestedAnimal` metadata property. If `animal` is not specified, it defaults to `bear`. If `animal` is not on the list the worker will throw a `RenditionFormatUnsupported` error.
