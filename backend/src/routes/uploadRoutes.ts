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
      
          // console.log("text as it comes from document ai", text)
      
          // Process the extracted text and retuen receipt data, plus text after processing
          const { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt} = processReceiptText(text);


          // IF USER IS DEMO USER BY UID ==, then skip
          // Upload to firebase firestore, into user/{uid}/receipts with a auto assigned doc id
          const reqUserID = req.body.uid;
          const dateNow = Date.now();
          const isoDate = new Date(dateNow).toUTCString();
          console.log("RECEIPT BEFORE SENDING TO FRONT END", receipt);
          if (req.body.uid == process.env.DEMO_ACCT_UID) {
            const addToFirestorePath = `users/${reqUserID}/receipts`;
            const docRef = admin.firestore().collection(addToFirestorePath).doc();
            const docId = docRef.id;
            console.log("docId", docId);
            // await docRef.set({  ...receipt });

            // give itemLines processing the updatedText, receipt.id (which is the docId assigned from firebase), multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt, and return the itemLines array
            
            // upload each item in itemLines as its own document in the subcollection user/{uid}/receipts/{receiptId}/itemLines/ (here).
            
            const itemLines = processReceiptItemLines(updatedText, docId, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt);
            console.log("receipt:\n", receipt, "itemLines:\n", itemLines);
            
            
            
          } else {
            return res.status(200).json({ isoDate, receipt }); // Send back the date and receipt
          }
      
          // console.log("updatedText", updatedText)
      
          res.status(200).send("File uploaded successfully");
        } catch (error) {
          console.error("Error during file upload:", error);
          res.status(500).send("Error during file upload");
        }
      });

export default router;