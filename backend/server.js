import express from 'express';
import admin from "firebase-admin";
import { initializeApp } from 'firebase-admin/app';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
// const { PassThrough } = require('stream');
import { removeSingleLetters, 
    removePhrases, 
    extractBarcode,
    extractStoreAddress,
    extractStoreName,
    extractStoreNumber,
    extractMemberNumber,
} from './regexUtil';

dotenv.config();

// Initialize Firebase Admin SDK
// You might need a service account key for Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('couponcatch-e211e-firebase-admin.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://your-database-url.firebaseio.com" // if using Firebase Realtime Database
});

// Google Cloud Document AI and Storage client instantiation
const documentAIclient = new DocumentProcessorServiceClient({
    credential: admin.credential.cert(serviceAccount),
});

// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID,
//     measurementId: process.env.MEASUREMENT_ID
// };

const projectId = process.env.DOCAI_PROJECTID
const location = process.env.DOCAI_LOCATION
const processorId = process.env.DOCAI_PROCESSORID

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({ origin: 'http://localhost:8100' })); // Replace with your frontend's URL
app.use(express.json()); // To parse JSON payloads


// Set up Multer sotrage and filenaming
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Append user UID to the file name
        const userUid = req.user.uid; // Make sure this is available
        cb(null, `${userUid}-${Date.now()}.${file.mimetype.split('/')[1]}`)
    }
});

const upload = multer({ storage: storage });

const checkAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(403).send('Invalid token');
    }
};

// Endpoint for file upload
app.post('/upload', checkAuth, upload.single('image'), async (req, res) => {
    try {
        // Save photo locally
        console.log('File uploaded:', req.file);

        // Send to Document AI for text extraction
        // Read the file into memory, encode to base64
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const filePath = req.file.path;

        const fileBuffer = fs.readFileSync(filePath);
        const encodedImage = fileBuffer.toString('base64');
            
            
            // Create the request for Document AI processing
            const request = {
                name: `projects/${projectId}/locations/${location}/processors/${processorId}`,
                rawDocument: {
                  content: encodedImage,
                  mimeType: `image/${req.file.mimetype.split('/')[1]}`,
                },
            };    

        // Recognizes text entities in the PDF document
        const [result] = await documentAIclient.processDocument(request);
        const { document } = result;
        // Get all of the document text as one big string
        let { text } = document;

        if (text == null) {
            return res.status(400).send('No text extracted from document');
        }


        console.log("text as it comes from document ai", text)

        // Regex parsing
        text = removeSingleLetters(text);
        text = removePhrases(text);

        const barcodeData = extractBarcode(text);
        text = barcodeData.text;
        
        const storeAddress = extractStoreAddress(text);
        text = storeAddress.text;

        const memberNumber = extractMemberNumber(text);
        text = memberNumber.text;

        const storeName = extractStoreName(text);
        text = storeName.text;

        const storeNumber = extractStoreNumber(text);
        text = storeNumber.text;




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

    
    // Regex to match the number of items sold
    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    // Extract number of items sold
    const itemsSoldMatch = text.match(itemsSoldRegex);
    const numberOfItems = itemsSoldMatch ? parseInt(itemsSoldMatch[1], 10) : null;
    text = text.replace(itemsSoldRegex, '');

    // Extract total puchase price from lines line "AMOUNT: $104.18" or similar
    const totalAmountRegex = /AMOUNT: *\$(\d+\.\d{2})/;
    // Extract total amount from text
    const totalAmountMatch = text.match(totalAmountRegex);
    let totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : null;
    text = text.replace(totalAmountRegex, '');
    
    console.log("before line items", text);

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
        const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g;
        let dollarAmountsRegexMatch;
        const dollarAmounts = [];
    
        while ((dollarAmountsRegexMatch = dollarAmountsRegex.exec(text)) !== null) {
            dollarAmounts.push(dollarAmountsRegexMatch[0]);
        }
        text = text.replace(dollarAmountsRegex, '');

        console.log("after line items", text);


        // Extract non-coupon item lines and add to items array
const lineItemRegex = /(\d{1,7})\s+((?:[A-Z]\s*){3,}[A-Z\s]*)\s*/g;

let lineItemRegexMatch;
const items = [];

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

console.log(items);


    const theFin = {
        memberNumber: memberNumber,
        storeNumber: storeNumber,
        storeName: storeName,
        storeAddress: storeAddress,
        dateOfPurchase: dateOfPurchase,
        timeOfPurchase: timeOfPurchase,
        numberOfItems: numberOfItems,
        terminalNumber: terminalNumber,
        transactionNumber: transactionNumber,
        operatorNumber: operatorNumber,
        totalAmount: totalAmount,
        filePath: filePath,
        dollarAmounts: dollarAmounts,
        couponAmount: couponAmounts,
        lineItems: items,
        numberOfItemsOnCoupon: "",
    }

    console.log(theFin)



        res.status(200).send('File uploaded successfully');
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).send('Error during file upload');
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});