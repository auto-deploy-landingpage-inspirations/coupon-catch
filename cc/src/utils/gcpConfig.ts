import { DocumentProcessorServiceClient } from '@google-cloud/documentai';


// const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
import fs from 'fs';


/**
 * Runs the sample document through Document AI to get key/value pairs and
 * confidence scores.
 */

export async function processDocument(filePath: string, mimeType: string): Promise<any> { 
    // Instantiates a client
    const documentaiClient = new DocumentProcessorServiceClient();

    // Hardcoded values
    const projectId = 'couponcatch-e211e';
    const location = 'us'; // Format is 'us' or 'eu'
    const processorId = '4819da9fa4c4a4ee'; // Should be a Hexadecimal string

    // The full resource name of the processor, e.g.:
    // projects/project-id/locations/location/processor/processor-id
    // You must create new processors in the Cloud Console first
    const resourceName = documentaiClient.processorPath(projectId, location, processorId);

    // Read the file into memory.
    const imageFile = fs.readFileSync(filePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    // Load Binary Data into Document AI RawDocument Object
    const rawDocument = {
        content: encodedImage,
        mimeType: mimeType,
    };

    // Configure ProcessRequest Object
    const request = {
        name: resourceName,
        rawDocument: rawDocument
    };

    // Use the Document AI client to process the sample form
    const [result] = await documentaiClient.processDocument(request);
                                                                                                                                                                                                                                            
    return result.document;
}

/**
 * Run the codelab.
 */
async function main() {

    // Supported File Types
    // https://cloud.google.com/document-ai/docs/processors-list#processor_form-parser
    let filePath = 'form.pdf'; // The local file in your current working directory
    let mimeType = 'application/pdf';

    const document = await processDocument(filePath, mimeType);

    console.log("Document Processing Complete");

    // Print the document text as one big stri ng
    console.log(`Text: ${document.text}`);
}

main().catch(err => {
    console.error(err);
    // Note: `process.exitCode = 1;` is also Node.js specific and will not work in a browser.
    // You might want to handle the error differently here.
});



// import { functions } from 'firebase/app';

// ... Inside an async function where you handle the document upload

try {
  const processDocumentFunction = functions.httpsCallable('processDocument');
  const result = await processDocumentFunction({ fileData }); // Where fileData is the information or binary data of the file you want to process
  console.log(result.data); // The processed document data from your Cloud Function
} catch (error) {
  console.error('Error calling the Cloud Function', error);
}
