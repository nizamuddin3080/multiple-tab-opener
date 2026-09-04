# Universal Multi Tab Opener

A powerful Chrome Extension for opening multiple URLs, Amazon Order IDs, or custom template-based URLs in separate tabs. **Preserves exact input sequence.**

## Features

### Four Operating Modes

1. **Smart Auto Detect** - Automatically detects URLs, Amazon Order IDs, or applies custom templates while preserving sequence
2. **Direct Links** - Paste multiple URLs; auto-adds `https://` for domains without protocol
3. **Amazon Orders** - Enter Order IDs (format: `114-1234567-1234567`) to generate Seller Central URLs
4. **Custom Template** - Use placeholders like `{ID}`, `{VALUE}`, `{ORDER_ID}` to generate bulk URLs

### Key Features

- **Sequence Preservation**: Tabs open in the EXACT order of your input list
- **Batch Processing**: Open hundreds of links in configurable batches (10, 20, 50, 100, or all)
- **Configurable Delays**: Add delays between tabs (0ms, 250ms, 500ms, 1s, 2s)
- **Tab Grouping**: Automatically group opened tabs into Chrome Tab Groups
  - Single group for all tabs
  - Separate group per batch
- **Duplicate Detection**: Smart URL normalization prevents duplicates
- **Existing Tab Handling**: Skip, activate, or open duplicates
- **Preview & Filter**: Search, filter, and select items before opening
- **Session Management**: Close current batch or last session tabs
- **History**: Save and restore previous sessions
- **Auto-save**: Restores input when reopening extension

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `universal-multi-tab-opener` folder
5. Pin the extension to your toolbar

## Usage

### Direct Links Mode
```
https://google.com
https://amazon.com
example.com
facebook.com
```
Generates:
```
https://google.com
https://amazon.com
https://example.com
https://facebook.com
```

### Amazon Order ID Mode
Input:
```
114-1234567-1234567
114-7654321-7654321
```
Generates:
```
https://sellercentral.amazon.com/orders-v3/order/114-1234567-1234567
https://sellercentral.amazon.com/orders-v3/order/114-7654321-7654321
```

### Custom Template Mode
Template: `https://example.com/orders/{ID}`
Input:
```
12345
67890
99999
```
Generates:
```
https://example.com/orders/12345
https://example.com/orders/67890
https://example.com/orders/99999
```

### Smart Auto Detect
Mixed input is handled correctly while preserving sequence:
```
https://google.com
114-1234567-1234567
https://youtube.com
114-9876543-9876543
```
Opens in exact order: Google → Amazon Order 1 → YouTube → Amazon Order 2

## Settings

- **Maximum Tab Limit**: Warning threshold (default: 50)
- **History Limit**: Sessions to keep (default: 10)
- **Default Mode**: Starting mode on open
- **Existing Tab Behavior**: Activate/Skip/Duplicate
- **Auto-save Input**: Restore textarea content
- **Batch Size**: 10, 20, 50, 100, or all at once
- **Delay Between Tabs**: 0ms to 2000ms
- **Group Tabs**: Enable Chrome tab grouping

## Technical Details

- **Manifest Version**: 3
- **Permissions**: `tabs`, `storage`, `tabGroups`, `clipboardWrite`
- **No external dependencies**: Pure vanilla JavaScript
- **Privacy**: All processing local; no data collection

## File Structure

```
universal-multi-tab-opener/
├── manifest.json      - Extension configuration
├── popup.html         - UI structure
├── popup.css          - Styles
├── popup.js           - Main functionality
├── background.js      - Service worker
├── icons/
│   ├── icon16.png     - Toolbar icon
│   ├── icon48.png     - Extensions page icon
│   └── icon128.png    - Chrome Web Store icon
└── README.md          - This file
```

## Icon Creation

Icons are included as valid PNG files. To regenerate:

```bash
# Using ImageMagick
convert -size 128x128 xc:blue -fill white -gravity center \
  -pointsize 60 -annotate 0 "🌐" icons/icon128.png
convert icons/icon128.png -resize 48x48 icons/icon48.png
convert icons/icon128.png -resize 16x16 icons/icon16.png
```

Or use any online favicon generator with a globe/tab icon.

## Troubleshooting

**Tabs not opening?**
- Check Chrome hasn't blocked pop-ups (rarely needed for chrome.tabs.create)
- Ensure you have sufficient system resources for many tabs

**Wrong sequence?**
- The extension preserves sequence by `originalIndex` internally
- Filtering/searching in Preview doesn't change opening order

**Amazon IDs invalid?**
- Format must be: `XXX-XXXXXXX-XXXXXXX` (3-7-7 digits with dashes)

## License

MIT License - Free to use and modify.
