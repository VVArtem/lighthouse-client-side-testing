const selectors = require('../config/selectors'); 

class ProductDetailedPage {
    constructor(page) {
        this.page = page;
    }

    async verifyLoaded() {
        await this.page.waitForSelector(selectors.product.addToCartBtn, { visible: true });
        console.log("Product Detailed Page loaded successfully");
    }

    async addToCart() {
        await this.page.click(selectors.product.addToCartBtn);
        await this.page.waitForSelector(selectors.product.goToCartBtn, { visible: true });
    }

    async goToCart() {        
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click(selectors.product.goToCartBtn),
        ]);
    }
}
module.exports = ProductDetailedPage;