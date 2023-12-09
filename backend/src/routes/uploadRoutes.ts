import fs from 'fs';
import express from 'express';
import admin from 'firebase-admin';
import checkAuth from '../middlewares/checkAuth';
import { processReceiptText, processReceiptItemLines } from '../utils/processReceiptText';
import { documentAIclient } from '../server';
import { IReceipt } from '../models/IReceipt'
const router = express.Router();

// Environment variable extraction for Google Cloud Document AI
const projectId = process.env.DOCAI_PROJECTID;
const fblocation = process.env.DOCAI_LOCATION;
const processorId = process.env.DOCAI_PROCESSORID;

router.post("/upload", checkAuth, async (req, res) => {
        try {
          // File upload handling
          console.log("File uploaded:", req.file);
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
      
          // Document AI processing
          const filePath = req.file.path;
          const fileBuffer = fs.readFileSync(filePath);
          const encodedImage = fileBuffer.toString("base64");
      
          // Create the request for Document AI processing
          const request = {
            name: `projects/${projectId}/locations/${fblocation}/processors/${processorId}`,
            rawDocument: {
              content: encodedImage,
              mimeType: `image/${req.file.mimetype.split("/")[1]}`,
            },
          };
      
          // Recognizes text entities in the image
          const [result] = await documentAIclient.processDocument(request);
          const document = result.document;

          if (!document || !('text' in document) || document.text === "") {
            return res.status(400).json({message: "No text extracted from document"});
        }
        
          // Provide a default empty string if text is null/undefined
          let text = document.text || ""; 
          if (text == "") {
            return res.status(400).json({message: "No text extracted from document"});
          }
      
          // Process the extracted text and retuen receipt data, plus text after processing
          const { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt} = processReceiptText(text);

          const reqUserID = req.body.uid;
          
          if (req.body.uid == process.env.DEMO_ACCT_UID) {
            // User is not demo user, so upload to firestore
            const addToFirestorePath = `users/${reqUserID}/receipts`;
            const docRef = admin.firestore().collection(addToFirestorePath).doc();
            const docId = docRef.id;

              // Set the receipt document first
              await docRef.set({ ...receipt });

              // Now process item lines and upload each one to Firestore
              const { updatedItemLines: itemLines } = processReceiptItemLines(updatedText, docId, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);

              // Firestore batch to perform all writes in a single transaction
              const batch = admin.firestore().batch();

              // The subcollection path for itemLines
              const itemLinesCollectionPath = `users/${reqUserID}/receipts/${docId}/itemLines`;

              itemLines.forEach(item => {
                // Create a document reference for a new document within the collection with an auto-generated ID
                const itemDocRef = admin.firestore().collection(itemLinesCollectionPath).doc();
                // Use batch to set data for each item line
                batch.set(itemDocRef, item);
              });

      // Commit the batch
      await batch.commit();

      console.log("Receipt:\n", receipt, "ItemLines:\n", itemLines);
      res.status(200).send("Receipt processed and item lines uploaded successfully");
    } else {
      // User is demo user, so don't upload to Firestore
      const itemLines = processReceiptItemLines(updatedText, 'demoReceiptId', multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
      console.log("Receipt:\n", receipt, "ItemLines:\n", itemLines);
      return res.status(200).json({ receipt, itemLines }); // Send back the receipt and item lines
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).send("Error during file upload");
  }
});

export default router;