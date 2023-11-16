/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
/* eslint-disable */
import {onObjectFinalized} from "firebase-functions/v2/storage";
// import {onRequest} from "firebase-functions/v2/https";
// import {getStorage} from "firebase/storage";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
// import { collection, addDoc } from "firebase/firestore"; 
import {DocumentProcessorServiceClient} from "@google-cloud/documentai";
// import { getFirestore } from "firebase/firestore";

admin.initializeApp();

// Google Cloud Document AI and Storage client instantiation
const documentAIclient = new DocumentProcessorServiceClient();
// const storageClient = new Storage();

// Constants for Document AI processor
const projectId = "couponcatch-e211e";
const location = "us";
const processorId = "2a5b61d202514f1d";

// This function is triggered when a new object is finalized in Firebase Storage
exports.processImageOnUpload = onObjectFinalized(
  {
    bucket: "couponcatch-e211e.appspot.com",
    memory: "2GiB",
  },
  async (event) => {
    // Get the file uploads data
    const fileBucket = event.data.bucket; // Storage bucket containing the file.
    const filePath = event.data.name; // File path in the bucket.
    const segments = filePath.split('/');
    const userUid = segments[1]; // The UID is the second segment
    logger.log(userUid)
    const contentType = event.data.contentType; // File content type.
    // VALIDATION
    // Exist if the file is NOT in the "uploadedReceipts/" directory
    if (!filePath.startsWith("uploadedReceipts/")) {
      logger.log("File does not start with 'uploadedReceipts/'. Skipping...");
      return null;
    }

    // Exit if this is triggered on a file that is NOT an image.
    if (!contentType || !contentType.startsWith("image/")) {
      return logger.log("This is not an image.");
    } else {
      logger.log("This is an image.");
    }

    // Log the event details
    logger.info("Heres what we know about the file uploaded by user:", {
      bucket: fileBucket,
      filePath: filePath,
      contentType: contentType,
    });

    // Get a reference to the Storage bucket
    const bucket = admin.storage().bucket(fileBucket);
    let textFromDoc = "";

    // blob and then document ai
    try {
      // Download the file into memory from Firebase Storage bucket
      const downloadResponse = await bucket.file(filePath).download();
      const imageBuffer = downloadResponse[0]; // This is your image file as a buffer
      logger.log("Image downloaded from Firebase Storage.");

      // Convert the image data to a Buffer and base64 encode it
      const encodedImage = imageBuffer.toString("base64");

      // Create the request for Document AI processing
      const request = {
        name: `projects/${projectId}/locations/${location}/processors/${processorId}`,
        rawDocument: {
          content: encodedImage,
          // change the mime_type if needed to the last portion after a split(".") of the filePath
          mimeType: "image/png", // or whichever is appropriate for your image type
        },
      };

      // Recognizes text entities in the image document
      const [result] = await documentAIclient.processDocument(request);
      // const { document } = result;

      if (result.document) {
        textFromDoc = result.document.text || '';
            // Remove the stupid fucking "E"s
            const regex = /(^|\s)([AEF]{1,30})/g;

             // Replace the matched patterns with an empty string
             textFromDoc = textFromDoc.replace(regex, '');

        // const getText = (textAnchor: any): string => {
        //     if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        //         return '';
        //     }
    
        //     const startIndex = textAnchor.textSegments[0].startIndex || 0;
        //     const endIndex = textAnchor.textSegments[0].endIndex;
        //     return documentText.substring(startIndex, endIndex);
        // };
    
        // logger.log('The document contains the following paragraphs:');
        // if (result.document.pages) {
        //     // Make sure pages is iterable
        //     for (const page of result.document.pages) {
        //         if (page.paragraphs) {
        //             for (const paragraph of page.paragraphs) {
        //                 // Check if paragraph.layout and paragraph.layout.textAnchor are not null or undefined
        //                 if (paragraph.layout && paragraph.layout.textAnchor) {
        //                     const paragraphText = getText(paragraph.layout.textAnchor);
        //                     logger.log(`Paragraph text:\n${paragraphText}`);
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    } catch (error) {
      logger.error("Error downloading file from Firebase Storage:", error);
      return; // Exit if there's an error
    }

    // RegEx the resulting pile of text:
    let text = textFromDoc;

    // Remove "E"s
    const regex = /(^|\s)([AEF]{1,30})/g;

    // Replace the matched patterns with an empty string
    text = text.replace(regex, '');
    logger.log("documentText after E's removed:", text);

    // Member number starts with 111, a 9, or an 8 and is 9+ characters long, followed by a space or end of the line/string
    const memberNumberRegex = /Member\s+(111|9|8)\d{6,}\b/i;
    let memberNumber: string | null = null;

    const memberNumberMatch = text.match(memberNumberRegex);
    if (memberNumberMatch && memberNumberMatch[0]) {
        const digitsMatch = memberNumberMatch[0].match(/\d+/);
        if (digitsMatch) {
            memberNumber = digitsMatch[0];
        }
    }
    text = text.replace(memberNumberRegex, '');
    
    // Store name always appears before the # sign
    // Lets change this regex so that it matches one or two words before the # sign that are stylized where the First letter of each work is capitalized
    const storeNameRegex = /\b([A-Z][a-z]*\s?(?:[A-Z][a-z]*)?)\s*#/;
    const storeNameMatch = text.match(storeNameRegex);
    const storeName = storeNameMatch ? storeNameMatch[1].trim() : null;
    
    // Store number always appears after the # sign
    const storeNumberRegex = /#\s*(\d+)/;
    const storeNumberMatch = text.match(storeNumberRegex);
    const storeNumber = storeNumberMatch ? storeNumberMatch[1].trim() : null;
    text = text.replace(storeNumberRegex, '');
    text = text.replace(storeNameRegex, '');
    
    // Regex to match the address pattern including ZIP code
    // We expect the address to be preceded by a store number and a # sign (e.g., "#629")
    // and followed by a street name, city, state abbreviation, and a 5-digit ZIP code
    const addressRegex = /#\d{1,4}\s+([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/;
    // Extract address including ZIP code
    const addressMatch = text.match(addressRegex);
    const storeAddress = addressMatch ? addressMatch[1].trim() : null;
    text = text.replace(addressRegex, '');

    // Sequence of four numbers each separated by a space and always after a time (xx:xx)
    const numberSequenceRegex = /(?:\d{1,2}:\d{2}.*?)(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/s;
    const numberSequenceMatch = text.match(numberSequenceRegex);

    // Assign each number to a variable
    // only assign this to storeNumber if storeNumber hasnt already been assigned
    // const storeNumber = numberSequenceMatch ? numberSequenceMatch[1] : null;
    const terminalNumber = numberSequenceMatch ? numberSequenceMatch[2] : null;
    const transactionNumber = numberSequenceMatch ? numberSequenceMatch[3] : null;
    const operatorNumber = numberSequenceMatch ? numberSequenceMatch[4] : null;
    text = text.replace(numberSequenceRegex, '');

    // Regex to match the number of items sold
    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    // Extract number of items sold
    const itemsSoldMatch = text.match(itemsSoldRegex);
    const numberOfItems = itemsSoldMatch ? parseInt(itemsSoldMatch[1], 10) : null;
    text = text.replace(itemsSoldRegex, '');

    // Regular expression to match date and time in the format "MM/DD/YYYY HH:MM"
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;
    const dateMatch = text.match(dateRegex);
    const dateOfPurchase = dateMatch ? dateMatch[1] : null;
    text = text.replace(dateRegex, "");
    
    // Regular expression for time
    const timeRegex = /(\d{2}:\d{2})/;
    const timeMatch = text.match(timeRegex);
    const timeOfPurchase = timeMatch ? timeMatch[1] : null;
    text = text.replace(timeRegex, "");

    // Extract total puchase price from lines line "AMOUNT: $104.18" or similar
    const totalAmountRegex = /AMOUNT: *\$(\d+\.\d{2})/;
    // Extract total amount from text
    const totalAmountMatch = text.match(totalAmountRegex);
    const totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : null;
    text = text.replace(totalAmountRegex, '');
    
    // Make an array of coupon amounts, in order. get coupons first since it removes them from text, then do regular prices
    const couponAmountsRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}-\b/g;
    let couponAmountsRegexMatch;
    const couponAmounts = [];
    
    while ((couponAmountsRegexMatch = couponAmountsRegex.exec(text)) !== null) {
        // Remove the trailing '-' from the matched string before adding to the array
        const amount = couponAmountsRegexMatch[0].slice(0, -1);
        couponAmounts.push(amount);
    }
    text = text.replace(couponAmountsRegex, '');

    // Make an array of non-coupon dollar amounts, in order
    const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b/g;
    let dollarAmountsRegexMatch;
    const dollarAmounts = [];

    while ((dollarAmountsRegexMatch = dollarAmountsRegex.exec(text)) !== null) {
        dollarAmounts.push(dollarAmountsRegexMatch[0]);
    }
    text = text.replace(dollarAmountsRegex, '');
    
    // Remove any empty lines from the text
    text = text.replace(/^\s*[\r\n]/gm, '');

    logger.log("text remaining before line item extraction:", text);

    // Extract non-coupon item lines and add to items array
    const lineItemRegex = /(\d{1,7})\s+((?:[A-Z]\s*){3,}[A-Z\s]*)\s*/g;

    let lineItemRegexMatch;
    interface IItem {
        itemNumber: string,
        itemDesc: string,
        couponNum?: string,
        couponAmt?: string,
        itemPrice?: string
    }

    const items: IItem[] = [];

    while ((lineItemRegexMatch = lineItemRegex.exec(text)) !== null) {
        const item = {
            itemNumber: lineItemRegexMatch[1],
            itemDesc: lineItemRegexMatch[2].trim(),
            // Assuming couponNum, couponAmt, and itemPrice are not available in the line
            // If they are, you can capture and assign them similarly
            couponNum: '',
            couponAmt: '',
            itemPrice: ''
        };
        items.push(item);
    }

    // Extract coupon lines and add the attributes to the objects
    // const couponItemRegex = /(\d{6,})\s*\/\s*(\d{1,7})/;

    // let couponItemRegexMatch;
    // const coupons = [];

    // while ((couponItemRegexMatch = couponItemRegex.exec(text)) !== null) {
    //     const coupon = {
    //     couponNumber: couponItemRegexMatch[1],
    //     itemNumber: couponItemRegexMatch[2]
    //   };

    //   coupons.push(coupon);
    // }

    // From the coupon array, add the couponNumber to the matching itemNumber to the corresponding itemNumber in the items array
    // coupons.forEach(coupon => {
    //     const item = items.find(item => item.itemNumber === coupon.itemNumber);
    //     if (item) {
    //         item.couponNum = coupon.couponNumber;
    //     }
    // });

    // Add document to Firestore using firebase-admin
    try {
        if (textFromDoc) {
          // Add a new document to 'receipts' collection with a unique ID
          const docRef = await admin.firestore().collection("receipts").doc(userUid).collection("extractedText").add({
            uid: userUid, // Store the UID in the document
            memberNumber: memberNumber,
            storeNumber: storeNumber,
            storeName: storeName,
            storeAddress: storeAddress,
            dateOfPurchase: dateOfPurchase,
            timeOfPurchase: timeOfPurchase,
            numberOfItems: numberOfItems,
            terminalNumber: terminalNumber,
            transactionNumber:transactionNumber,
            operatorNumber: operatorNumber,
            totalAmount: totalAmount,
            filePath: filePath,
            dollarAmounts: dollarAmounts,
            couponAmount: couponAmounts,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lineItems: items,
            numberOfItemsOnCoupon: null,
          });
          console.log("New document added with ID: ", docRef.id);
        } else {
          console.log("No text extracted from document.");
        }
      } catch (e) {
        console.error("Error adding new document to Firestore: ", e);
      }
    }
  );
