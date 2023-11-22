import express from 'express';
import admin from "firebase-admin";
import { initializeApp } from 'firebase-admin/app';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';

// const { PassThrough } = require('stream');
// import { removeSingleLetters, 
//     removePhrases, 
//     extractBarcode,
//     extractStoreAddress,
//     extractStoreName,
//     extractStoreNumber,
//     extractMemberNumber,
// } from './regexUtil';

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

        // Setup Variables
        interface IReceipt {
            barcodeNumber: string | null;
            storeAddress: string | null;
            memberNumber: string | null;
            storeNumber: string | null;
            storeName: string | null;
            terminalNumber: string | null;
            transactionNumber: string | null;
            operatorNumber: string | null;
            dateOfPurchase: string | null;
            timeOfPurchase: string | null;
            numberOfItems: string | null;
        }
          
          const receipt: IReceipt = ({
              authChecked: false,
              isAuthed: false,
              receipts: [],
              user: null,

          });










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

        const numberSequence = extractNumberSequence(text);
        text = numberSequence.text;
        // storeNumber = numberSequence.storeNumber;
        let terminalNumber = numberSequence.terminalNumber;
        let transactionNumber = numberSequence.transactionNumber;
        let operatorNumber = numberSequence.operatorNumber;

        const dateOfPurchase = extractDate(text);
        text = dateOfPurchase.text;

        const timeOfPurchase = extractTime(text);
        text = timeOfPurchase.text;

        const numberOfItems = extractNumberOfItems(text);
        text = numberOfItems.text;

        const totalAmount = extractTotalAmount(text);
        text = totalAmount.text;

        const couponAmounts = extractCouponAmounts(text);
        text = couponAmounts.text;

        const dollarAmounts = extractDollarAmounts(text);
        text = dollarAmounts.text;
        
        console.log(text);
        // const noncouponLineItems = extractNonCouponLineItems(text);
        // text = noncouponLineItems.text;

    const theFin = {
        memberNumber: memberNumber.memberNumber,
        storeNumber: storeNumber.storeNumber,
        storeName: storeName.storeName,
        storeAddress: storeAddress.storeAddress,
        dateOfPurchase: dateOfPurchase.dateOfPurchase,
        timeOfPurchase: timeOfPurchase.timeOfPurchase,
        numberOfItems: numberOfItems.numberOfItems,
        terminalNumber: terminalNumber,
        transactionNumber: transactionNumber,
        operatorNumber: operatorNumber,
        totalAmount: totalAmount.totalAmount,
        filePath: filePath,
        couponAmounts: couponAmounts.couponAmounts,
        dollarAmounts: dollarAmounts.dollarAmounts,
        // lineItems: items,
        // numberOfItemsOnCoupon: "",
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


// regexUtil.js

// Function to remove single letters A, E, F
function removeSingleLetters(text) {
    const regex = /(?<![a-zA-Z])[AEF](?![a-zA-Z])/g;
    return text.replace(regex, '');
}

// Function to remove common phrases
function removePhrases(text) {
    const phraseRegex = /(?<![a-zA-Z])(Thank You!|Please Come Again|CHANGE|INSTANT SAVINGS|TAX|SUBTOTAL|TOTAL)(?![a-zA-Z])/g;
    return text.replace(phraseRegex, '');
}

// Function to extract Barcode number
function extractBarcode(text) {
    const digitPattern = /\b\d{23}\b/g;
    const matches = text.match(digitPattern);
    const barcodeNumber = matches ? matches[0] : null;
    
    return {
        text: text.replace(digitPattern, ''),
        barcodeNumber
    };
}

// Function to extract store address
// We expect the address to be preceded by a store number and a # sign (e.g., "#629")
function extractStoreAddress(text) {
    const addressRegex = /#\d{1,4}\s+([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/;
    const addressMatch = text.match(addressRegex);
    let storeAddress = addressMatch ? addressMatch[1].trim() : null;

    // If store address is still null, use a second regex to get address
    if (storeAddress == null) {
        const addressRegexTwo = /(\d{1,}) [a-zA-Z0-9\s]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)?,?\s+[a-zA-Z]+,?\s+[A-Z]{2} [0-9]{5,6}/; 
        // (?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)
        const addressMatchTwo = text.match(addressRegexTwo);
        storeAddress = addressMatchTwo ? addressMatchTwo[0].trim() : null;
    }
    
    // Replace newline characters with a space
    if (storeAddress) {
        storeAddress = storeAddress.replace(/\n/g, ' ');
    }

    return {
        text: text.replace(storeAddress, ''),
        storeAddress
    };
}

// Store name always appears before the # sign
// Lets change this regex so that it matches one or two words before the # sign that are stylized where the First letter of each work is capitalized
function extractStoreName(text) {
    const storeNameRegex = /\b([A-Z][a-z]*\s?(?:[A-Z][a-z]*)?)\s*#/;
    const storeNameMatch = text.match(storeNameRegex);
    const storeName = storeNameMatch ? storeNameMatch[1].trim() : null;
    
    return {
        text: text.replace(storeName, ''),
        storeName
    };
}

function extractStoreNumber(text) {
    // Store number always appears after the # sign
    const storeNumberRegex = /#\s*(\d+)/;
    const storeNumberMatch = text.match(storeNumberRegex);
    const storeNumber = storeNumberMatch ? storeNumberMatch[1].trim() : null;
    text = text.replace(storeNumberRegex, '');
    
    return {
        text: text.replace(storeNumberRegex, ''),
        storeNumber
    };
}

// Member number starts with 111, a 9, or an 8 and is 9+ characters long, followed by a space or end of the line/string
function extractMemberNumber(text) {
    const memberNumberRegex = /Member\s+((111|9|8)\d{6,})\b/i;
    const memberNumberMatch = text.match(memberNumberRegex);
    const memberNumber = memberNumberMatch ? memberNumberMatch[1].trim() : null;

    return {
        text: text.replace(memberNumberRegex, ''),
        memberNumber
    };
}

// Sequence of four numbers each separated by a space and always after a time (xx:xx)
function extractNumberSequence(text) {
    const numberSequenceRegex = /(\d{1,2}:\d{2}.*?)(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/s;
    const numberSequenceMatch = text.match(numberSequenceRegex);

    // Assign each number to a variable
    const storeNumber = numberSequenceMatch ? numberSequenceMatch[2] : null;
    const terminalNumber = numberSequenceMatch ? numberSequenceMatch[3] : null;
    const transactionNumber = numberSequenceMatch ? numberSequenceMatch[4] : null;
    const operatorNumber = numberSequenceMatch ? numberSequenceMatch[5] : null;

    if (numberSequenceMatch) {
        // Replace only the part of the match that contains the number sequence
        text = text.replace(numberSequenceMatch[0], numberSequenceMatch[1]);
    }

    return {
        text,
        storeNumber,
        terminalNumber,
        transactionNumber,
        operatorNumber
    };
}

function extractDate(text) {
    // Regular expression to match date
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;
    const dateMatch = text.match(dateRegex);
    const dateOfPurchase = dateMatch ? dateMatch[1] : null;
    
    return {
        text: text.replace(dateOfPurchase, ''),
        dateOfPurchase
    };
}

function extractTime(text) {
    // Regular expression for time
    const timeRegex = /(\d{2}:\d{2})/;
    const timeMatch = text.match(timeRegex);
    const timeOfPurchase = timeMatch ? timeMatch[1] : null;
    
    return {
        text: text.replace(timeOfPurchase, ''),
        timeOfPurchase
    };
}

function extractNumberOfItems(text) {
    // Regex to match the number of items sold
    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    // Extract number of items sold
    const itemsSoldMatch = text.match(itemsSoldRegex);
    const numberOfItems = itemsSoldMatch ? parseInt(itemsSoldMatch[1], 10) : null;
    
    return {
        text: text.replace(itemsSoldRegex, ''),
        numberOfItems
    };
}

function extractTotalAmount(text) {
    const totalAmountRegex = /AMOUNT: *\$(\d+\.\d{2})/;
    // Extract total amount from text
    const totalAmountMatch = text.match(totalAmountRegex);
    let totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : null;

    // Second check for total amount if null is in dollar array
    if (totalAmount == null) {

    }

    return {
        text: text.replace(totalAmountRegex, ''),
        totalAmount
    }; 
}

function extractCouponAmounts(text) {
    // Make an array of coupon amounts, in order. get coupons first since it removes them from text, then do regular prices
    const couponAmountsRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}-\B/g;
    let couponAmountsRegexMatch;
    const couponAmounts = [];
    
    while ((couponAmountsRegexMatch = couponAmountsRegex.exec(text)) !== null) {
        // Remove the trailing '-' from the matched string before adding to the array
        const amount = couponAmountsRegexMatch[0].slice(0, -1);
        couponAmounts.push(amount);
    }

    return {
        text: text.replace(couponAmountsRegex, ''),
        couponAmounts
    };
}

function extractDollarAmounts(text) {
    const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g;
    let dollarAmountsRegexMatch;
    const dollarAmounts = [];

    while ((dollarAmountsRegexMatch = dollarAmountsRegex.exec(text)) !== null) {
        dollarAmounts.push(dollarAmountsRegexMatch[0]);
    }

    // if (totalAmount == null) {
    //     const maxAmount = Math.max(...dollarAmounts);
    //     totalAmount = parseFloat(maxAmount);
    //     // remove max amount instance from dollarAmounts array
    //     const maxAmountIndex = dollarAmounts.indexOf(maxAmount);
    //     dollarAmounts.splice(maxAmountIndex, 1);
    // }

    return {
        text: text.replace(dollarAmountsRegex, ''),
        dollarAmounts
    };
}

// function extractNonCouponLineItems(text) {
//     const lineItemRegex = /(\d{1,7})\s+((?:[A-Z]\s*){3,}[A-Z\s]*)\s*/g;

//     let lineItemRegexMatch;
//     const items = [];

//     while ((lineItemRegexMatch = lineItemRegex.exec(text)) !== null) {
//         const item = {
//             itemNumber: lineItemRegexMatch[1],
//             itemDesc: lineItemRegexMatch[2].trim(),
//             couponNum: '',
//             couponAmt: '',
//             itemPrice: ''
//         };
//         items.push(item);
//     }

//     return {
//         text: text.replace(lineItemRegex, ''),
//         items
//     };
// }
