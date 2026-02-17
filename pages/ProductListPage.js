const selectors = require('../config/selectors'); 

class ProductListPage {
    constructor(page) {
        this.page = page;
    }

    async verifyLoaded() {
        await this.page.waitForSelector(selectors.category.productLinks, { visible: true });
        console.log("Product List Page loaded successfully");
    }

    async clickRandomProduct() {
        const links = await this.page.$$(selectors.category.productLinks)

        if (links.length === 0) {
            throw new Error(`No products found. Selector: ${selectors.category.productLinks}`);
        }
                
        const randomLink = links[Math.floor(Math.random() * links.length)];
        
        await Promise.all([
            this.page.waitForNavigation(),
            randomLink.click()
        ]);
    }
}
module.exports = ProductListPage;