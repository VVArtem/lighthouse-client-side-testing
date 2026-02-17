const fs = require('fs') // filesystem for reports
const path = require('path');
const puppeteer = require('puppeteer') // lib -> manage user behavior in Chrome
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js') // full refresh + scrolls/...

const HomePage = require('./pages/HomePage');
const ProductListPage = require('./pages/ProductListPage');
const ProductDetailedPage = require('./pages/ProductDetailedPage');
const CartPage = require('./pages/CartPage');
const CheckoutPage = require('./pages/CheckoutPage');
const ThankYouPage = require('./pages/ThankYouPage');

async function captureReport() {

    const users = CsvLoader.loadUsers(path.resolve('data/users.csv'));
    const randomUser = users[Math.floor(Math.random() * users.length)];

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

    const page = await browser.newPage()
    await page.setViewport({ "width": 1920, "height": 1080 })


    const homePage = new HomePage(page);
    const categoryPage = new ProductListPage(page);
    const productPage = new ProductDetailedPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const thankYouPage = new ThankYouPage(page);


    const flow = await lighthouse.startFlow(page, {
        name: 'essentials-dynamic',
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


    try {
        await flow.navigate('http://localhost/', { stepName: 'Home Page Load' });
        await homePage.verifyLoaded();

        await flow.startNavigation({ stepName: 'Navigate to Category' });
            await homePage.clickRandomCategory();
        await flow.endNavigation();
        
        await categoryPage.verifyLoaded();

        await flow.startNavigation({ stepName: 'Navigate to Product' });
            await categoryPage.clickRandomProduct();
        await flow.endNavigation();
        
        await productPage.verifyLoaded();

        await flow.startTimespan({ stepName: 'Add to Cart' });
            await productPage.addToCart();
        await flow.endTimespan();

        await flow.startNavigation({ stepName: 'Go to Cart' });
            await productPage.goToCart();
        await flow.endNavigation();
        
        await cartPage.verifyLoaded();

        await flow.startNavigation({ stepName: 'Go to Checkout' });
            await cartPage.checkoutOrder();
        await flow.endNavigation();
        
        await checkoutPage.verifyLoaded();

        await flow.startTimespan({ stepName: 'Fill Checkout Form' });
            await checkoutPage.fillForm(randomUser);
        await flow.endTimespan();

        await flow.startNavigation({ stepName: 'Place Order' });
            await checkoutPage.placeOrder();
        await flow.endNavigation();

        await thankYouPage.verifyLoaded();

    } catch (error) {
        console.error('Error in flow:', error);
        await page.screenshot({ path: 'error.png', fullPage: true });
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