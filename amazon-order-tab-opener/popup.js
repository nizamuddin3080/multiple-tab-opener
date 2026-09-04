// Amazon Order Tab Opener - Popup JavaScript

// DOM Elements
const orderInput = document.getElementById('orderInput');
const counter = document.getElementById('counter');
const resultsDiv = document.getElementById('results');
const validCountEl = document.getElementById('validCount');
const duplicateCountEl = document.getElementById('duplicateCount');
const invalidCountEl = document.getElementById('invalidCount');
const tabsOpenedEl = document.getElementById('tabsOpened');
const tabsActivatedEl = document.getElementById('tabsActivated');
const openTabsBtn = document.getElementById('openTabsBtn');
const copyLinksBtn = document.getElementById('copyLinksBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Amazon Order ID regex pattern: XXX-XXXXXXX-XXXXXXX
const ORDER_ID_PATTERN = /^\d{3}-\d{7}-\d{7}$/;

// Base URL for Amazon Seller Central orders
const BASE_URL = 'https://sellercentral.amazon.com/orders-v3/order/';

// Maximum number of tabs before showing confirmation
const MAX_TABS_BEFORE_CONFIRM = 50;

/**
 * Extract and validate Order IDs from the input text
 * Supports separation by newlines, commas, spaces, and tabs
 */
function extractOrderIds(text) {
  // Split by common separators: newlines, commas, tabs, multiple spaces
  const rawIds = text.split(/[\n,\t\s]+/).filter(id => id.trim() !== '');
  
  const validIds = [];
  const invalidIds = [];
  
  rawIds.forEach(id => {
    const trimmedId = id.trim();
    if (ORDER_ID_PATTERN.test(trimmedId)) {
      validIds.push(trimmedId);
    } else if (trimmedId.length > 0) {
      invalidIds.push(trimmedId);
    }
  });
  
  return { validIds, invalidIds };
}

/**
 * Remove duplicates while preserving order
 */
function removeDuplicates(ids) {
  const seen = new Set();
  const unique = [];
  let duplicateCount = 0;
  
  ids.forEach(id => {
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(id);
    } else {
      duplicateCount++;
    }
  });
  
  return { uniqueIds: unique, duplicateCount };
}

/**
 * Generate URLs from Order IDs
 */
function generateUrls(orderIds) {
  return orderIds.map(id => `${BASE_URL}${id}`);
}

/**
 * Update the live counter display
 */
function updateCounter() {
  const text = orderInput.value;
  const { validIds } = extractOrderIds(text);
  counter.textContent = `Detected Order IDs: ${validIds.length}`;
}

/**
 * Save input to Chrome Storage
 */
function saveInput() {
  const text = orderInput.value;
  chrome.storage.local.set({ savedInput: text });
}

/**
 * Load saved input from Chrome Storage
 */
function loadSavedInput() {
  chrome.storage.local.get(['savedInput'], (result) => {
    if (result.savedInput) {
      orderInput.value = result.savedInput;
      updateCounter();
    }
  });
}

/**
 * Show loading overlay
 */
function showLoading() {
  loadingOverlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  loadingOverlay.style.display = 'none';
}

/**
 * Display results summary
 */
function displayResults(valid, duplicates, invalid, tabsOpened, tabsActivated) {
  validCountEl.textContent = valid;
  duplicateCountEl.textContent = duplicates;
  invalidCountEl.textContent = invalid;
  tabsOpenedEl.textContent = tabsOpened;
  tabsActivatedEl.textContent = tabsActivated;
  resultsDiv.style.display = 'flex';
}

/**
 * Hide results summary
 */
function hideResults() {
  resultsDiv.style.display = 'none';
}

/**
 * Check if a URL is already open in any tab
 * Returns the tab if found, null otherwise
 */
async function findExistingTab(url) {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs.find(tab => tab.url === url) || null;
  } catch (error) {
    console.error('Error querying tabs:', error);
    return null;
  }
}

/**
 * Open or activate tabs for the given URLs
 * Returns counts of new tabs opened and existing tabs activated
 */
async function openOrderTabs(urls) {
  let tabsOpened = 0;
  let tabsActivated = 0;
  
  for (const url of urls) {
    try {
      const existingTab = await findExistingTab(url);
      
      if (existingTab) {
        // Tab already exists, activate it
        await chrome.tabs.update(existingTab.id, { active: false });
        await chrome.windows.update(existingTab.windowId, { focused: true });
        tabsActivated++;
      } else {
        // Create new tab in background (active: false)
        await chrome.tabs.create({ 
          url: url, 
          active: false,
          index: 1 // Open as second tab to keep popup accessible
        });
        tabsOpened++;
      }
    } catch (error) {
      console.error(`Error opening tab for ${url}:`, error);
    }
  }
  
  return { tabsOpened, tabsActivated };
}

/**
 * Show confirmation dialog for large number of tabs
 */
function showConfirmation(tabCount) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
      <div class="confirmation-content">
        <h3>Confirm Tab Opening</h3>
        <p>You are about to open ${tabCount} Amazon order tabs. Do you want to continue?</p>
        <div class="confirmation-buttons">
          <button class="btn-cancel">Cancel</button>
          <button class="btn-confirm">Continue</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    const cancelBtn = dialog.querySelector('.btn-cancel');
    const confirmBtn = dialog.querySelector('.btn-confirm');
    
    const cleanup = () => {
      dialog.remove();
    };
    
    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    confirmBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
  });
}

/**
 * Copy all generated links to clipboard
 */
async function copyLinksToClipboard(urls) {
  const text = urls.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Clear all input and results
 */
function clearAll() {
  orderInput.value = '';
  updateCounter();
  hideResults();
  saveInput();
}

// Event Listeners

// Input event - update counter and save
orderInput.addEventListener('input', () => {
  updateCounter();
  saveInput();
  hideResults();
});

// Open Tabs button click
openTabsBtn.addEventListener('click', async () => {
  const text = orderInput.value;
  const { validIds, invalidIds } = extractOrderIds(text);
  const { uniqueIds, duplicateCount } = removeDuplicates(validIds);
  
  if (uniqueIds.length === 0) {
    alert('No valid Order IDs found. Please enter at least one valid Order ID.\n\nValid format: XXX-XXXXXXX-XXXXXXX (e.g., 114-1234567-1234567)');
    return;
  }
  
  // Check if confirmation is needed
  if (uniqueIds.length > MAX_TABS_BEFORE_CONFIRM) {
    const confirmed = await showConfirmation(uniqueIds.length);
    if (!confirmed) {
      return;
    }
  }
  
  // Generate URLs
  const urls = generateUrls(uniqueIds);
  
  // Show loading state
  showLoading();
  
  // Open tabs
  const { tabsOpened, tabsActivated } = await openOrderTabs(urls);
  
  // Hide loading and display results
  hideLoading();
  displayResults(
    uniqueIds.length,
    duplicateCount,
    invalidIds.length,
    tabsOpened,
    tabsActivated
  );
});

// Copy Links button click
copyLinksBtn.addEventListener('click', async () => {
  const text = orderInput.value;
  const { validIds } = extractOrderIds(text);
  const { uniqueIds } = removeDuplicates(validIds);
  
  if (uniqueIds.length === 0) {
    alert('No valid Order IDs found to copy.');
    return;
  }
  
  const urls = generateUrls(uniqueIds);
  const success = await copyLinksToClipboard(urls);
  
  if (success) {
    // Temporarily change button text to show feedback
    const originalText = copyLinksBtn.textContent;
    copyLinksBtn.textContent = '✓ Copied!';
    copyLinksBtn.style.backgroundColor = '#007185';
    copyLinksBtn.style.color = 'white';
    
    setTimeout(() => {
      copyLinksBtn.textContent = originalText;
      copyLinksBtn.style.backgroundColor = '';
      copyLinksBtn.style.color = '';
    }, 1500);
  } else {
    alert('Failed to copy links to clipboard.');
  }
});

// Clear button click
clearBtn.addEventListener('click', () => {
  clearAll();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedInput();
  updateCounter();
});
