# Amazon Order Tab Opener - Chrome Extension

A Google Chrome extension that allows you to paste multiple Amazon Order IDs and automatically generate and open the corresponding Amazon Seller Central order pages in separate browser tabs.

## Features

- **Bulk Order ID Processing**: Paste multiple Amazon Order IDs separated by newlines, commas, spaces, or tabs
- **Automatic URL Generation**: Generates Amazon Seller Central order URLs using the format `https://sellercentral.amazon.com/orders-v3/order/{ORDER_ID}`
- **Smart Tab Management**: 
  - Opens each order page in a separate tab
  - Opens tabs in the background to avoid interrupting your workflow
  - Detects if an order page is already open and activates it instead of creating duplicates
- **Order ID Validation**: Validates Order IDs against the standard Amazon format (XXX-XXXXXXX-XXXXXXX)
- **Duplicate Removal**: Automatically removes duplicate Order IDs while preserving order
- **Tab Opening Limit**: Shows confirmation dialog when opening more than 50 tabs
- **Copy Links**: Copy all generated URLs to clipboard with one click
- **Auto-Save**: Saves your input automatically using Chrome Storage API
- **Clean UI**: Modern, professional interface with Amazon-inspired colors

## Installation

### Step 1: Download the Extension

1. Clone or download this repository to your local machine
2. Navigate to the `amazon-order-tab-opener` folder

### Step 2: Load the Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** by toggling the switch in the top-right corner
4. Click **Load unpacked** button
5. Select the `amazon-order-tab-opener` folder
6. The extension icon should now appear in your Chrome toolbar

### Step 3: Pin the Extension (Optional)

1. Click the puzzle piece icon in the Chrome toolbar
2. Find "Amazon Order Tab Opener" in the list
3. Click the pin icon to keep it visible in your toolbar

## Usage

### Basic Usage

1. Click the extension icon in your Chrome toolbar
2. Paste your Amazon Order IDs in the textarea
3. Click **Open Order Tabs** to open all order pages

### Input Format

The extension accepts Order IDs in various formats:

**Newline-separated:**
```
114-1234567-1234567
114-7654321-7654321
114-9876543-9876543
```

**Comma-separated:**
```
114-1234567-1234567, 114-7654321-7654321, 114-9876543-9876543
```

**Mixed separators:**
```
114-1234567-1234567, 114-7654321-7654321
114-9876543-9876543	114-1111111-1111111
```

### Buttons

- **Open Order Tabs**: Opens all valid Order IDs in separate tabs
- **Copy All Links**: Copies all generated URLs to clipboard
- **Clear**: Clears the textarea and resets the display

### Results Summary

After processing, you'll see a summary showing:
- Valid Order IDs found
- Duplicate IDs removed
- Invalid entries ignored
- New tabs opened
- Existing tabs activated

## Order ID Format

Amazon Order IDs follow this pattern: `XXX-XXXXXXX-XXXXXXX`

Examples of valid Order IDs:
- `114-1234567-1234567`
- `111-2222222-3333333`
- `123-4567890-1234567`

Invalid entries will be ignored and counted in the results summary.

## Important Notes

### Prerequisites

- You must be logged into Amazon Seller Central in Chrome for the order pages to load properly
- The extension only generates and opens URLs - it does not interact with Amazon pages

### What This Extension Does NOT Do

- ❌ Scrape data from Amazon
- ❌ Automatically interact with Amazon pages
- ❌ Extract customer information
- ❌ Modify orders
- ❌ Bypass authentication
- ❌ Circumvent Amazon security

### Permissions

This extension requests only the following permissions:
- `tabs`: To open and manage order page tabs
- `storage`: To save your input between sessions

## Troubleshooting

### Extension icon not appearing
- Make sure Developer mode is enabled on `chrome://extensions/`
- Try reloading the extension

### Order pages not loading
- Ensure you're logged into Amazon Seller Central
- Check that your Order IDs are in the correct format

### Too many tabs warning
- If you enter more than 50 Order IDs, a confirmation dialog will appear
- This prevents accidentally opening too many tabs

### Input not saving
- The extension uses Chrome's local storage
- Clear browsing data may remove saved input

## File Structure

```
amazon-order-tab-opener/
├── manifest.json      # Extension configuration
├── popup.html         # Popup interface HTML
├── popup.css          # Styles for the popup
├── popup.js           # Main functionality
├── icons/
│   ├── icon16.png     # 16x16 icon
│   ├── icon48.png     # 48x48 icon
│   └── icon128.png    # 128x128 icon
└── README.md          # This file
```

## Updating Icons

If you want to customize the extension icons:

1. Replace the PNG files in the `icons/` folder
2. Ensure they are named `icon16.png`, `icon48.png`, and `icon128.png`
3. Reload the extension in Chrome

You can use the included `icon.svg` file as a template and convert it to PNG using any image editor or online converter.

## Privacy

This extension:
- Does not collect any personal data
- Does not transmit any data to external servers
- Stores data locally using Chrome Storage API
- Only interacts with Amazon Seller Central URLs you explicitly request

## Support

For issues or feature requests, please check the source code and modify as needed for your specific requirements.

## License

This extension is provided as-is for personal and business use.

---

**Note**: This extension is not affiliated with or endorsed by Amazon. Amazon Seller Central is a trademark of Amazon.com, Inc. or its affiliates.
