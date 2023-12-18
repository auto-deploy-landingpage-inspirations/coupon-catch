import { cleanDataWithRegex, cleanNoncaptureLines } from "./dataCleaning";
import { assignCouponsToItems, findTaxAndRebateAmounts, processDollarAmounts, processMultiplierLines } from "./logicFunc/mathFunc";
import { IMultiplierLine } from "../models/IMultiplierLine";
import { IReceipt } from "../models/IReceipt";
import { ILineItem } from "../models/ILineItem";
import {
  extractDataWithRegex,
  extractBarcodeNumber,
  extractStoreAddress,
  extractStoreAddressTwo,
  extractSupplierName,
  extractStoreName,
  extractStoreNumber,
  extractMemberNumber,
  extractStoreTrmTrnOp,
  extractItemsSold,
  extractTotalAmount,
  extractMultiplierLines,
  extractDollarAmounts,
  extractCouponAmounts,
  // extractStoreName,
  // extractStoreNumber,
  // extractMemberNumber,
} from "./regexParsing";
import { ICoupon } from "../models/Coupon";
import { ICouponItem } from "../models/ICouponItem";

// Setup interface for receipt


function processReceiptText(text: string, uid: string): {
  updatedText: string;
  receipt: IReceipt;
  couponAmounts: number[];
  multiplierLines: IMultiplierLine[];
  dollarAmounts: number[];
  numberOfItemsOnReceipt: number;
} {
  let updatedText = text;

  // Initialize a receipt object with default values
  let receipt: IReceipt = {
    userId: uid,
    supplier: "",
    barcodeNumber: "",
    storeAddress: "",
    dayCode: "",
    memberNumber: 0,
    storeNumber: "",
    storeName: "",
    terminalNumber: 0, 
    transactionNumber: 0,
    operatorNumber: 0,
    timeOfPurchase: "",
    numberOfItems: 0,
    subTotal: 0,
    execCheckAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    // front end stuff
    createdAt: "",
    receiptIds: [],
    dateOfPurchase: "",
    unlockCouponTotal: 0,
    daysLeft: 0,
    isDeleted: false,
    isUnlocked: false,
    isRedeemed: false,
    itemLines: [],
  };
  
  // remove non-capture lines
  updatedText = cleanNoncaptureLines(updatedText);

  // Find and remove COSTCO and WHOLESALE from the text
  receipt.supplier = extractSupplierName(updatedText, /\s*COSTCO/);
  updatedText = cleanDataWithRegex(updatedText, /\s*COSTCO/);

  // Extracting "WHOLESALE" and appending it to the supplier string
  const wholesalePart = extractSupplierName(updatedText, /\s*WHOLESALE/);
  if (wholesalePart) {
    receipt.supplier += " " + wholesalePart;
  }
  updatedText = cleanDataWithRegex(updatedText, /\s*WHOLESALE/);

  // Barcode number extraction (should be used for returns in future)
  receipt.barcodeNumber = extractBarcodeNumber(updatedText, /\b(\d{23})\b/);
  updatedText = cleanDataWithRegex(updatedText, /\b(\d{23})\b/);

  // Extract store address, two checks in case first fails
  receipt.storeAddress = extractStoreAddress(
    updatedText,
    /(?:#\d{1,4}\s+)([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/
  );
  updatedText = updatedText.replace(/(?<=#\d{1,4}\s+)([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/, "");
  
  if (receipt.storeAddress == "") {
    receipt.storeAddress = extractStoreAddressTwo(
      updatedText,
      /(\d{1,}) [a-zA-Z0-9\s]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)?,?\s+[a-zA-Z]+,?\s+[A-Z]{2} [0-9]{5,6}/
    );
  }

  updatedText = updatedText.replace(
    /(\d{1,}) [a-zA-Z0-9\s]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Suite|Ave|Dr|Rd|Blvd|Ln|St|Ste)?,?\s+[a-zA-Z]+,?\s+[A-Z]{2} [0-9]{5,6}/,
    ""
  );

  // Extract store name
  receipt.storeName = extractStoreName(updatedText, /([a-zA-Z ]+)(?=\s#\d+)/);
  updatedText = updatedText.replace(/([a-zA-Z ]+)(?=\s#\d+)/, "");
  
  // Extract store number
  receipt.storeNumber = extractStoreNumber(updatedText, /#\s*(\d+)/);
  updatedText = updatedText.replace(/#\s*(\d+)/, "");
  updatedText = updatedText.replace(
    /(?:#\d{1,4}\s+)([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/,
    ""
  );
  const memberInfo = extractMemberNumber(
    updatedText,
    /\s?([A-Za-z0-9]{2})\s+Member\s+((111|9|8)\d{6,})\b/
    );
  receipt.memberNumber = memberInfo.memberNumber;
  receipt.dayCode = memberInfo.dayCode;

  updatedText = updatedText.replace(
    /\s?([A-Za-z0-9]{2})\s+Member\s+((111|9|8)\d{6,})\b/,
    ""
  );
  // Extract store, terminal, transaction, and operator numbers. Only change store number if blank from first check.
  const numberSequence = extractStoreTrmTrnOp(
    updatedText,
    /(\d{1,2}:\d{2}.*?)(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/s
  );
  receipt.storeNumber == ""
    ? (receipt.storeNumber = numberSequence.storeNumber)
    : (receipt.storeNumber = receipt.storeNumber);
  receipt.terminalNumber = numberSequence.terminalNumber;
  receipt.transactionNumber = numberSequence.transactionNumber;
  receipt.operatorNumber = numberSequence.operatorNumber;

  updatedText = cleanDataWithRegex(
    updatedText,
    /(?:\d{1,2}:\d{2}.*?)(\d+\s+\d+\s+\d+\s+\d+)/g
  );
  
  // Extract date of purchase
  receipt.dateOfPurchase = extractDataWithRegex<string>(
    updatedText,
    /(\d{2}\/\d{2}\/\d{4})/g,
    ""
  );
  updatedText = cleanDataWithRegex(updatedText, /(\d{2}\/\d{2}\/\d{4})/g);

    // Extract time of purchase
  receipt.timeOfPurchase = extractDataWithRegex<string>(
    updatedText,
    /(\d{2}:\d{2})/g,
    ""
  );
  updatedText = updatedText.replace(/(\d{2}:\d{2})/g, "");





  // Extract number of items
  receipt.numberOfItems = extractItemsSold(updatedText);
// 





  // Extract total amount of purchase
  const totalAmountRegex = /AMOUNT: *\$(\d+\.\d{2})/;
  receipt.totalAmount = extractTotalAmount(updatedText, totalAmountRegex);
  updatedText = updatedText.replace("AMOUNT", "");

  // Extract multiplier lines (lines with qty and price)
  const extractionResult = extractMultiplierLines(updatedText);
  let multiplierLines: IMultiplierLine[] = extractionResult.multiplierLines;
  updatedText = extractionResult.updatedText;

    // Extract an array of coupon amounts
  const couponExtractionResult = extractCouponAmounts(updatedText);
  let couponAmounts = couponExtractionResult.amounts;
  updatedText = couponExtractionResult.updatedText;

  // Extract an array of dollar amounts
  let dollarAmounts = extractDollarAmounts(updatedText);

  // If the max amount in dollarAmounts is greater than the totalAmount, set the totalAmount to the max amount
  if (Math.max(...dollarAmounts) > receipt.totalAmount) {
    const maxAmount = Math.max(...dollarAmounts);
    receipt.totalAmount = maxAmount; // maxAmount is already a number
  }
  updatedText = updatedText.replace(/(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g, "");

  const epsilon = 0.01;

  // Calculate and set tax amount, executive rebate amount, and subtotal
  const includeExecRebate = updatedText.includes("Executive Rebate");
  const { taxAmount, execRebateAmount, subtotal } = findTaxAndRebateAmounts(
    receipt.totalAmount,
    dollarAmounts,
    includeExecRebate
  );

  receipt.taxAmount = taxAmount;
  receipt.execCheckAmount = execRebateAmount;
  receipt.subTotal = subtotal;

  // Update dollarAmounts by filtering out tax amount, executive rebate amount, and the corresponding subtotals
  dollarAmounts = dollarAmounts.filter(
    (amount) =>
      Math.abs(amount - receipt.taxAmount) >= epsilon &&
      Math.abs(amount - receipt.execCheckAmount) >= epsilon &&
      Math.abs(amount - subtotal) >= epsilon &&
      Math.abs(amount - receipt.totalAmount) >= epsilon
  );

  receipt.createdAt = new Date().toISOString();

  // Remove any emtpty lines
  updatedText = updatedText.replace(/^\s*[\r\n]/gm, "");
  // remove all occurences of * characters
  updatedText = updatedText.replace(/\*/g, "");
  // remove all lines that start with BOB.*|Bottom.*|Count.*
  const removeBobRegex = /^(BOB.*|Bottom.*|Count.*|SELF-.*|ADJ.*)$/gm;
  updatedText = updatedText.replace(removeBobRegex, "");
  // Remove any empty spaces at the beginning of a line
  updatedText = updatedText.replace(/^\s+/gm, "");
    // Remove any emtpty lines
    updatedText = updatedText.replace(/^\s*[\r\n]/gm, "");

console.log("This is text left before line items are ran\n\n\n\n\n\n\n\n", updatedText);
// Outputs needs
// The up to date text as last edited
// The receipt object
// The multiplier lines array
// The coupon amounts array
// The dollar amounts array
// The number of items on the receipt

    return { updatedText, receipt, multiplierLines, couponAmounts, dollarAmounts, numberOfItemsOnReceipt: receipt.numberOfItems };

  }






  
  // Utility function to create a new line item
  function createLineItem(userId: string, receiptId: string, itemNumber: number, itemDesc: string): ILineItem {
    return {
      userId,
      receiptId,
      itemNumber,
      itemDesc: itemDesc.trim(),
      couponNum: "",
      origPurchasedCouponAmt: 0,
      itemPrice: 0,
      quantity: 1,
      isUnlocked: false,
      isRedeemed: false,
      availCouponAmount: 0,
    };
  }
  
// Inputs needed
// The up to date text as last edited
// The receipt id
// The multiplierLines array
// The coupon amounts array
// The dollar amounts array
// The number of items on the receipt


function processReceiptItemLines(
  uid: string,
  updatedText: string,
  receiptId: string,
  multiplierLines: any[],
  couponAmounts: number[],
  dollarAmounts: number[],
  numberOfItemsOnReceipt: number,
): { updatedItemLines: any[] } {

let itemLines: ILineItem[] = [];
let remainingText = updatedText;

  // Helper function to process line items based on a given regex
  function processLineItems(regex: RegExp, text: string) {
    let regexMatch;
    while ((regexMatch = regex.exec(text)) !== null) {
      if (
        !/^\d{3}/.test(regexMatch[2]) &&
        regexMatch[1].length <= 8 &&
        !/[a-z]/.test(regexMatch[2]) &&
        (regex === lineItemRegex || regexMatch[2].length > 3) // Additional check for the second regex
      ) {
        const itemNumber = parseInt(regexMatch[1], 10);
        const itemDesc = regexMatch[2];
        const newItem = createLineItem(uid, receiptId, itemNumber, itemDesc);
        itemLines.push(newItem);
        remainingText = remainingText.replace(regexMatch[0], "").replace(/(\r?\n){2,}/g, "\n");
      }
    }
  }

const lineItemRegex = /^\s*(\d+)\s+([\d\w].+)$/gm;
processLineItems(lineItemRegex, updatedText);

if (itemLines.length < numberOfItemsOnReceipt) {
  const lineItemRegexTwo = /(\d{1,7})\r?\n(.{4,})/gm;
  processLineItems(lineItemRegexTwo, remainingText);
}

  // Remove all blank lines
  remainingText = remainingText.replace(/^\s*[\r\n]/gm, "");


  // if numberOfItemsOnReceipt < itemLines.length, check for items where the numbers and desc may be on different lines
  if (itemLines.length < numberOfItemsOnReceipt) {
    //const lineItemRegexTwo = /(\d{1,7})\s+([^\n\/]{4,})/gm;
    const lineItemRegexTwo = /(\d{1,7})\r?\n(.{4,})/gm;
    let lineItemRegexTwoMatch;
    let remainingTextTwo = updatedText; // Copy of the original text for processing

    while ((lineItemRegexTwoMatch = lineItemRegexTwo.exec(updatedText)) !== null) {
      if (
        !/^\d{3}/.test(lineItemRegexTwoMatch[2]) &&
        lineItemRegexTwoMatch[1].length <= 8 &&
        !/[a-z]/.test(lineItemRegexTwoMatch[2]) &&
        lineItemRegexTwoMatch[2].length > 3
        // ONLY CONTINUE IF
        // the item description does NOT start with three digits
        // AND the item number is <= 8 digits
        // AND the item description does NOT contain any lowercase letters
        // AND the item description is longer than 3 characters
        ) {
          const itemNumber = parseInt(lineItemRegexTwoMatch[1], 10);
          const itemDesc = lineItemRegexTwoMatch[2];
          const newItem = createLineItem(uid, receiptId, itemNumber, itemDesc);
          itemLines.push(newItem); // Pushing directly to itemLines
          remainingTextTwo = remainingTextTwo.replace(lineItemRegexTwoMatch[0], "").replace(/(\r?\n){2,}/g, "\n");
        }
      }
      remainingTextTwo = remainingTextTwo.replace(/(\r?\n){2,}/g, "\n");
      updatedText = remainingText;
    }


// usage
numberOfItemsOnReceipt = processMultiplierLines(multiplierLines, itemLines);



  // See if the number of itemLines we found is equal to the number of items in the receipt, if so serve it up, if not, keep going
  // Convert the length of itemLines to a string
  const itemLinesLengthString = itemLines.length.toString();

  // Use a regex to search for this specific string in updatedText
  const itemLinesLengthRegex = new RegExp(`\\b${itemLinesLengthString}\\b`);
  const itemLinesLengthMatch = updatedText.match(itemLinesLengthRegex);

  // If the specific string is found, update numberOfItems
  if (itemLinesLengthMatch) {
    numberOfItemsOnReceipt = parseInt(itemLinesLengthMatch[0], 10);
  }
  updatedText = updatedText.replace(itemLinesLengthRegex, "");

  // console.log("THIS IS JUST BEFORE COUPON LINES RUNS\n", updatedText);

  const couponLineRegex = /^\s*(0000\d{6}|(?<!0000)\d{6})(?:\s*\/\s*(\d+))?$/gm;
  let couponLineRegexMatch;
  let couponLines = [];

  while ((couponLineRegexMatch = couponLineRegex.exec(updatedText)) !== null) {
    const couponNumber = couponLineRegexMatch[1];
    const itemNumber = couponLineRegexMatch[2];
    if (itemNumber) {
      couponLines.push({ couponNumber, itemNumber });
    }
  }
console.log("Coupon lines", couponLines);
  couponLines.forEach(({ couponNumber, itemNumber }) => {
    itemLines.forEach((item) => {
      if (item.itemNumber === parseInt(itemNumber)) {
        item.couponNum = couponNumber;
      }
    });
  });

  itemLines = assignCouponsToItems(itemLines, couponAmounts);

  const result = processDollarAmounts(dollarAmounts, itemLines);
  itemLines = result.itemLines;

  return { updatedItemLines: itemLines };
}

export { processReceiptText, processReceiptItemLines };
