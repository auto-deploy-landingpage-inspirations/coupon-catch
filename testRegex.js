function testRegex(sampleText, regexPattern) {
    const match = sampleText.match(regexPattern);
    let extractedValue = "";
    let remainingText = sampleText;

    if (match && match[1]) {
        extractedValue = match[1];
        remainingText = sampleText.replace(regexPattern, "");
    }

    console.log("Extracted Value:", extractedValue);
    console.log("Remaining Text:", remainingText);
}

// Sample text and regex pattern
let sampleText = "wwww\nHE Member 111932331984\nCOSTCO\nWHOLESALE\nThornton #629\n16375 N. Washington St.\nThornton, CO 80023\nSELF-CHECKOUT\n702669 BLACKBERRIES\n21390 HNY SMKD SLM\n7913 GREEN KIWI\n1014484 CANTALOUPE\nH\n4.99 \n14.71 \n6.99 \n5.89 \n32.58\n1.22\n33.80\nAMOUNT: $33.80\n11/17/2023 19:33 629 203 233 703\nNUMBER OF ITEMS SOLD =\n11/7/2023 19:33 629 203 233 703\n21062920302332311171933\n33.80\n0.00\n1.22\n1.22\n4\nItems Sold: 4\nHE 11/17/2023 19:33\n";
let regexPattern = /(COSTCO)/;

// Run the test
testRegex(sampleText, regexPattern);
