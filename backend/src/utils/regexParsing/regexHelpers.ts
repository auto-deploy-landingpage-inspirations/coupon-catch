// regexHelpers.ts

import { IMultiplierLine } from "../../models/IMultiplierLine";

/*
maybe put these in process receipt text
It would be beneficial to add comments explaining each regex processing step for better readability.

and then here in this file and processReceiptText get some error handling in place
Ensure error handling for regex operations, as they can fail or return unexpected results.




*/
export function extractDataWithRegex<T extends string | number>(text: string,  regexPattern: RegExp, defaultValue: T): T {
    const match = text.match(regexPattern);
    if (match && match[1]) {
        return match[1].trim() as unknown as T;
    }
    return defaultValue;
}

export function extractSupplierName(text: string, regexPattern: RegExp): string {
    const supplierMatch = text.match(regexPattern);
    if (supplierMatch && supplierMatch.length > 1) {
        // Check if capturing group exists
        return supplierMatch[1].trim();
    } else {
        return "";
    }
}

export function extractBarcodeNumber(text: string, regexPattern: RegExp) {
    const matches = text.match(regexPattern);
    const barcodeNumber = matches ? matches[1] : "";
    return barcodeNumber;
}

export function extractStoreAddress(text: string, regexPattern: RegExp): string {
    const addressMatch = text.match(regexPattern);
    if (addressMatch) {
        // Replace newlines with ', ' and trim
        const formattedAddress = addressMatch[1].replace(/\n/g, ", ").trim();

        // Remove the matched address from the original text
        text = text.replace(addressMatch[0], "");

        return formattedAddress;
    } else {
        return "";
    }
}

export function extractStoreAddressTwo(text: string, regexPattern: RegExp): string {
    const addressMatch = text.match(regexPattern);
    if (addressMatch) {
        // Replace newlines with ', ' for multiline address parts and trim
        let formattedAddress = addressMatch[0].replace(/\n/g, ", ").trim();
        
        // Correct any double commas that may have been introduced
        formattedAddress = formattedAddress.replace(/, ,/g, ", ");

        // Remove the matched address from the original text
        text = text.replace(regexPattern, "");

        return formattedAddress;
    } else {
        return "";
    }
}

export function extractStoreName(text: string, regexPattern: RegExp): string {
    const storeNameMatch = text.match(regexPattern);
    if (storeNameMatch) {
        text = text.replace(regexPattern, ""); // Remove the matched name from the original text
        return storeNameMatch[1].trim();
    } else {
        return "";
    }
}

export function extractStoreNumber(text: string, regexPattern: RegExp): string {
    const storeNumberMatch = text.match(regexPattern);
    if (storeNumberMatch) {
        text = text.replace(regexPattern, ""); // Remove the matched number from the original text
        return storeNumberMatch[1].trim();
    } else {
        return "";
    }
}

export function extractMemberNumber(text: string, regexPattern: RegExp): { dayCode: string, memberNumber: number } {
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
    } else {
        return { dayCode: "", memberNumber: 0 };
    }
}

// Define an interface for the return type
interface StoreTrmTrnOp {
    storeNumber: string;
    terminalNumber: number;
    transactionNumber: number;
    operatorNumber: number;
}

/**
 * Extracts store number, terminal number, transaction number, and operator number from text.
 * @param text The text to extract data from.
 * @param regexPattern The regex pattern used for extraction.
 * @returns An object containing the extracted data.
 */
export function extractStoreTrmTrnOp(text: string, regexPattern: RegExp): StoreTrmTrnOp {
    const match = text.match(regexPattern);

    if (match) {
        return {
            storeNumber: match[2], // Assuming the second group captures the store number
            terminalNumber: parseInt(match[3], 10), // Assuming the third group captures the terminal number
            transactionNumber: parseInt(match[4], 10), // Assuming the fourth group captures the transaction number
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

/**
 * Extracts the number of items sold from the given text.
 * @param text The text to extract data from.
 * @returns The number of items sold.
 */
export function extractItemsSold(text: string): number {
    const itemsSoldRegex = /Items Sold:\s*(\d+)/i;
    const itemsSoldRegexTwo = /NUMBER OF ITEMS SOLD\s*[=-]?\s*\n\s*(\d+)/;

    // Extract number of items sold from the first pattern
    const itemsSoldMatch = text.match(itemsSoldRegex);
    if (itemsSoldMatch) {
        text = text.replace(itemsSoldRegex, "");
        return parseInt(itemsSoldMatch[1], 10);
    }

    // Extract number of items sold from the second pattern
    const itemsSoldMatchTwo = text.match(itemsSoldRegexTwo);
    if (itemsSoldMatchTwo && itemsSoldMatchTwo[1] == "0") {
        text = text.replace(itemsSoldRegexTwo, "");
        return parseInt(itemsSoldMatchTwo[1], 10);
    }

    // Return 0 if no match is found
    return 0;
}

export function extractTotalAmount(text: string, regexPattern: RegExp): number {
    const totalAmountMatch = text.match(regexPattern);
    if (totalAmountMatch) {
        return parseFloat(totalAmountMatch[1]);
    }
    return 0;
}

/**
 * Extracts multiplier lines from the given text.
 * @param text The text to extract data from.
 * @returns An object containing the extracted data and the updated text.
 */
export function extractMultiplierLines(text: string): { multiplierLines: IMultiplierLine[], updatedText: string } {
    const multiplierLinesRegex = /(\d+)\s+@\s+(\d{1,3}(?:,\d{3})*\.\d{2})/g;
    const mlineItemRegex = /(\d{1,7})\s+([a-zA-Z][^\n\/]{3,})\s*/g;
    let multiplierLinesMatch;
    let lastIndex = 0;
    const multiplierLines: IMultiplierLine[] = [];

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

interface ExtractionResult {
    amounts: number[];
    updatedText: string;
}

export function extractCouponAmounts(text: string): ExtractionResult {
    const couponAmountsRegex = /\b\d{1,3}(?:,\d{3})*\.\d{2}-\B/g;
    let match;
    const amounts: number[] = [];

    while ((match = couponAmountsRegex.exec(text)) !== null) {
        const amountString = match[0].slice(0, -1);
        const amountNumber = parseFloat(amountString.replace(/,/g, ""));
        amounts.push(amountNumber);
        text = text.replace(match[0], "");
    }

    return { amounts, updatedText: text };
}

export function extractDollarAmounts(text: string): number[] {
    const dollarAmountsRegex = /(?<!-)\b\d{1,3}(?:,\d{3})*\.\d{2}\b(?!\%)/g;
    let match;
    const amounts: number[] = [];

    while ((match = dollarAmountsRegex.exec(text)) !== null) {
        const amount = parseFloat(match[0].replace(/,/g, ""));
        amounts.push(amount);
    }

    return amounts;
}

