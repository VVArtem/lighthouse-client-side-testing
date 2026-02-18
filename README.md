# Frontend Performance Testing Script

## Project Structure

The project follows next directory organization:

```text
.
├── config
│   └── selectors.js
├── data
│   └── users.csv
├── pages
│   ├── CartPage.js
│   ├── CheckoutPage.js
│   ├── HomePage.js
│   ├── ProductDetailedPage.js
│   ├── ProductListPage.js
│   └── ThankYouPage.js
├── utils
│   └── CsvFeeder.js
├── lighthouse-script.js
├── lighthouse-script-mobile.js
├── README.md
├── user-flow.report.html
└── user-flow.report.json
```

## Testing scenario

1. Open the application
2. Navigate to "Tables" tab
3. Open a table product cart (click on a table)
4. Add table to Cart (click "Add to Cart" button)
5. Open Cart
6. Click "Place an order"
7. Fill in all required fields, click "Place order"

## Details

This project is a performance testing suite built with Lighthouse User Flows. It is designed to measure how a website performs during a typical customer journey, from landing on the home page to completing a purchase.

- **User Flow Testing:** Instead of auditing a single URL, the script captures performance metrics during a sequence of navigations and user interactions (timespans).

- **Distributed Architecture (POM):** The script uses the Page Object Model. Each page's logic is stored in the pages/ directory, which makes the code easier to read and maintain.

- **Centralized Selectors:** All CSS selectors are stored in config/selectors.js. This allows for quick updates if the website's UI changes without touching the test logic.

- **Automated Data Entry:** The checkout process uses data from a users.csv file to simulate real user input automatically.

## How to Run

1. **Installation**

To get started, you need to have Node.js installed. Clone the repository and install the necessary dependencies:

```Bash
npm install lighthouse puppeteer
```

2. **Execution**

To run the performance test for desktop, use the following commands:

```Bash
node lighthouse-script.js           # For desktop simulation
node lighthouse-script-mobile.js    # For mobile simulation
```

3. **Reports**

Once the execution is finished, the script generates two files:

- user-flow.report.html: A visual report that can be opened in any web browser.

- user-flow.report.json: A raw data file containing all performance metrics.

## Author
**Artem Vusyk**

*Performance Testing Student*