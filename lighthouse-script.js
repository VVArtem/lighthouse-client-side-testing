const fs = require('fs') // filesystem for reports
const path = require('path');
const puppeteer = require('puppeteer') // lib -> manage user behavior in Chrome

const HomePage = require('./pages/HomePage');
const ProductListPage = require('./pages/ProductListPage');
const ProductDetailedPage = require('./pages/ProductDetailedPage');
const CartPage = require('./pages/CartPage');
const CheckoutPage = require('./pages/CheckoutPage');
const ThankYouPage = require('./pages/ThankYouPage');

const CsvFeeder = require('./utils/CsvFeeder');

async function captureReport() {
    const { startFlow } = await import('lighthouse');
    const { default: desktopConfig } = await import('lighthouse/core/config/desktop-config.js');

    const users = CsvFeeder.loadUsers(path.resolve('data/users.csv'));
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const browser = await puppeteer.launch({
        headless: "new", 
        args: [
            '--no-sandbox', 
            '--disable-gpu', 
            '--window-size=1920,1080',
            '--ignore-certificate-errors'
        ] 
    });

    const page = await browser.newPage()
    await page.setViewport({ "width": 1920, "height": 1080 })


    const homePage = new HomePage(page);
    const categoryPage = new ProductListPage(page);
    const productPage = new ProductDetailedPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const thankYouPage = new ThankYouPage(page);


    const flow = await startFlow(page, {
        name: 'Essentials frontend performance',
        config: desktopConfig, 
        configContext: {
            settingsOverrides: {
                screenEmulation: {
                    disabled: true,
                },
                throttlingMethod: "provided",
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
            await checkoutPage.fillOrderFields(randomUser);
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