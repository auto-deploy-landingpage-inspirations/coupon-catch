"use strict";
// regexHelpers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDollarAmounts = exports.extractCouponAmounts = exports.extractMultiplierLines = exports.extractTotalAmount = exports.extractItemsSold = exports.extractStoreTrmTrnOp = exports.extractMemberNumber = exports.extractStoreNumber = exports.extractStoreName = exports.extractStoreAddressTwo = exports.extractStoreAddress = exports.extractBarcodeNumber = exports.extractSupplierName = exports.extractDataWithRegex = void 0;
/*
maybe put these in process receipt text
It would be beneficial to add comments explaining each regex processing step for better readability.

and then here in this file and processReceiptText get some error handling in place
Ensure error handling for regex operations, as they can fail or return unexpected results.




*/
function extractDataWithRegex(text, regexPattern, defaultValue) {
    const match = text.match(regexPattern);
    if (match && match[1]) {
        return match[1].trim();
    }
    return defaultValue;
}
exports.extractDataWithRegex = extractDataWithRegex;
function extractSupplierName(text, regexPattern) {
    const supplierMatch = text.match(regexPattern);
    if (supplierMatch && supplierMatch.length > 1) {
        // Check if capturing group exists
        return supplierMatch[1].trim();
    }
    else {
        return "";
    }
}
exports.extractSupplierName = extractSupplierName;
function extractBarcodeNumber(text, regexPattern) {
    const matches = text.match(regexPattern);
    const barcodeNumber = matches ? matches[1] : "";
    return barcodeNumber;
}
exports.extractBarcodeNumber = extractBarcodeNumber;
function extractStoreAddress(text, regexPattern) {
    const addressMatch = text.match(regexPattern);
    if (addressMatch) {
        // Replace newlines with ', ' and trim
        const formattedAddress = addressMatch[1].replace(/\n/g, ", ").trim();
        // Remove the matched address from the original text
        text = text.replace(addressMatch[0], "");
        return formattedAddress;
    }
    else {
        return "";
    }
}
exports.extractStoreAddress = extractStoreAddress;
function extractStoreAddressTwo(text, regexPattern) {
    const addressMatch = text.match(regexPattern);
    if (addressMatch) {
        // Replace newlines with ', ' for multiline address parts and trim
        let formattedAddress = addressMatch[0].replace(/\n/g, ", ").trim();
        // Correct any double commas that may have been introduced
        formattedAddress = formattedAddress.replace(/, ,/g, ", ");
        // Remove the matched address from the original text
        text = text.replace(regexPattern, "");
        return formattedAddress;
    }
    else {
        return "";
    }
}
exports.extractStoreAddressTwo = extractStoreAddressTwo;
function extractStoreName(text, regexPattern) {
    const storeNameMatch = text.match(regexPattern);
    if (storeNameMatch) {
        text = text.replace(regexPattern, ""); // Remove the matched name from the original text
        return storeNameMatch[1].trim();
    }
    else {
        return "";
    }
}
exports.extractStoreName = extractStoreName;
function extractStoreNumber(text, regexPattern) {
    const storeNumberMatch = text.match(regexPattern);
    if (storeNumberMatch) {
        text = text.replace(regexPattern, ""); // Remove the matched number from the original text
        return storeNumberMatch[1].trim();
    }
    else {
        return "";
    }
}
exports.extractStoreNumber = extractStoreNumber;
function extractMemberNumber(text, regexPattern) {
    const memberNumberMatch = text.match(regexPattern);
    if (memberNumberMatch) {
        const dayCode = memberNumberMatch[1].trim();
        const numberFound = memberNumberMatch[2].trim();
        // Check if the extracted member number is actually a number
        const parsedNumber = parseInt(numberFound, 10);
        if (isNaN(parsedNumber)) {
            console.error("Extracted member number is not a valid number:", numberFound);
            return { dayCode, memberNumber: 0 }; // Return 0 or any other default value
        }
        text = text.replace(regexPattern, "");
        return { dayCode, memberNumber: parsedNumber };
    }
    else {
        return { dayCode: "", memberNumber: 0 };
    }
}
exports.extractMemberNumber = extractMemberNumber;
/**
 * Extracts store number, terminal number, transaction number, and operator number from text.
 * @param text The text to extract data from.
 * @param regexPattern The regex pattern used for extraction.
 * @returns An object containing the extracted data.
 */
function extractStoreTrmTrnOp(text, regexPattern) {
    const match = text.match(regexPattern);
    if (match) {
        return {
            storeNumber: match[2],
            terminalNumber: parseInt(match[3], 10),
            transactionNumber: parseInt(match[4], 10),
            operatorNumber: parseInt(match[5], 10) // Assuming the fifth group captures the operator number
        };
    }
    // Return default values if no match is found
    return {
        storeNumber: '',
        terminalNumber: 0,
        transactionNumber: 0,
        operatorNumber: 0
    };
}
exports.extractStoreTrmTrnOp = extractStoreTrmTrnOp;
/**
 * Extracts the number of items sold from the given text.
 * @param text The text to extract data from.
 * @returns The number of items sold.
 */
function extractItemsSold(text) {
    let numberOfItems = 0;
    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    const itemsSoldRegexTwo = /NUMBER OF ITEMS SOLD\s*[=-]?\s*\n\s*(\d+)/;
    // Extract number of items sold from the first pattern
    const itemsSoldMatch = text.match(itemsSoldRegex);
    if (itemsSoldMatch) {
        numberOfItems = parseInt(itemsSoldMatch[1], 10);
    }
    // Always remove the first pattern, regardless of finding a match
    text = text.replace(itemsSoldRegex, "");
    // If no match was found or number of items was 0, attempt the second pattern
    if (numberOfItems === 0) {
        const itemsSoldMatchTwo = text.match(itemsSoldRegexTwo);
        if (itemsSoldMatchTwo) {
            numberOfItems = parseInt(itemsSoldMatchTwo[1], 10);
        }
    }
    // Always remove the second pattern, regardless of finding a match
    // This line should come after potentially using the second regex to extract the number of items
    text = text.replace(itemsSoldRegexTwo, "");
    // Return the number of items sold (or 0 if not found)
    return numberOfItems;
}
exports.extractItemsSold = extractItemsSold;
function extractTotalAmount(text, regexPattern) {
    const totalAmountMatch = text.match(regexPattern);
    if (totalAmountMatch) {
        return parseFloat(totalAmountMatch[1]);
    }
    return 0;
}
exports.extractTotalAmount = extractTotalAmount;
/**
 * Extracts multiplier lines from the given text.
 * @param text The text to extract data from.
 * @returns An object containing the extracted data and the updated text.
 */
function extractMultiplierLines(text) {
    const multiplierLinesRegex = /(\d+)\s+@\s+(\d{1,3}(?:,\d{3})*\.\d{2})/g;
    const mlineItemRegex = /(\d{1,7})\s+([a-zA-Z][^\n\/]{3,})\s*/g;
    let multiplierLinesMatch;
    let lastIndex = 0;
    const multiplierLines = [];
    while ((multiplierLinesMatch = multiplierLinesRegex.exec(text)) !== null) {
        const multiple = parseInt(multiplierLinesMatch[1], 10);
        const amount = parseFloat(multiplierLinesMatch[2].replace(/,/g, ""));
        lastIndex = multiplierLinesRegex.lastIndex;
        mlineItemRegex.lastIndex = lastIndex;
        const itemLineMatch = mlineItemRegex.exec(text);
        let itemNumber = "";
        if (itemLineMatch) {
            itemNumber = itemLineMatch[1];
        }
        multiplierLines.push({
            multiple: multiple,
            amount: amount,
            itemNumber: itemNumber,
        });
    }
    // Remove the matched patterns from the text
    text = text.replace(multiplierLinesRegex, "");
    return { multiplierLines, updatedText: text };
}
exports.extractMultiplierLines = extractMultiplierLines;
function extractCouponAmounts(text) {
    const couponAmountsRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}-\B/g;
    let match;
    const amounts = [];
    while ((match = couponAmountsRegex.exec(text)) !== null) {
        const amountString = match[0].slice(0, -1);
        const amountNumber = parseFloat(amountString.replace(/,/g, ""));
        amounts.push(amountNumber);
        text = text.replace(match[0], "");
    }
    return { amounts, updatedText: text };
}
exports.extractCouponAmounts = extractCouponAmounts;
function extractDollarAmounts(text) {
    const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g;
    let match;
    const amounts = [];
    while ((match = dollarAmountsRegex.exec(text)) !== null) {
        const amount = parseFloat(match[0].replace(/,/g, ""));
        amounts.push(amount);
    }
    return amounts;
}
exports.extractDollarAmounts = extractDollarAmounts;
