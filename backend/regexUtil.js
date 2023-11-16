// regexUtil.js

// Function to remove single letters A, E, F
export function removeSingleLetters(text) {
    const regex = /(?<![a-zA-Z])[AEF](?![a-zA-Z])/g;
    return text.replace(regex, '');
}

// Function to remove common phrases
export function removePhrases(text) {
    const phraseRegex = /(?<![a-zA-Z])(Thank You!|Please Come Again|CHANGE|INSTANT SAVINGS|TAX|SUBTOTAL|TOTAL)(?![a-zA-Z])/g;
    return text.replace(phraseRegex, '');
}

// Function to extract Barcode number
export function extractBarcode(text) {
    const digitPattern = /\b\d{23}\b/g;
    const matches = text.match(digitPattern);
    const barcodeNumber = matches ? matches[0] : null;
    const newText = text.replace(digitPattern, '');
    
    return {
        text: text.replace(digitPattern, ''),
        barcodeNumber
    };
}

// Function to extract store address
// We expect the address to be preceded by a store number and a # sign (e.g., "#629")
export function extractStoreAddress(text) {
    const addressRegex = /#\d{1,4}\s+([\d\w\s.]+,\s+[A-Z]{2}\s+\d{5})/;
    const addressMatch = text.match(addressRegex);
    const storeAddress = addressMatch ? addressMatch[1].trim() : null;
    text = text.replace(addressRegex, '');

    return {
        text: text.replace(addressRegex, ''),
        storeAddress
    };

}

// Store name always appears before the # sign
// Lets change this regex so that it matches one or two words before the # sign that are stylized where the First letter of each work is capitalized
export function extractStoreName(text) {
    const storeNameRegex = /\b([A-Z][a-z]*\s?(?:[A-Z][a-z]*)?)\s*#/;
    const storeNameMatch = text.match(storeNameRegex);
    const storeName = storeNameMatch ? storeNameMatch[1].trim() : null;
    
    return {
        text: text.replace(storeNameRegex, ''),
        storeName
    };
}

export function extractStoreNumber(text) {
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
export function extractMemberNumber(text) {
    const memberNumberRegex = /Member\s+(111|9|8)\d{6,}\b/i;
    const memberNumberMatch = text.match(memberNumberRegex);
    const memberNumber = memberNumberMatch ? memberNumberMatch[0].trim() : null;
    text = text.replace(memberNumberRegex, '');

    return {
        text: text.replace(memberNumberRegex, ''),
        memberNumber
    };
}
