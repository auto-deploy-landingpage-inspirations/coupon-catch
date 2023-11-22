import puppeteer from 'puppeteer';
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const readline = require('readline');
import { format, parse } from 'date-fns';

const url = "https://www.costco.com/online-offers.html";

// const serviceAccount = JSON.parse(fs.readFileSync('couponcatch-e211e-firebase-admin.json', 'utf8'));

const serviceAccount = require('../couponcatch-e211e-firebase-admin.json');

const scraperApp = initializeApp({
  credential: cert(serviceAccount),

});

const db = getFirestore();



interface CouponItem {
    itemNumbers: number[];
    discount: number;
}
const couponList: object[] = [];


// Function to scrape the Costco sale page
async function scrapeCostcoSale(url: string): Promise<{ couponDetails: { couponStartDate: string, couponEndDate: string, couponString: string }, data: CouponItem[] }> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const { couponStartDate, couponEndDate, couponString, data } = await page.evaluate((): { couponStartDate: string, couponEndDate: string, couponString: string, data: CouponItem[] } => {
        const results: CouponItem[] = [];
        const couponTextElement = document.querySelector('.eco-webvalid-header') as HTMLElement;
        const dateText = couponTextElement?.innerText;
        let couponStartDate = '';
        let couponEndDate = '';

        if (dateText) {
            const dateParts = dateText.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2} - (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}\b/);
            if (dateParts) {
                [couponStartDate, couponEndDate] = dateParts[0].split(' - ');
            }
        }

        const couponElements = document.querySelectorAll('#eco-webCoupons .eco-coupons');
        couponElements.forEach(el => {
            const headerText = (el.querySelector('.eco-header') as HTMLElement)?.innerText;
            if (!headerText || !headerText.includes("IN-WAREHOUSE")) {
                return;
            }

            const itemsText = (el.querySelector('.eco-items') as HTMLElement)?.innerText;
            const offText = (el.querySelector('.eco-off') as HTMLElement)?.innerText;

            if (itemsText && offText === 'OFF') {
                const itemNumbers = itemsText.replace('Item ', '').split(', ').map(Number);
                const dollars = parseFloat((el.querySelector('.eco-dollar') as HTMLElement)?.innerText || "0");
                const centsElement = el.querySelector('.eco-cents') as HTMLElement;
                const cents = centsElement && centsElement.innerText ? parseFloat("0." + centsElement.innerText) : 0;

                const discount = dollars + cents;
                results.push({ itemNumbers, discount });
            }
        });

        return { couponStartDate, couponEndDate, couponString: dateText, data: results };
    });

    await browser.close();

    // Convert the dates to ISO 8601 format
    const year = new Date().getFullYear(); // Assuming the year from the current date or parse from the string
    const formattedStartDate = format(parse(`${couponStartDate}, ${year}`, 'MMMM d, yyyy', new Date()), "yyyy-MM-dd'T'00:00:00.000'Z'");
    const formattedEndDate = format(parse(`${couponEndDate}, ${year}`, 'MMMM d, yyyy', new Date()), "yyyy-MM-dd'T'23:59:59.999'Z'");

    return { couponDetails: { couponStartDate, couponEndDate, couponString }, data };
}

// Call the function and log the results
scrapeCostcoSale(url).then(({ couponDetails, data }) => {
    const filteredData = [{ ...couponDetails }, ...data.filter(item => item.itemNumbers[0] !== null)];
    couponList.push(...filteredData);
    // console.log(filteredData);
    // console.log(couponList); // Log the couponList here after the data has been pushed
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
// Function to upload data to Firestore
async function uploadToFirestore(year: string, month: string, data: object[]) {
    if (data.length === 0) {
        console.log("No data to upload.");
        return;
    }

    try {
        const docRef = db.collection('sales').doc(year).collection(month).doc('coupons');
        await docRef.set({ data });
        console.log("Data uploaded successfully.");
    } catch (error) {
        console.error("Error uploading data:", error);
    }
}

// Main function to control the flow
async function main() {
    const { couponDetails, data } = await scrapeCostcoSale(url);

    const filteredData = [{ ...couponDetails }, ...data.filter(item => item.itemNumbers[0] !== null)];

    rl.question('Enter the year for the data upload: ', (year: string) => {
        rl.question('Enter the month for the data upload: ', async (month: string) => {
            await uploadToFirestore(year, month, filteredData);
            rl.close();
        });
    });
}

// Start the main function
main();