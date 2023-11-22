import express from 'express';
import admin from "firebase-admin";
import { initializeApp } from 'firebase-admin/app';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
// import { uuid } from 'uuidv4';
const DocumentProcessorServiceClient = require('@google-cloud/documentai').DocumentProcessorServiceClient;
// const { PassThrough } = require('stream');

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
        const userUid = req.headers['x-user-uid'] as string;
        cb(null, `Someavalue-${Date.now()}.${file.mimetype.split('/')[1]}`)
    }
});

const upload = multer({ storage: storage });

const checkAuth = async (req: any, res: any, next: any) => {
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

        // Setup interface for receipt
        interface IReceipt {
            barcodeNumber: string;
            storeAddress: string;
            memberNumber: string;
            storeNumber: string;
            storeName: string;
            terminalNumber: string;
            transactionNumber: string;
            operatorNumber: string;
            dateOfPurchase: string;
            timeOfPurchase: string;
            numberOfItems: number;
            taxAmount: number;
            totalAmount: number;
            dollarAmounts: number[];
            couponAmounts: number[];
            execCheckAmount: number;
            multiplierLines: {
                multiple: number;
                amount: number;
                itemNumber: string;
            }[];
            itemLines: {
                itemNumber: string;
                itemDesc: string;
                couponNum: string;
                couponAmt: string;
                itemPrice: number;
                quantity: number;
            }[];
            couponLines: [string, string][];
            }
          
function processReceiptText(text: string): { updatedText: string, receipt: IReceipt } {
    let updatedText = text;

    // Initialize a receipt object with default values
    let receipt: IReceipt = {
        barcodeNumber: '',
        storeAddress: '',
        memberNumber: "",
        storeNumber: "",
        storeName: "",
        terminalNumber: "",
        transactionNumber: "",
        operatorNumber: "",
        dateOfPurchase: "",
        timeOfPurchase: "",
        numberOfItems: 0,
        execCheckAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        multiplierLines: [],
        dollarAmounts: [],
        couponAmounts: [],
        itemLines: [],
        couponLines: [],
    };

    const regex = /(?<![a-zA-Z])[AEF](?![a-zA-Z])/g;
    updatedText = updatedText.replace(regex, '');

    const phraseRegex = /(?<![a-zA-Z])(Thank You!|Please Come Again|CHANGE|INSTANT SAVINGS|TAX|SUBTOTAL|TOTAL)(?![a-zA-Z])/g;
    updatedText = updatedText.replace(phraseRegex, '');

    // remove empty lines
    updatedText = updatedText.replace(/^\s*[\r\n]/gm, '');

    const digitPattern = /\b\d{23}\b/g;
    const matches = updatedText.match(digitPattern);
    receipt.barcodeNumber = matches ? matches[0] : '';
    updatedText = updatedText.replace(digitPattern, '');

    const addressRegex = /(?:#\d{1,4}\s+)([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/;
    const addressMatch = updatedText.match(addressRegex);
    receipt.storeAddress = addressMatch ? addressMatch[1].replace(/\n/g, ', ').trim() : "";
    updatedText = addressMatch ? updatedText.replace(addressMatch[1], '') : updatedText;
    
    if (receipt.storeAddress == "") {
        const addressRegexTwo = /(\d{1,}) [a-zA-Z0-9\s]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)?,?\s+[a-zA-Z]+,?\s+[A-Z]{2} [0-9]{5,6}/; 
        // (?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)
        const addressMatchTwo = updatedText.match(addressRegexTwo);
        if (addressMatchTwo) {
            // Replace newlines with ', ' for multiline address parts
            let formattedAddress = addressMatchTwo[0].replace(/\n/g, ', ').trim();
            // Correcting any double commas that may have been introduced
            formattedAddress = formattedAddress.replace(/, ,/g, ', ');
            receipt.storeAddress = formattedAddress;
            updatedText = updatedText.replace(addressRegexTwo, '');
        } else {
            receipt.storeAddress = "";
        }
    }
  
    const storeNameRegex = /([a-zA-Z ]+)(?=\s#\d+)/;
    const storeNameMatch = updatedText.match(storeNameRegex);
    receipt.storeName = storeNameMatch ? storeNameMatch[1].trim() : "";
    updatedText = updatedText.replace(storeNameRegex, '');

    const storeNumberRegex = /#\s*(\d+)/;
    const storeNumberMatch = updatedText.match(storeNumberRegex);
    const storeNumber = storeNumberMatch ? storeNumberMatch[1].trim() : "";
    receipt.storeNumber = storeNumber;
    updatedText = updatedText.replace(storeNumberRegex, '');

    // Add for finding and removal of day code, comes before member
    const memberNumberRegex = /Member\s+((111|9|8)\d{6,})\b/i;
    const memberNumberMatch = updatedText.match(memberNumberRegex);
    receipt.memberNumber = memberNumberMatch ? memberNumberMatch[1].trim() : "";
    updatedText = updatedText.replace(memberNumberRegex, '');

    const numberSequenceRegex = /(\d{1,2}:\d{2}.*?)(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/s;
    const numberSequenceMatch = updatedText.match(numberSequenceRegex);
    if (numberSequenceMatch) {
        receipt.storeNumber = receipt.storeNumber || numberSequenceMatch[2];
        receipt.terminalNumber = numberSequenceMatch[3];
        receipt.transactionNumber = numberSequenceMatch[4];
        receipt.operatorNumber = numberSequenceMatch[5];
        updatedText = updatedText.replace(numberSequenceMatch[0], numberSequenceMatch[1]);
    }
    // Then, remove the number sequences
    const removeNumberSequenceRegex = /(?:\d{1,2}:\d{2}.*?)(\d+\s+\d+\s+\d+\s+\d+)/g;
    updatedText = updatedText.replace(removeNumberSequenceRegex, '');


    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
    const dateMatch = updatedText.match(dateRegex);
    receipt.dateOfPurchase = dateMatch ? dateMatch[1] : "";
    updatedText = updatedText.replace(dateRegex, '');


    const timeRegex = /(\d{2}:\d{2})/g;
    const timeMatch = updatedText.match(timeRegex);
    receipt.timeOfPurchase = timeMatch ? timeMatch[1] : "";
    updatedText = updatedText.replace(timeRegex, '');


    // Remove unnecessary lines
    const removeLinesRegex = /^(AID:.*|Bottom.*|Seq#\s+\d+.*|EFT\/Debit|Tran.*|Merchant ID:.*|Resp.*|APPROVED.*|CHIP.*|App#:.*|Whse.*|Trm.*|Trn.*|OP.*|Name.*|Merchant.*|Costco Visa|Date of Birth.*|XXXXX.*|INSTANT.*|BOB Count.*|SEASONS.*|\d+(?:\.\d+)?\s*%.*?)$/gm;
    updatedText = updatedText.replace(removeLinesRegex, '');

    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    // Extract number of items sold
    const itemsSoldMatch = updatedText.match(itemsSoldRegex);
    if (itemsSoldMatch) {
        receipt.numberOfItems = parseInt(itemsSoldMatch[1], 10);
    }
    updatedText = updatedText.replace(itemsSoldRegex, '');

    // console.log("THIS IS THE TEXT AFTER ITEMS SOLDONE\nBEFORE ITEMSSOLD TWO\n", updatedText);

    const itemsSoldRegexTwo = /NUMBER OF ITEMS SOLD\s*[=-]?\s*(\d+)(?=($|\n))/;
    const itemsSoldMatchTwo = updatedText.match(itemsSoldRegexTwo);
    // Only update receipt.numberOfItems if it's still empty
    if (receipt.numberOfItems == 0) {
        receipt.numberOfItems = itemsSoldMatchTwo ? parseInt(itemsSoldMatchTwo[1], 10) : 0;
    }
    updatedText = updatedText.replace(itemsSoldRegexTwo, '');

    // console.log("THIS IS THE TEXT AFTER ITEMS SOLDTWO\nBEFORE TOALAMOUNT\n", updatedText);

    const totalAmountRegex = /AMOUNT: *\$(\d+\.\d{2})/;
    // Extract total amount from text
    const totalAmountMatch = updatedText.match(totalAmountRegex);
    receipt.totalAmount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : 0;
    updatedText = updatedText.replace("AMOUNT", '');


    // console.log("THIS IS THE TEXT AFTER TOTAL AMOUNT IS RAN\nBEFORE MULTILINES\n", updatedText);
    // Extract the multiple-lines which always have an @ sign in between a number and a dollar amount
    const multiplierLinesRegex = /(\d+)\s+@\s+(\d{1,3}(?:,\d{3})*\.\d{2})/g;
    const mlineItemRegex = /(\d{1,7})\s+([a-zA-Z][^\n\/]{3,})\s*/g;
    let multiplierLinesMatch;
    let lastIndex = 0;

    while ((multiplierLinesMatch = multiplierLinesRegex.exec(updatedText)) !== null) {
        const multiple = parseInt(multiplierLinesMatch[1], 10);
        const amount = parseFloat(multiplierLinesMatch[2].replace(/,/g, ''));
    
        // Set the search start for the next item number
        lastIndex = multiplierLinesRegex.lastIndex;
    
        // Find the next item line
        mlineItemRegex.lastIndex = lastIndex;
        const itemLineMatch = mlineItemRegex.exec(updatedText);
        let itemNumber = "";
    
        if (itemLineMatch) {
            itemNumber = itemLineMatch[1];
        }
    
        receipt.multiplierLines.push({
            multiple: multiple,
            amount: amount,
            itemNumber: itemNumber
        });
    }
    updatedText = updatedText.replace(multiplierLinesRegex, '');

    // console.log("This is text left before coupon lines is ran\nAfter multiplier line has ran\n", updatedText);

    const couponAmountsRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}-\B/g;
    let couponAmountsRegexMatch;
    receipt.couponAmounts = [];
    
    while ((couponAmountsRegexMatch = couponAmountsRegex.exec(updatedText)) !== null) {
        // Remove the trailing '-' from the matched string before adding to the array
        const amountString = couponAmountsRegexMatch[0].slice(0, -1);
        // Convert the amountString to a number, removing any commas
        const amountNumber = parseFloat(amountString.replace(/,/g, ''));
        receipt.couponAmounts.push(amountNumber);
        updatedText = updatedText.replace(couponAmountsRegexMatch[0], '');
         }


    // console.log("This is text left before dollar amounts are ran\n\n", updatedText);

    // Get all the dollar amounts collected from the receipt
    const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g;
    let dollarAmountsRegexMatch;
    receipt.dollarAmounts = [];
    
    while ((dollarAmountsRegexMatch = dollarAmountsRegex.exec(updatedText)) !== null) {
        const amount = dollarAmountsRegexMatch[0].replace(/,/g, ""); // Remove commas
        receipt.dollarAmounts.push(parseFloat(amount));
    }
    
    console.log("DOLLAR AMOUNTS TOTAL AFTER IT HAS RAN", receipt.dollarAmounts)

    // If the max value in the receipt.dollarAmounts array is higher than receipt.totalAmount, set receipt.totalAmount equal to the max value inside receipt.dollarAmounts array, then update the array with that value removed
    if (Math.max(...receipt.dollarAmounts) > receipt.totalAmount) {
        const maxAmount = Math.max(...receipt.dollarAmounts);
        receipt.totalAmount = maxAmount; // maxAmount is already a number
    
        // Remove max amount instance from dollarAmounts array
        const maxAmountIndex = receipt.dollarAmounts.indexOf(maxAmount);
        if (maxAmountIndex > -1) {
            receipt.dollarAmounts.splice(maxAmountIndex, 1);
        }
    }
    updatedText = updatedText.replace(dollarAmountsRegex, '');


    
    // Figure out which amount is tax. One of these numbers in the dollarAmounts array should be the tax amount, when subtracted from the receipt.totalAmount, will equal another value in the dollarAmounts array. write an algorithm to do just that
    const findTaxAmount = (totalAmount: number, dollarAmounts: number[]): number => {
        const epsilon = 0.01; // Small margin of error for financial calculations
    
        // Sort the dollarAmounts in ascending order to prioritize smaller amounts (likely to be tax)
        const sortedDollarAmounts = [...new Set(dollarAmounts)].sort((a, b) => a - b);
    
        for (const amount of sortedDollarAmounts) {
            const potentialSubtotal = totalAmount - amount;
  
                // Check if the potentialSubtotal is approximately in the dollarAmounts array
            if (sortedDollarAmounts.some(a => Math.abs(a - potentialSubtotal) < epsilon)) {
                return amount; // Return the first matching tax amount
            }
        }
        return 0; // Return null if no matching tax amount is found
    };
    
    receipt.taxAmount = findTaxAmount(receipt.totalAmount, receipt.dollarAmounts);
    // Remove all dollar amounts from receipt.dollarAmounts that match receipt.taxAmount
    receipt.dollarAmounts = receipt.dollarAmounts.filter(amount => amount!== receipt.taxAmount);
    // Remove the subtotal before tax amount (which is receipt.totalAmount - receipt.taxAmount) from the receipt.dollarAmounts array
    receipt.dollarAmounts = receipt.dollarAmounts.filter(amount => Math.abs(amount - (receipt.totalAmount - receipt.taxAmount)) >= 0.01);


// If the text "Executive Rebate" is present in updatedText, look for an amount within receipt.dollarAmounts that when subtracted from receipt.totalAmount will equal another value in the receipt.dollarAmounts array. If found, set receipt.execCheckAmount equal to that value and remove it from the receipt.dollarAmounts array
const findExecRebateAmount = (totalAmount: number, dollarAmounts: number[]): number => {
    const epsilon = 0.01; // Small margin of error for financial calculations

    // Sort the dollarAmounts in descending order to prioritize larger amounts (likely to be executive rebate)
    const sortedDollarAmounts = [...new Set(dollarAmounts)].sort((a, b) => b - a);

    for (const amount of sortedDollarAmounts) {
        const potentialNewTotal = totalAmount - amount;

        // Check if the potentialNewTotal is approximately in the dollarAmounts array
        if (sortedDollarAmounts.some(a => Math.abs(a - potentialNewTotal) < epsilon)) {
            return amount; // Return the first matching executive rebate amount
        }
    }
    return 0; // Return null if no matching executive rebate amount is found
};

if (updatedText.includes("Executive Rebate")) {
    const execRebateAmount = findExecRebateAmount(receipt.totalAmount, receipt.dollarAmounts);
}

// Remove the execRebateAmount from the receipt.dollarAmounts array
receipt.dollarAmounts = receipt.dollarAmounts.filter(amount => Math.abs(amount - receipt.execCheckAmount) >= 0.01);
// Remove the post exec check rebate amount (which is receipt.totalAmount - receipt.execCheckAmount) from the receipt.dollarAmounts array
receipt.dollarAmounts = receipt.dollarAmounts.filter(amount => Math.abs(amount - (receipt.totalAmount - receipt.execCheckAmount)) >= 0.01);
// Remove all dollar amounts from receipt.dollarAmounts that match receipt.totalAmount
receipt.dollarAmounts = receipt.dollarAmounts.filter(amount => amount!== receipt.totalAmount);


console.log("This is text left before tax amount is ran\nAfter dollar amounts has ran\n\n", updatedText);
    
    // Cleanup beofre line items are ran
    // Remove any line that has one or two letters in it
    // const removeSingleLettersRegex = /\b[A-Za-z0-9]{2}\b/g;
    // updatedText = updatedText.replace(removeSingleLettersRegex, '');
    
    // Remove any emtpty lines
    updatedText = updatedText.replace(/^\s*[\r\n]/gm, '');
    // remove all occurences of * characters
    updatedText = updatedText.replace(/\*/g, '');
    // remove all lines that start with BOB.*|Bottom.*|Count.*
    const removeBobRegex = /^(BOB.*|Bottom.*|Count.*)$/gm;
    updatedText = updatedText.replace(removeBobRegex, '');
    console.log("This is text left before line items are ran", updatedText);
    // Remove any empty spaces at the beginning of a line
    updatedText = updatedText.replace(/^\s+/gm, '');


    // const lineItemRegex = /(\d{1,7})\s+([a-zA-Z][^\n\/]{3,})\s*/g;
    //const lineItemRegex = /(\d{1,7})\s+([^\n\/]{4,})\s*/g;
    // const lineItemRegex = /(\d{1,7})\s+([^\n\/]{4,})/gm;
    // const lineItemRegex = /^(\d+)\s+([^\d\/].+)$/gm;
    const lineItemRegex = /^\s*(\d+)\s+([\d\w].+)$/gm;
    let lineItemRegexMatch;
    let updatedItemLines = []; // Temporary array to store valid items
    let remainingText = updatedText; // Copy of the original text for processing
    
    while ((lineItemRegexMatch = lineItemRegex.exec(updatedText)) !== null) {
        if (!/^\d{3}/.test(lineItemRegexMatch[2]) 
        && lineItemRegexMatch[1].length <= 8
        && !/[a-z]/.test(lineItemRegexMatch[2])
    ) {
            // ONLY CONTINUE IF
            // the item description does NOT start with three digits
            // AND the item number <= 8 digits
            // AND the item description does NOT contain any lowercase letters


            const item = {
                itemNumber: lineItemRegexMatch[1],
                itemDesc: lineItemRegexMatch[2].trim(),
                couponNum: '',
                couponAmt: '',
                itemPrice: 0,
                quantity: 1,
            };
            updatedItemLines.push(item);
            remainingText = remainingText.replace(lineItemRegexMatch[0], ''); // Remove the matched line
        }
    }
    
    receipt.itemLines = updatedItemLines;
    updatedText = remainingText;

    // remove all blank lines
    updatedText = updatedText.replace(/^\s*[\r\n]/gm, '');


    // if receipt.numberOfItems < receipt.itemLines.length, check for items where the numbers and desc may be on different lines
    if (receipt.itemLines.length < receipt.numberOfItems) {
      //const lineItemRegexTwo = /(\d{1,7})\s+([^\n\/]{4,})/gm;
      const lineItemRegexTwo = /(\d{1,7})\r?\n(.{4,})/gm;

      let lineItemRegexTwoMatch;
      let updatedLineItemsTwo = []; // Temporary array to store valid items
      let remainingTextTwo = updatedText; // Copy of the original text for processing

      while (
        (lineItemRegexTwoMatch = lineItemRegexTwo.exec(updatedText)) !== null
      ) {
        if (
          !/^\d{3}/.test(lineItemRegexTwoMatch[2]) &&
          lineItemRegexTwoMatch[1].length <= 8 &&
          !/[a-z]/.test(lineItemRegexTwoMatch[2])
        ) {
          // ONLY CONTINUE IF
          // the item description does NOT start with three digits
          // AND the item number is <= 8 digits
          // AND the item description does NOT contain any lowercase letters
          const item = {
            itemNumber: lineItemRegexTwoMatch[1],
            itemDesc: lineItemRegexTwoMatch[2].trim(),
            couponNum: "",
            couponAmt: "",
            itemPrice: 0,
            quantity: 1,
          };
          updatedLineItemsTwo.push(item);
        // Remove the matched line and collapse multiple newlines into a single newline
        remainingTextTwo = remainingTextTwo.replace(lineItemRegexTwoMatch[0], "").replace(/(\r?\n){2,}/g, '\n');
        }

    }
    // After processing, if there are still multiple newlines, collapse them
remainingTextTwo = remainingTextTwo.replace(/(\r?\n){2,}/g, '\n');

    // push items from updatedLineItemsTwo to receipt.itemLines
    receipt.itemLines.push(...updatedLineItemsTwo);
    updatedText = remainingText;
}

    // add in multiplier lines to receipts items lines
    // if multiplierLines.length > 0, then we need to iterate through the multiplierLines array searching for the current iteration's itemNumber in the itemLines array. Once we find the matching itemLines.itemNumber to the multeplierLines.itemNumber we are iterating on, we make sure that the itemLines.itemPrice is divisible with no remainder by the product of the multiplierLines.multiple and multiplierLines.amount. If it is, set itemLines.itemPrice equal to multiplierLines.amount. Next we replace the itemLines.quantity with the multiplierLines.multiple and the itemLines.itemPrice with the multiplierLines.amount.
    receipt.multiplierLines.forEach((multiplierLine) => {
        receipt.itemLines.forEach((itemLine) => {
            if (itemLine.itemNumber === multiplierLine.itemNumber) {
                if (itemLine.itemPrice % (multiplierLine.multiple * multiplierLine.amount) === 0) {
                    itemLine.itemPrice = multiplierLine.amount;
                    itemLine.quantity = multiplierLine.multiple;
                }
            }
        });
    });

    // Set reveipt.numberOfItems to the the sum of all the itemLines.quantity
    if (receipt.numberOfItems == 0) {
        receipt.numberOfItems = receipt.itemLines.reduce((acc, itemLine) => acc + itemLine.quantity, 0);
    }
    // See if the number of itemLines we found is equal to the number of items in the receipt, if so serve it up, if not, keep going
    // Convert the length of itemLines to a string
    const itemLinesLengthString = receipt.itemLines.length.toString();

    // Use a regex to search for this specific string in updatedText
    const itemLinesLengthRegex = new RegExp(`\\b${itemLinesLengthString}\\b`);
    const itemLinesLengthMatch = updatedText.match(itemLinesLengthRegex);

    // If the specific string is found, update receipt.numberOfItems
    if (itemLinesLengthMatch) {
        receipt.numberOfItems = parseInt(itemLinesLengthMatch[0], 10);
    }
    updatedText = updatedText.replace(itemLinesLengthRegex, '');



    console.log("THIS IS JUST BEFORE COUPON LINES RUNS\n", updatedText);

    const couponLineRegex = /^\s*(0000\d{6}|(?<!0000)\d{6})(?:\s*\/\s*(\d+))?$/gm;
    let couponLineRegexMatch;
    receipt.couponLines = [];
    
    while ((couponLineRegexMatch = couponLineRegex.exec(updatedText)) !== null) {
        const couponNumber = couponLineRegexMatch[1];
        const itemNumber = couponLineRegexMatch[2];
        if (itemNumber) {
            receipt.couponLines.push([couponNumber, itemNumber]);
        }
    }
    
    receipt.couponLines.forEach(couponLine => {
        const [couponNum, itemNumber] = couponLine;
        receipt.itemLines.forEach(item => {
            if (item.itemNumber === itemNumber) {
                item.couponNum = couponNum;
            }
        });
    });
    
    // Make an array of indexes of the items in the itemLines array that have a couponNum value !== ''. Then, iterate through the couponAmounts array and assign the the first value in couponAmounts to the index of the . Then, remove the items from the couponAmounts array that have been added to the itemLines array
    let couponIndex = 0;

    receipt.itemLines.forEach(itemLine => {
        if (itemLine.couponNum !== '') {
            // Check if there are still coupon amounts available
            if (couponIndex < receipt.couponAmounts.length) {
                itemLine.couponAmt = receipt.couponAmounts[couponIndex].toString();
                couponIndex++; // Move to the next coupon amount
            } else {
                // Handle the case where there are no more coupon amounts
                itemLine.couponAmt = ''; // or handle it as per your business logic
            }
        } else {
            itemLine.couponAmt = ''; // Assuming you want to set this as '0' for items without a coupon
        }
    });


    // iterate through receipt.dollarAmounts array adding each item to the new array "dollarAmountsToZero" until the value 0 is reached, at which point, do not add 0 to the array.
    let dollarAmountsToZero: number[] = [];

    for (let amount of receipt.dollarAmounts) {
        if (amount === 0) {
            break; // Stop the loop when a 0 is encountered
        }
        dollarAmountsToZero.push(amount); // Add amount to the new array
    }
    if (dollarAmountsToZero.length - receipt.itemLines.length <= 1) {
        // Iterate through the itemLines array, adding the dollarAmountsToZero values to the itemLines.itemPrice
        receipt.itemLines.forEach((itemLine, index) => {
            itemLine.itemPrice = dollarAmountsToZero[index];
        });
    }
    console.log("dollar amounts to zero length", dollarAmountsToZero.length);
    console.log("item lines length", receipt.itemLines.length);

    // if (dollarAmountsToZero.length < receipt.itemLines.length) {
    //     // remove the last item off the end of the receipt.itemLines array
    //     receipt.itemLines.pop();
    // }

    return { updatedText, receipt };
}

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

        if (text == "") {
            return res.status(400).send('No text extracted from document');
        }

        console.log("text as it comes from document ai", text)

        // Process the extracted text and get receipt data
        const { updatedText, receipt } = processReceiptText(text);

        // console.log("updatedText", updatedText)
        console.log("receipt", receipt)

        res.status(200).send('File uploaded successfully');
      } catch (error) {
          console.error('Error during file upload:', error);
          res.status(500).send('Error during file upload');
      }
  });
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });