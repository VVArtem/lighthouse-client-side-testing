# Frontend Performance Testing Script

## Project Structure

The project follows directory organization:

```text
.
├── desktop                    # Desktop variant testing
│   ├── essentials.js
│   ├── user-flow.report.html
│   └── user-flow.report.json
├── dynamic                    # Mobile variant testing
│   ├── essentials.dynamic.js
│   ├── user-flow.report.html
│   └── user-flow.report.json
├── mobile                     # Desktop testing with random parameters
│   ├── essentials.mobile.js
│   ├── user-flow.report.html
│   └── user-flow.report.json
└── README.md
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

**(/desktop)**: Executed under ideal conditions (1920x1080, no throttling). 
This establishes a performance baseline to measure pure server response times on big screens.

**(/mobile)**: Emulates a mobile device using CPU throttling (4x) and Network throttling (Slow 4G). 
This creates a stress test to identify issues on mobile devices.

**(/dynamic)**: Prevents caching and verifies system stability across different page templates. 
Provides more reliable results when 5-10 tests executed in a row.

## How to Run

```bash
# For desktop variant
node ./desktop/essentials.js

# For mobile variant
node ./mobile/essentials.mobile.js

# Desktop variant with random categories and products
node ./dynamic/essentials.dynamic.js
```

## Author
**Artem Vusyk**

*Performance Testing Student*