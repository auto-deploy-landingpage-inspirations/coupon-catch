// cleanNoncaptureLines.ts

/**
 * Cleans text by removing specific patterns and empty lines.
 * @param text The input text to be cleaned.
 * @returns Cleaned text.
 */

export function cleanNoncaptureLines(text: string): string {
    // Regex to remove specific single characters (A, E, F) not part of larger words
    const regex = /(?<![a-zA-Z])[AEF](?![a-zA-Z])/g;
    text = text.replace(regex, "");

    // Remove any empty spaces at the beginning of a line
    text = text.replace(/^\s+/gm, "");

    // Regex to remove specific phrases
    const phraseRegex = /(?<![a-zA-Z])(Thank You!|Please Come Again|CHANGE|INSTANT SAVINGS|TAX|SUBTOTAL|TOTAL)(?![a-zA-Z])/g;
    text = text.replace(phraseRegex, "");

    // Remove any empty spaces at the beginning of a line
    text = text.replace(/^\s+/gm, "");

    // Remove empty lines
    text = text.replace(/^\s*[\r\n]/gm, "");

    // remove all occurences of * characters
    text = text.replace(/\*/g, "");

    // Remove unnecessary lines
    const removeLinesRegex =
        /^(AID:.*|Bottom.*|Seq#\s+\d+.*|EFT\/Debit|Tran.*|Merchant ID:.*|Resp.*|APPROVED.*|CHIP.*|App#:.*|Whse.*|Trm.*|Trn.*|OP.*|Name.*|Merchant.*|Costco Visa|Date of Birth.*|XXXXX.*|INSTANT.*|BOB Count.*|SEASONS.*|\d+(?:\.\d+)?\s*%.*?)$/gm;
    text = text.replace(removeLinesRegex, "");

    // Remove any emtpty lines
    text = text.replace(/^\s*[\r\n]/gm, "");

    // remove all occurences of * characters
    text = text.replace(/\*/g, "");

    // remove all occurences of * characters
    text = text.replace(/\*/g, "");

    // remove all lines that start with BOB.*|Bottom.*|Count.*
    const removeBobRegex = /^(BOB.*|Bottom.*|Count.*)$/gm;
    text = text.replace(removeBobRegex, "");
    // console.log("This is text left before line items are ran", updatedText);
    
    // Remove any empty spaces at the beginning of a line
    text = text.replace(/^\s+/gm, "");

    return text;
}
