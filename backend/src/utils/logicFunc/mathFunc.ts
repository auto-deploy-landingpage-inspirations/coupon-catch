import { ILineItem } from "../../models/ILineItem";
import { IMultiplierLine } from "../../models/IMultiplierLine";
// Exporting the function as a module
export function findTaxAndRebateAmounts(
    totalAmount: number,
    dollarAmounts: number[],
    includeExecRebate: boolean
  ): { taxAmount: number; execRebateAmount: number; subtotal: number } {
    const epsilon = 0.01;
    const sortedDollarAmounts = [...new Set(dollarAmounts)].sort((a, b) => a - b);
    let potentialTaxAmounts: number[] = [];

    const potentialSubtotals = new Set(
      sortedDollarAmounts.map(amount => totalAmount - amount)
    );

    for (const amount of sortedDollarAmounts) {
      if (potentialSubtotals.has(amount)) {
        potentialTaxAmounts.push(amount);
      }
    }

    let taxAmount = 0;
    let execRebateAmount = 0;
    let subtotal = totalAmount;

    potentialTaxAmounts = potentialTaxAmounts.sort((a, b) => a - b); // Sort potentialTaxAmounts in ascending order

    const nonZeroTaxAmounts = potentialTaxAmounts.filter(amount => amount > 0);
    if (nonZeroTaxAmounts.length > 0) {
      taxAmount = Math.min(...nonZeroTaxAmounts);
      const filteredTaxAmounts = nonZeroTaxAmounts.filter(amount => amount !== taxAmount);
      if (includeExecRebate && filteredTaxAmounts.length > 0) {
        execRebateAmount = Math.min(...filteredTaxAmounts);
      }
      subtotal = totalAmount - taxAmount;
      subtotal = parseFloat(subtotal.toFixed(2));
    }

    return { taxAmount, execRebateAmount, subtotal };
  }
  

    // add in multiplier lines to receipts items lines
  export function processMultiplierLines(multiplierLines: IMultiplierLine[], itemLines: any[]) {
    // create a map for faster lookup
    const itemMap = new Map(itemLines.map(item => [item.itemNumber, item]));

    multiplierLines.forEach(multiplierLine => {
        const item = itemMap.get(parseInt(multiplierLine.itemNumber, 10));
        if (item) {
            const product = multiplierLine.multiple * multiplierLine.amount;
            // let's not divide by zero, shall we?
            if (product !== 0 && item.itemPrice % product === 0) {
                item.itemPrice = multiplierLine.amount;
                item.quantity = multiplierLine.multiple;
            }
        }
    });

    // update numberOfItemsOnReceipt only if it's not already set
    return itemLines.reduce((acc, item) => acc + item.quantity, 0);
}

export function assignCouponsToItems(itemLines: ILineItem[], couponAmounts: number[]) {
  const couponIterator = couponAmounts[Symbol.iterator]();

  return itemLines.map(itemLine => {
      if (itemLine.couponNum !== "") {
          const couponAmount = couponIterator.next().value;
          itemLine.origPurchasedCouponAmt = couponAmount ? couponAmount.toString() : "";
      } else {
          itemLine.origPurchasedCouponAmt = 0;
      }
      return itemLine;
  });
}

export function processDollarAmounts(dollarAmounts: number[], itemLines: ILineItem[]) {
    const dollarAmountsToZero = dollarAmounts.slice(0, dollarAmounts.indexOf(0));
    const lengthDifference = dollarAmountsToZero.length - itemLines.length;

    if (lengthDifference <= 3) {
        itemLines.forEach((itemLine, index) => {
            itemLine.itemPrice = dollarAmountsToZero[index] || itemLine.itemPrice;
        });
    }

    if (lengthDifference < 0) {
        itemLines.length = dollarAmountsToZero.length; // Truncate itemLines to match dollarAmountsToZero length
    }

    console.log("dollar amounts to zero length", dollarAmountsToZero.length);
    console.log("item lines length", itemLines.length);

    // Return the modified itemLines in the same structure
    return { itemLines };
}