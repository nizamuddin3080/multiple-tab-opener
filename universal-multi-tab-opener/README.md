# Universal Multi Tab Opener - Chrome Extension

A powerful and easy-to-use Chrome extension that opens multiple URLs, Amazon Order pages, or custom URL templates in separate browser tabs.

## 🌟 Features

### Three Operating Modes

1. **Smart Auto Detect Mode** 🔍
   - Automatically detects whether you're pasting URLs, Amazon Order IDs, or using a custom template
   - Shows detected mode in real-time
   - Seamless switching between input types

2. **Direct Link Mode** 🔗
   - Paste multiple URLs separated by newlines, commas, spaces, or tabs
   - Automatically adds `https://` to domains without protocols
   - Validates and removes duplicate URLs
   - Preserves input order

3. **Amazon Order ID Mode** 📦
   - Enter Amazon Order IDs (format: XXX-XXXXXXX-XXXXXXX)
   - Automatically generates Seller Central URLs
   - Pattern: `https://sellercentral.amazon.com/orders-v3/order/{ORDER_ID}`

4. **Custom URL Template Mode** ⚙️
   - Create custom URL patterns with placeholders
   - Supported placeholders: `{ID}`, `{VALUE}`, `{ORDER_ID}`
   - Example: `https://example.com/orders/{ID}`

### Smart Features

- **Existing Tab Detection**: Checks if URLs are already open and activates them instead of creating duplicates
- **Preview Links**: Review generated URLs before opening, with option to deselect specific items
- **Copy Generated Links**: Copy all valid URLs to clipboard
- **Input History**: Saves last 10 sessions with date, mode, and item count
- **Auto-Save**: Restores your input when reopening the extension
- **Tab Limit Protection**: Warns before opening too many tabs (configurable)

### Customization Options

- Open tabs in background
- Activate existing tabs when found
- Skip already open links
- Configurable tab limit (default: 50)
- Configurable history limit (default: 10)

## 📁 Project Structure

```
universal-multi-tab-opener/
├── manifest.json      # Extension configuration (Manifest V3)
├── popup.html         # Popup interface HTML
├── popup.css          # Modern, professional styling
├── popup.js           # Main functionality
├── background.js      # Service worker for background tasks
├── icons/
│   ├── icon16.png     # 16x16 toolbar icon
│   ├── icon48.png     # 48x48 extension icon
│   └── icon128.png    # 128x128 Chrome Web Store icon
└── README.md          # This file
```

## 🚀 Installation Instructions

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/` in the address bar
   - Or click Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner to ON

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to and select the `universal-multi-tab-opener` folder
   - Click "Select Folder" or "Open"

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Universal Multi Tab Opener" in the list
   - Click the pin icon next to it

### Method 2: Package as CRX (Distribution)

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Pack extension"
4. Select the extension folder
5. Click "Pack extension" to create `.crx` and `.pem` files

## 📖 Usage Guide

### Basic Usage

1. **Click the extension icon** in your Chrome toolbar
2. **Choose a mode** using the tabs at the top:
   - 🔍 Smart (auto-detect)
   - 🔗 Direct Links
   - 📦 Amazon Orders
   - ⚙️ Custom Template
3. **Paste your input** in the textarea
4. **Click "Open All Tabs"** to open the URLs

### Input Formats

The extension accepts items separated by:
- New lines (Enter)
- Commas (,)
- Tabs
- Multiple spaces

#### Direct Links Examples:
```
https://google.com
https://amazon.com
https://youtube.com
```

Or:
```
google.com, amazon.com, youtube.com
```

Domains without `https://` will be automatically prefixed.

#### Amazon Order IDs Examples:
```
114-1234567-1234567
114-7654321-7654321
114-9876543-9876543
```

Or:
```
114-1234567-1234567, 114-7654321-7654321
```

#### Custom Template Examples:

Template: `https://example.com/orders/{ID}`

Input:
```
12345
67890
99999
```

Generated URLs:
```
https://example.com/orders/12345
https://example.com/orders/67890
https://example.com/orders/99999
```

### Using Preview Feature

1. Click **"Preview Links"** button
2. Review the generated URLs in the modal
3. Uncheck any URLs you don't want to open
4. Click **"Open Selected Tabs"** or **"Cancel"**

### Using History

1. Click the **"History"** tab
2. View previous sessions with date and item count
3. Click **"Reopen"** to restore a session's input
4. Click **"Copy"** to copy URLs from a session
5. Click **"Clear All History"** to remove all history

### Configuring Settings

1. Click the **"Settings"** tab
2. Adjust options:
   - **Maximum Tab Limit**: Warning threshold (1-500)
   - **History Entries**: Number of sessions to keep (1-100)
   - **Auto-save input**: Save textarea content on close
   - **Restore input**: Load saved content on open
3. Click **"Save Settings"**
4. Click **"Reset to Defaults"** to restore default values

## 🔧 Technical Details

### Permissions

The extension requests minimal permissions:
- `tabs`: To open new tabs and check existing tabs
- `storage`: To save settings, history, and input
- `clipboardWrite`: To copy URLs to clipboard
- `<all_urls>`: To check if URLs are already open

### Browser Compatibility

- **Google Chrome**: Version 88+ (Manifest V3 support)
- **Microsoft Edge**: Version 88+
- **Other Chromium browsers**: Opera, Brave, Vivaldi

### Data Storage

All data is stored locally using `chrome.storage.local`:
- Input text and custom templates
- User settings and options
- Session history (last 10 by default)

No data is sent to external servers.

## 🎨 UI Design

The extension features a modern, professional interface with:
- Clean, minimalist design
- Intuitive tab-based navigation
- Live counters for detected/valid/duplicate items
- Color-coded status indicators
- Smooth animations and transitions
- Responsive layout
- Toast notifications for feedback
- Loading overlay during processing

## ⚠️ Important Notes

### What This Extension Does:
- ✅ Opens URLs in new Chrome tabs
- ✅ Generates URLs from templates
- ✅ Activates existing tabs with matching URLs
- ✅ Manages and organizes your tab opening workflow

### What This Extension Does NOT Do:
- ❌ Scrape or extract data from websites
- ❌ Bypass login systems or security
- ❌ Automatically interact with web pages
- ❌ Submit forms or clicks
- ❌ Access private user information
- ❌ Modify website content

**Note**: You must be logged into Amazon Seller Central (or other sites) in Chrome for the opened tabs to show authenticated content.

## 🐛 Troubleshooting

### Extension not appearing in toolbar
- Make sure Developer mode is enabled
- Check if the extension is disabled
- Try reloading the extension from `chrome://extensions/`

### Tabs not opening
- Check if popup blocker is preventing tabs
- Ensure you have permission to open multiple tabs
- Verify the URLs are valid

### Input not saving
- Check if "Auto-save input" is enabled in Settings
- Ensure Chrome has storage permissions
- Try clearing Chrome's extension data

### Icons not displaying
- Verify all icon files exist in the `icons/` folder
- Check that icon paths in `manifest.json` are correct
- Reload the extension

## 📝 Version History

### Version 1.0.0
- Initial release
- Smart auto-detect mode
- Direct link mode
- Amazon Order ID mode
- Custom URL template mode
- Preview functionality
- History management
- Settings customization
- Existing tab detection
- Duplicate removal
- Input auto-save

## 📄 License

This extension is provided as-is for personal and commercial use.

## 🤝 Support

For issues, suggestions, or feedback:
1. Check this README for troubleshooting steps
2. Verify you're using the latest version
3. Ensure Chrome is updated to the latest version

## 🔒 Privacy Policy

This extension:
- Stores all data locally on your device
- Does not collect any personal information
- Does not send data to external servers
- Does not track usage or analytics
- Respects your privacy completely

---

**Enjoy opening multiple tabs efficiently!** 🚀
