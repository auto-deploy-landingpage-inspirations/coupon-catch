import puppeteer from 'puppeteer';
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const readline = require('readline');
import { parse, format } from 'date-fns';

const url = "https://www.costco.com/online-offers.html";

// const serviceAccount = JSON.parse(fs.readFileSync('couponcatch-e211e-firebase-admin.json', 'utf8'));

const serviceAccount = require('../couponcatch-e211e-firebase-admin.json');

const scraperApp = initializeApp({
  credential: cert(serviceAccount),

});

const db = getFirestore();

interface ICouponItem {
    itemNumber: number | null;
    discount: number;
    desc: string;
}
const couponList: object[] = [];


// Function to scrape the Costco sale page
async function scrapeCostcoSale(url: string): Promise<{ couponDetails: { couponStartDate: string, couponEndDate: string, couponString: string }, data: ICouponItem[] }> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const { couponStartDate, couponEndDate, couponString, data } = await page.evaluate((): { couponStartDate: string, couponEndDate: string, couponString: string, data: ICouponItem[] } => {
        // Redefine the checkMultipleDiscounts function inside the evaluate
        const checkMultipleDiscounts = (element: Element): string[] => {
            const dollarElements = element.querySelectorAll('.eco-dollar');
            const centElements = element.querySelectorAll('.eco-cents');
            const prices: string[] = [];
        
            // Iterate over the dollar and cent elements
            for (let i = 0; i < dollarElements.length; i++) {
                const dollars = dollarElements[i].textContent?.trim();
                const cents = centElements[i]?.textContent?.trim();
        
                if (dollars) {
                    let price = dollars;
                    if (cents) {
                        price += '.' + cents;
                    }
                    // Rremove "-" from price
                    price = price.replace(/-/g, '');
                    prices.push(price);
                }
            }
            // Check if there are at least two prices
            return prices;
        };
        const results: ICouponItem[] = [];
        const couponTextElement = document.querySelector('.eco-webvalid-header');
        const dateText = couponTextElement?.textContent || ''; // changed to textContent
        let couponStartDate = '';
        let couponEndDate = '';

        if (dateText) {
            const dateParts = dateText.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2} - (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/);
            if (dateParts) {
                // Convert couponStartDate to ISO8601 format
                [couponStartDate, couponEndDate] = dateParts[0].split(' - ');
            }
        }

        const couponElements = document.querySelectorAll('#eco-webCoupons .eco-coupons');
        couponElements.forEach(el => {
            const headerText = el.querySelector('.eco-header')?.textContent;
            const offText = el.querySelector('.eco-off')?.textContent;
            if (!headerText || !headerText.includes("IN-WAREHOUSE") || !offText || !offText.includes('OFF')) {
                return;
            }
        
            const itemsText = el.querySelector('.eco-items')?.textContent;
            const itemNumbersArray = itemsText
                ? itemsText.replace(/Item /g, '').split(', ').map(Number).filter(n => !isNaN(n))
                : [];
        
            const descText = el.querySelector('.eco-sl1')?.textContent || '';
            const discounts = checkMultipleDiscounts(el);
        
            const isVariableItem = itemsText && (itemsText.includes('Item numbers var') || itemsText.includes('Item number var'));
            discounts.forEach(discount => {
                const discountValue = parseFloat(discount);
                if (isVariableItem) {
                    results.push({ itemNumber: null, discount: discountValue, desc: descText });
                } else {
                    itemNumbersArray.forEach(itemNumber => {
                        results.push({ itemNumber, discount: discountValue, desc: descText });
                    });
                }
            });
        });
        
        

        return { couponStartDate, couponEndDate, couponString: dateText, data: results };
    });

    await browser.close();

    // Assume the year you want to append is 2023
    const currentYear = new Date().getFullYear();
    
    // Append the year to the couponStartDate and parse it
    const fullCouponStartDate = `${couponStartDate}, ${currentYear}`;
    const parsedCouponStartDate = parse(fullCouponStartDate, 'MMMM d, yyyy', new Date());
    // Format the parsed date into "MM/dd/yyyy" format
    const couponStartDateFormatted = format(parsedCouponStartDate, 'MM/dd/yyyy');

    // Append the year to the couponEndDate and parse it
    const parsedCouponEndDate = parse(couponEndDate, 'MMMM d, yyyy', new Date());
    // Format the parsed date into "MM/dd/yyyy" format
    const couponEndDateFormatted = format(parsedCouponEndDate, 'MM/dd/yyyy');

    return { couponDetails: { couponStartDate: couponStartDateFormatted, couponEndDate: couponEndDateFormatted, couponString }, data };
}

// Call the function and log the results
scrapeCostcoSale(url).then(({ couponDetails, data }) => {
    // const filteredData = [{ ...couponDetails }, ...data.filter(item => item.itemNumbwr[0] !== null)];
    const filteredData = [{ ...couponDetails }, ...data];

    couponList.push(...filteredData);
    // console.log(filteredData);
    // console.log(couponList); // Log the couponList here after the data has been pushed
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  async function uploadToFirestore(year: string, couponDetails: any, data: object[]) {
    if (data.length === 0) {
        console.log("No data to upload.");
        return;
    }

    const monthDocRef = db.collection('sales').doc(year);
    const couponsCollectionRef = monthDocRef.collection('coupons');

    for (const item of data) {
        try {
            const couponItem = { ...couponDetails, ...item };
            await couponsCollectionRef.add(couponItem);
            console.log("Coupon item uploaded successfully.");
        } catch (error) {
            console.error("Error uploading coupon item:", error);
        }
    }
}


async function main() {
    const { couponDetails, data } = await scrapeCostcoSale(url);
    const filteredData = data; // Assuming data is already filtered

    rl.question('Enter the year for the data upload: ', async (year: string) => {
        await uploadToFirestore(year, couponDetails, filteredData);
        rl.close();
    });
}


// Start the main function
main();