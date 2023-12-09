import { ILineItem } from "../../models/ILineItem";
import { IMultiplierLine } from "../../models/IMultiplierLine";
// Exporting the function as a module
export function findTaxAndRebateAmounts(
    totalAmount: number,
    dollarAmounts: number[],
    includeExecRebate: boolean
  ): { taxAmount: number; execRebateAmount: number; subtotal: number } {
    const epsilon = 0.01;
    let amountsMap = new Map();
    let potentialTaxAmounts: number[] = [];

    // let's use a hashmap, because we're not cavemen
    dollarAmounts.forEach(amount => {
      let potentialSubtotal = totalAmount - amount;
      // do your logic here in a single pass, champ
  });

    // iterate over unique dollar amounts
    amountsMap.forEach((_, amount) => {
        let potentialSubtotal = totalAmount - amount;
        // check in the map instead of array, saves us from an existential crisis
        if (amountsMap.has(potentialSubtotal) && Math.abs(amount - potentialSubtotal) >= epsilon) {
            potentialTaxAmounts.push(amount);
        }
    });

    // let's find the smallest tax amount, if any
    let taxAmount = 0, execRebateAmount = 0, subtotal = totalAmount;
    if (potentialTaxAmounts.length > 0) {
        taxAmount = Math.min(...potentialTaxAmounts);
        subtotal -= taxAmount;

        // oh, you want an exec rebate? let's find the next smallest
        if (includeExecRebate) {
            potentialTaxAmounts = potentialTaxAmounts.filter(amount => amount !== taxAmount);
            if (potentialTaxAmounts.length > 0) {
                execRebateAmount = Math.min(...potentialTaxAmounts);
            }
        }
    }

    // rounding because we're dealing with money, not monopoly money
    subtotal = parseFloat(subtotal.toFixed(2));

    return { taxAmount, execRebateAmount, subtotal };
}
  

    // add in multiplier lines to receipts items lines
  export function processMultiplierLines(multiplierLines: IMultiplierLine[], itemLines: any[]) {
      // Create a map for faster lookup
      const itemMap = new Map(itemLines.map(item => [item.itemNumber, item]));
  
      // Parse the multiplier item numbers once, outside the loop
      const parsedMultiplierLines = multiplierLines.map(multiplierLine => ({
          ...multiplierLine,
          itemNumber: parseInt(multiplierLine.itemNumber, 10)
      }));
  
      parsedMultiplierLines.forEach(multiplierLine => {
          const item = itemMap.get(multiplierLine.itemNumber);
          if (item) {
              // Directly apply the multiplier line values to the item
              item.itemPrice = multiplierLine.amount;
              item.quantity = multiplierLine.multiple;
          }
      });
  }

export function assignCouponsToItems(itemLines: ILineItem[], couponAmounts: number[]) {
  let couponIndex = 0; // because we're not savages

  return itemLines.map(itemLine => {
      if (itemLine.couponNum !== "") {
          const couponAmount = couponAmounts[couponIndex++];
          itemLine.origPurchasedCouponAmt = couponAmount ? couponAmount.toString() : "";
      } else {
          itemLine.origPurchasedCouponAmt = "";
      }
      return itemLine;
  });
}

export function processDollarAmounts(dollarAmounts: number[], itemLines: ILineItem[]) {
  // Find the first zero, use entire array if no zero found
  const endIndex = dollarAmounts.indexOf(0);
  const dollarAmountsToUse = endIndex !== -1 ? dollarAmounts.slice(0, endIndex) : dollarAmounts;
  const lengthDifference = dollarAmountsToUse.length - itemLines.length;

  // Update itemPrices only if lengthDifference is within the range
  if (lengthDifference <= 3) {
      for (let i = 0; i < itemLines.length; i++) {
          if (i < dollarAmountsToUse.length) {
              itemLines[i].itemPrice = dollarAmountsToUse[i];
          }
      }
  }

  // Adjust itemLines array length to match dollarAmountsToUse
  if (lengthDifference < 0) {
      itemLines.length = dollarAmountsToUse.length;
  }

  return { itemLines };
}
