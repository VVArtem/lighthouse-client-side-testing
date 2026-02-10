const fs = require('fs') // reports -> disk
const puppeteer = require('puppeteer') // lib -> manage user behavior in Chrome
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js') // full refresh + scrolls/...

const waitTillHTMLRendered = async (page, timeout = 30000) => { //waiting for a full page load
    const checkDurationMsecs = 1000; //if the page size doen't change (several checks), then the page is fully loaded
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0;

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Fully Rendered Page: " + page.url());
            break;
        }

        lastHTMLSize = currentHTMLSize;
        //await page.waitForTimeout(checkDurationMsecs); (Deprecated)
        await new Promise(r => setTimeout(r, checkDurationMsecs));
    }
};

async function captureReport() { //we will call the function at the end of the script
    const browser = await puppeteer.launch({
        headless: "new", 
        args: [
            '--allow-no-sandbox-job', 
            '--allow-sandbox-debugging', 
            '--no-sandbox', 
            '--disable-gpu', 
            '--disable-gpu-sandbox', 
            '--display', 
            '--ignore-certificate-errors', 
            '--disable-storage-reset=true'] 
        });

    const page = await browser.newPage() // open new page in Chrome
    await page.setViewport({ "width": 1920, "height": 1080 }) //size fullHD, change if we emulate a mobile view

    const navigationPromise = page.waitForNavigation({ timeout: 30000, waitUntil: ['domcontentloaded'] }) // wait 30 sec for the DOMmodel to load

    const flow = await lighthouse.startFlow(page, { //define a tool that will measure UI
        name: 'essentials-desktop', //set any name
        configContext: {
            settingsOverrides: {
                throttling: {
                    rttMs: 40, // recommendation for Google- Ok
                    throughputKbps: 10240, //~ 10Mb Internet, recommendation for Google, don't write more than possible
                    cpuSlowdownMultiplier: 1, // 1 - use full CPU, 2 - use half of CPU
                    requestLatencyMs: 0, // not to change 0
                    downloadThroughputKbps: 0, // not to change 0
                    uploadThroughputKbps: 0 // not to change 0
                },
                throttlingMethod: "simulate", // not to change
                screenEmulation: { // not to change
                    mobile: false, // true if we emulate a mobile view
                    width: 1920, // change if we emulate a mobile view
                    height: 1080, // change if we emulate a mobile view
                    deviceScaleFactor: 1, // not to change
                    disabled: false, // not to change
                },
                formFactor: "desktop", //emulation of the desktop/mobile view of Chrome
                onlyCategories: ['performance'],
            },
        },
    });

    //User Parameters
    const name = "StrangeMan";
    const address = "SpookyLand";
    const postal = "76354";
    const city = "Ivano-Frankivsk";
    const country = "UA";
    const number = "1234567890";
    const email = "mail@mail.com";

    //View Links
    let HomePage = 'http://localhost/';
    let TablesPLP = 'http://localhost/tables';
    let TablePDP = 'http://localhost/products/living-room-table6';
    let CartPage = 'http://localhost/cart'
    let CheckoutPage = 'http://localhost/checkout';


    //CSS Selectors
    const addToCart = ".add-to-shopping-cart button[type='submit']";
    const addToCartCheck = ".add-to-shopping-cart .cart-added-info";
    const placeOrder = "input[value='Place Order']";

    const cartName = "input[name='cart_name']";
    const cartAddress = "input[name='cart_address']";
    const cartPostal = "input[name='cart_postal']";
    const cartCity = "input[name='cart_city']";
    const cartCountry = "select[name='cart_country']";
    const cartPhone = "input[name='cart_phone']";
    const cartEmail = "input[name='cart_email']";


    await flow.navigate(HomePage, { 
        stepName: 'Home Page'
    });
    console.log('Home Page opened');


    await flow.navigate(TablesPLP, {
        stepName: 'Open Tables List Page'
    });
    console.log('Tables List Page opened');


    await flow.navigate(TablePDP, {
        stepName: 'Open Table Product Detailed Page'
    });
    console.log('Product Detailed Page opened');


    await flow.startTimespan({ stepName: 'Add to cart interaction' });
        await page.waitForSelector(addToCart);
        await page.click(addToCart);
        await page.waitForSelector(addToCartCheck);
    await flow.endTimespan();
    console.log('Product added to cart');


    await flow.navigate(CartPage, {
        stepName: 'Cart Page'
    });
    console.log('Cart Page opened');


    await flow.navigate(CheckoutPage, {
        stepName: 'Checkout Page'
    });
    console.log('Checkout Page opened');


    await flow.startTimespan({ stepName: 'Fill Order Flow' });
        await page.waitForSelector(cartName);

        await page.type(cartName, name);
        await page.type(cartAddress, address);
        await page.type(cartPostal, postal);
        await page.type(cartCity, city);

        await page.select(cartCountry, country);

        await page.type(cartPhone, number);
        await page.type(cartEmail, email);
    await flow.endTimespan();
    console.log('Order fields are filled');


    await flow.startTimespan({ stepName: 'Place Order interaction' });
        await Promise.all([
            page.waitForNavigation(),
            page.click(placeOrder)
        ]);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
        console.log('Order has been placed');


    const currentUrl = page.url();

    if (currentUrl.includes('thank-you')) {
        console.log('Successfully got url: ' + currentUrl);
    } else {
        console.error('Order was not placed.');
        console.log('Current url: ' + currentUrl);
        await page.screenshot({ path: 'checkout-error.png', fullPage: true });
    }


    const reportPath = __dirname + '/user-flow.report.html'; //folder for html report
    const reportPathJson = __dirname + '/user-flow.report.json'; //folder for json report

    const report = await flow.generateReport();
    //(Deprecated) const reportJson = JSON.stringify(flow.getFlowResult()).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); //taken from GitHub
    const flowResult = await flow.createFlowResult();
    const reportJson = JSON.stringify(flowResult).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

    fs.writeFileSync(reportPath, report); //write html report
    fs.writeFileSync(reportPathJson, reportJson); //write json report

    await browser.close();
}

captureReport();