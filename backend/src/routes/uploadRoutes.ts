import express from 'express';
import checkAuth from '../middlewares/checkAuth';
import { processReceiptText, processReceiptItemLines } from '../utils/processReceiptText';
import { processReceiptUploadController } from '../controllers/processReceiptUploadController';

const router = express.Router();



router.post("/upload", checkAuth, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }


  try {
    // Forward the file to the controller for processing
    await processReceiptUploadController(req.file, req.body.uid, res);

    // Send initial response back to the client
    // res.status(202).send("Receipt uploaded and processing initiated");
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).send("Error during file upload");
  }
});






























// export const fetchMatchingItemNumbersFromCouponList = async (path: string) => {
//   console.log(`Fetching data from ${path}`);
  
//   try {
//     const querySnapshot = await db.collection(path).get();
//     console.log(`Data fetched from ${path}`);
    
//     return querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//   } catch (error) {
//     console.error(`Error fetching data from ${path}:`, error);
//     throw error;
//   }
// };

// router.post("/upload", checkAuth, async (req, res) => {
  /*
    This route handles the file upload and Document AI processing
    1. File upload handling
    2. Document AI processing
    3. Process the extracted text and return receipt data, plus text after processing
    4. Upload receipt and item lines to Firestore
    5. Apply calculations to receipt and item lines to calculate to alter their fields
    6. this way they will show up for live lsitener on client side






  */
        // try {
        //   // File upload handling
        //   console.log("File uploaded:", req.file);
        //   if (!req.file) {
        //     return res.status(400).json({ message: "No file uploaded" });
        //   }
          
        //   // Document AI processing
        //   const filePath = req.file.path;
        //   const fileBuffer = fs.readFileSync(filePath);
        //   const encodedImage = fileBuffer.toString("base64");
      
        //   // Create the request for Document AI processing
        //   const request = {
        //     name: `projects/${projectId}/locations/${fblocation}/processors/${processorId}`,
        //     rawDocument: {
        //       content: encodedImage,
        //       mimeType: req.file.mimetype,
        //     },
        //   };
      
        //   // Recognizes text entities in the image
        //   const [result] = await documentAIclient.processDocument(request);
        //   const document = result.document;


        //   if (!document || !('text' in document) || document.text === "") {
        //     return res.status(400).json({message: "No text extracted from document"});
        //   }

        //   // Provide a default empty string if text is null/undefined
        //   let text = document.text || ""; 
        //   if (text == "") {
        //     return res.status(400).json({message: "No text extracted from document"});
        //   }
      
     


          // Process the extracted text and return receipt data, plus text after processing
//           const { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt} = processReceiptText(text);

//           const reqUserID = req.body.uid;
          
// // Check if the user is not a demo user
// if (req.body.uid == process.env.DEMO_ACCT_UID) {
//   // Path in Firestore where the receipt will be stored
//   const addToFirestorePath = `users/${reqUserID}/receipts`;
//   // Creating a reference to a new document in Firestore
//   const docRef = admin.firestore().collection(addToFirestorePath).doc();
//   // Extracting the document ID for future reference
//   const docId = docRef.id;

//   // Upload the receipt data to Firestore
//   await docRef.set({ ...receipt });

//   // Process the item lines (extracted from the receipt)
//   const { updatedItemLines: itemLines } = processReceiptItemLines(updatedText, docId, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
  
//   // make an array of eligible item numbers from the receipt, which are item numbers where the corresponding item's couponNum is ''
//   const arrayOfItemEligibleItemNumbersFromReceipt = itemLines.filter(item => item.couponNum === '').map(item => item.itemNumber);

//   // Fetch a list of coupons from Firestore to use in calculations
//   const couponList = await fetchMatchingItemNumbersFromCouponList("sales/2023/coupons");
              

  // const FEReceipt = applyCouponCalculations(receipt, itemLines, dateOfPurchase, couponAmounts, couponList);


  // // Initialize a batch operation in Firestore
  // const batch = admin.firestore().batch();

  // // Define the path in Firestore for storing item lines
  // const itemLinesCollectionPath = `users/${reqUserID}/receipts/${docId}/itemLines`;

  // // Iterate over each item line
  // itemLines.forEach(item => {
  //   // Create a reference for each item line in Firestore
  //   const itemDocRef = admin.firestore().collection(itemLinesCollectionPath).doc();
  //   // Add each item line to the batch operation
  //   batch.set(itemDocRef, item);
  // });

  // // Commit the batch operation to Firestore, saving all item lines at once
  // await batch.commit();

  // Logging and sending a response to indicate successful processing
//   console.log("number of items", receipt.numberOfItems);
//   console.log("Receipt:\n", receipt, "ItemLines was", itemLines.length, "long and here are the items...\n", itemLines);
//   res.status(200).send("Receipt processed and item lines uploaded successfully");
// } else {
//       // User is demo user, so don't upload to Firestore
//       const itemLines = processReceiptItemLines(updatedText, 'demoReceiptId', multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
//       console.log("Receipt:\n", receipt, "ItemLines:\n", itemLines);

//       // lets return our FEReceipt.
//       return res.status(200).json({ receipt, itemLines }); // Send back the receipt and item lines


//     }
//   } catch (error) {
//     console.error("Error during file upload:", error);
//     res.status(500).send("Error during file upload");
//   } finally {


//   }
// });

export default router;





































//   try {
//           // Document AI processing
//           const filePath = req.file.path;
//           const fileBuffer = fs.readFileSync(filePath);
//           const encodedImage = fileBuffer.toString("base64");
      
//           // Create the request for Document AI processing
//           const request = {
//             name: `projects/${projectId}/locations/${fblocation}/processors/${processorId}`,
//             rawDocument: {
//               content: encodedImage,
//               mimeType: req.file.mimetype,
//             },
//           };
      
//           // Recognizes text entities in the image
//           const [result] = await documentAIclient.processDocument(request);
//           const document = result.document;


//           if (!document || !('text' in document) || document.text === "") {
//             return res.status(400).json({message: "No text extracted from document"});
//           }

//           // Provide a default empty string if text is null/undefined
//           let text = document.text || ""; 
//           if (text == "") {
//             return res.status(400).json({message: "No text extracted from document"});
//           }
      
     


//           // Process the extracted text and return receipt data, plus text after processing
//           const { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt} = processReceiptText(text);

//           const reqUserID = req.body.uid;
          
//           if (req.body.uid == process.env.DEMO_ACCT_UID) {
//             // User is not demo user, so upload to firestore
//             const addToFirestorePath = `users/${reqUserID}/receipts`;
//             const docRef = admin.firestore().collection(addToFirestorePath).doc();
//             const docId = docRef.id;

//               // Set the receipt document first
//               await docRef.set({ ...receipt });

//               // Now process item lines and upload each one to Firestore
//               const { updatedItemLines: itemLines } = processReceiptItemLines(updatedText, docId, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);

//               //MAKE A WHOLE NEW FUCKING OBJECT FOR SENDING TO FRONT END????? FUCK

//               // fetch couponList from firestore to pass to applyCouponCalculations
//               const couponList = await fetchMatchingItemNumbersFromCouponList("sales/2023/coupons");

//               // const FEReceipt = applyCouponCalculations(receipt, itemLines, dateOfPurchase, couponAmounts, couponList);


//               // Firestore batch to perform all writes in a single transaction
//               const batch = admin.firestore().batch();

//               // The subcollection path for itemLines
//               const itemLinesCollectionPath = `users/${reqUserID}/receipts/${docId}/itemLines`;

//               itemLines.forEach(item => {
//                 // Create a document reference for a new document within the collection with an auto-generated ID
//                 const itemDocRef = admin.firestore().collection(itemLinesCollectionPath).doc();
//                 // Use batch to set data for each item line
//                 batch.set(itemDocRef, item);
//               });


//       // Commit the batch
//       await batch.commit();
//       console.log("number of items", receipt.numberOfItems)
//       console.log("Receipt:\n", receipt, "ItemLines was", itemLines.length, "long and here are the items...\n", itemLines);
//       res.status(200).send("Receipt processed and item lines uploaded successfully");
//     } else {
//       // User is demo user, so don't upload to Firestore
//       const itemLines = processReceiptItemLines(updatedText, 'demoReceiptId', multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
//       console.log("Receipt:\n", receipt, "ItemLines:\n", itemLines);

//       // lets return our FEReceipt.
//       return res.status(200).json({ receipt, itemLines }); // Send back the receipt and item lines


//     }
//   } catch (error) {
//     console.error("Error during file upload:", error);
//     res.status(500).send("Error during file upload");
//   } finally {


//   }
// });