'use strict';
const { worker, GenericError, SourceUnsupportedError } = require('@adobe/asset-compute-sdk');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const fse = require('fs-extra');

function getCredentials(params) {
    // log whether the params contain Doc Cloud creds for debugging purposes
    // Doc Cloud creds should be from the params (as default params deployed onto the action)
    // in every Nui environment except testing
    if (params.docCloudClientId && params.docCloudClientSecret) {
        console.log('Using Doc Cloud credentials from params');
    }
    const clientId = params.docCloudClientId || process.env.DOC_CLOUD_CLIENT_ID;
    const clientSecret = params.docCloudClientSecret || process.env.DOC_CLOUD_CLIENT_SECRET;

    // for personal accounts
    const base64PrivateKey = params.docCloudPrivateKey || process.env.DOC_CLOUD_PRIVATE_KEY_BASE64;
    const orgId = params.docCloudOrgId || process.env.DOC_CLOUD_ORG_ID;
    const accountId = params.docCloudAccountId || process.env.DOC_CLOUD_ACCOUNT_ID;

    if (base64PrivateKey && clientId && clientSecret && orgId && accountId) {
        const privateKey = Buffer.from(base64PrivateKey, 'base64').toString('utf-8');
        console.log('Using personal account credentials');
        return PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .withClientId(clientId)
            .withClientSecret(clientSecret)
            .withPrivateKey(privateKey)
            .withOrganizationId(orgId)
            .withAccountId(accountId)
            .build();
    } else {
        throw new GenericError('Missing some or all of the necessary credentials.');
    }
}

// validate source exists and is not empty
async function validateSource(sourcePath) {
    let sourceFileExists, sourceFileSize;
    try {
        sourceFileExists = await fse.pathExists(sourcePath);
        sourceFileSize = (await fse.stat(sourcePath)).size;
    } catch (error) {
        console.error(error);
        throw new SourceUnsupportedError('Source file is not accessible');
    }
    if (!sourceFileExists ) {
        throw new SourceUnsupportedError('Source file is missing.');
    }
    if (sourceFileSize <= 0 ) {
        throw new SourceUnsupportedError('Source file is empty.');
    }
}

/**
 * Small wrapper around `worker` asynchronous callback to eliminate testing complexities
 * Additionally to organize code nicely in case we add more pdfservices in the future.
 * (See ex Operation structure above like we do for worker-creative)
 * 
 * Note: The reason this was moved to its own file instead of a non-exported function in worker.js
 * is because `rewire` was causing mocha tests to hang. Additionally `rewire` is not ESM compatible
 * so if we want to move to ESM, we wouldn't be able to use it anyway.
 * https://github.com/jhnns/rewire#limitations
 */
async function getPDFServicesRendition(source, rendition, params={}) {

    // validate source exists and is not empty
    // NOTE: if we start sending urls in the future when pdfservices supports it,
    // this method will have to change
    // TODO: Add mimetype validation?
    await validateSource(source.path);

    // Initial setup, create credentials instance.
    let credentials;
    try {
        credentials = getCredentials(params);
    } catch (error) {
        console.log(error);
        throw new GenericError(`Failed to get credentials for PDF Services: ${error.message || error}`);
    }

    try {
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
        const createPdfOperation = PDFServicesSdk.CreatePDF.Operation.createNew();

        // Set operation input from a source file.
        const input = PDFServicesSdk.FileRef.createFromLocalFile(source.path);
        createPdfOperation.setInput(input);
        
        // Execute the operation and Save the result to the specified location.
        const result = await createPdfOperation.execute(executionContext);
        return result.saveAsFile(rendition.path);
    } catch (err) {
        let errorMessage;
        if(err instanceof PDFServicesSdk.Error.ServiceApiError) {
            // if an API call results in an error response
            // documented here: https://opensource.adobe.com/pdfservices-node-sdk-samples/apidocs/latest/ServiceApiError.html
            console.log('PDFServices Api Error encountered while executing operation:', err.toString());
            errorMessage = `PDFServices ServiceApiError: ${err.toString()}`;
            if (err.getErrorCode() === FILE_CORRUPT_ERROR_CODE) {
                throw new SourceCorruptError(errorMessage);
            }
        } else if (err instanceof PDFServicesSdk.Error.ServiceUsageError) {
            // if service usage limits have been reached or credentials quota has been exhausted
            console.log('PDFServices Api Error encountered while executing operation:',  err.toString());
            errorMessage = `PDFServices ServiceUsageError: ${err.toString()}`;
        } else {
            console.log('Unknown Exception encountered while executing operation', err);
            errorMessage = `PDFServices Unknown Exception encountered: ${err.message}`;
        }
        throw new GenericError(errorMessage);
    }
}

exports.main = worker(async (source, rendition, params) => {
    return getPDFServicesRendition(source, rendition, params); 
});