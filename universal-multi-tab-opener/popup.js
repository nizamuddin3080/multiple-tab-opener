/**
 * Universal Multi Tab Opener - Popup Script
 * 
 * Main functionality for handling URL opening, Amazon Order ID processing,
 * custom templates, history management, and settings.
 */

// ============================================
// Constants & Configuration
// ============================================

const MODES = {
  SMART: 'smart',
  DIRECT: 'direct',
  AMAZON: 'amazon',
  CUSTOM: 'custom',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

const PLACEHOLDERS = ['{ID}', '{VALUE}', '{ORDER_ID}'];

const DEFAULT_SETTINGS = {
  tabLimit: 50,
  historyLimit: 10,
  autoSave: true,
  restoreInput: true
};

const DEFAULT_OPTIONS = {
  background: true,
  activate: true,
  skip: true
};

// Amazon Order ID regex pattern: XXX-XXXXXXX-XXXXXXX
const AMAZON_ORDER_REGEX = /^\d{3}-\d{7}-\d{7}$/;

// URL regex pattern for validation
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

// Full URL pattern with protocol
const FULL_URL_REGEX = /^https?:\/\/.+/i;

// ============================================
// State Management
// ============================================

let currentState = {
  mode: MODES.SMART,
  inputText: '',
  customTemplate: '',
  settings: { ...DEFAULT_SETTINGS },
  options: { ...DEFAULT_OPTIONS },
  history: [],
  previewItems: [],
  detectedMode: MODES.DIRECT
};

// ============================================
// DOM Elements Cache
// ============================================

let elements = {};

function cacheElements() {
  elements = {
    // Mode tabs
    modeTabs: document.querySelectorAll('.mode-tab'),
    
    // Panels
    panels: {
      smart: document.getElementById('panel-smart'),
      direct: document.getElementById('panel-direct'),
      amazon: document.getElementById('panel-amazon'),
      custom: document.getElementById('panel-custom'),
      history: document.getElementById('panel-history'),
      settings: document.getElementById('panel-settings')
    },
    
    // Detection status
    detectionStatus: document.getElementById('smart-detection-status'),
    
    // Input section
    inputSection: document.getElementById('main-input-section'),
    textarea: document.getElementById('input-textarea'),
    customTemplate: document.getElementById('custom-template'),
    
    // Counters
    countDetected: document.getElementById('count-detected'),
    countValid: document.getElementById('count-valid'),
    countDuplicates: document.getElementById('count-duplicates'),
    
    // Options
    optBackground: document.getElementById('opt-background'),
    optActivate: document.getElementById('opt-activate'),
    optSkip: document.getElementById('opt-skip'),
    
    // Buttons
    btnOpen: document.getElementById('btn-open'),
    btnPreview: document.getElementById('btn-preview'),
    btnCopy: document.getElementById('btn-copy'),
    btnClear: document.getElementById('btn-clear'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnResetSettings: document.getElementById('btn-reset-settings'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    
    // Results summary
    resultsSummary: document.getElementById('results-summary'),
    sumValid: document.getElementById('sum-valid'),
    sumDuplicates: document.getElementById('sum-duplicates'),
    sumInvalid: document.getElementById('sum-invalid'),
    sumNewTabs: document.getElementById('sum-new-tabs'),
    sumExisting: document.getElementById('sum-existing'),
    
    // Settings inputs
    settingTabLimit: document.getElementById('setting-tab-limit'),
    settingHistoryLimit: document.getElementById('setting-history-limit'),
    settingAutoSave: document.getElementById('setting-auto-save'),
    settingRestoreInput: document.getElementById('setting-restore-input'),
    
    // History
    historyList: document.getElementById('history-list'),
    
    // Modal
    previewModal: document.getElementById('preview-modal'),
    previewList: document.getElementById('preview-list'),
    modalClose: document.getElementById('modal-close'),
    btnConfirmOpen: document.getElementById('btn-confirm-open'),
    btnCancelPreview: document.getElementById('btn-cancel-preview'),
    
    // Loading & Toast
    loadingOverlay: document.getElementById('loading-overlay'),
    toast: document.getElementById('toast')
  };
}

// ============================================
// Initialization
// ============================================

async function init() {
  cacheElements();
  setupEventListeners();
  await loadFromStorage();
  applySettings();
  applyOptions();
  updateCounters();
  updateDetectionStatus();
  
  // Show/hide input section based on mode
  toggleInputSection();
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Mode tabs
  elements.modeTabs.forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });
  
  // Input textarea
  elements.textarea.addEventListener('input', handleInput);
  
  // Custom template
  elements.customTemplate.addEventListener('input', handleTemplateChange);
  
  // Options
  elements.optBackground.addEventListener('change', saveOptions);
  elements.optActivate.addEventListener('change', saveOptions);
  elements.optSkip.addEventListener('change', saveOptions);
  
  // Action buttons
  elements.btnOpen.addEventListener('click', handleOpenTabs);
  elements.btnPreview.addEventListener('click', handlePreview);
  elements.btnCopy.addEventListener('click', handleCopyLinks);
  elements.btnClear.addEventListener('click', handleClear);
  
  // Settings buttons
  elements.btnSaveSettings.addEventListener('click', handleSaveSettings);
  elements.btnResetSettings.addEventListener('click', handleResetSettings);
  
  // History button
  elements.btnClearHistory.addEventListener('click', handleClearHistory);
  
  // Modal controls
  elements.modalClose.addEventListener('click', closeModal);
  elements.btnCancelPreview.addEventListener('click', closeModal);
  elements.btnConfirmOpen.addEventListener('click', confirmOpenFromPreview);
  
  // Close modal on outside click
  elements.previewModal.addEventListener('click', (e) => {
    if (e.target === elements.previewModal) {
      closeModal();
    }
  });
}

// ============================================
// Mode Switching
// ============================================

function switchMode(mode) {
  currentState.mode = mode;
  
  // Update active tab
  elements.modeTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  
  // Update active panel
  Object.values(elements.panels).forEach(panel => {
    panel.classList.remove('active');
  });
  
  if (elements.panels[mode]) {
    elements.panels[mode].classList.add('active');
  }
  
  // Toggle input section visibility
  toggleInputSection();
  
  // Update detection status for smart mode
  if (mode === MODES.SMART) {
    updateDetectionStatus();
  }
  
  // Save current mode
  saveToStorage();
}

function toggleInputSection() {
  const modesWithInput = [MODES.SMART, MODES.DIRECT, MODES.AMAZON, MODES.CUSTOM];
  const showInput = modesWithInput.includes(currentState.mode);
  
  elements.inputSection.classList.toggle('hidden', !showInput);
}

// ============================================
// Input Processing
// ============================================

function handleInput() {
  currentState.inputText = elements.textarea.value.trim();
  updateCounters();
  updateDetectionStatus();
  
  if (currentState.settings.autoSave) {
    debounceSave();
  }
}

function handleTemplateChange() {
  currentState.customTemplate = elements.customTemplate.value.trim();
  updateCounters();
  
  if (currentState.settings.autoSave) {
    debounceSave();
  }
}

let saveTimeout = null;

function debounceSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveToStorage();
  }, 500);
}

// ============================================
// Counter Updates
// ============================================

function updateCounters() {
  const items = parseInput();
  const uniqueItems = [...new Set(items)];
  const duplicates = items.length - uniqueItems.length;
  
  let validCount = 0;
  
  if (currentState.mode === MODES.DIRECT) {
    validCount = uniqueItems.filter(item => isValidUrl(item)).length;
  } else if (currentState.mode === MODES.AMAZON) {
    validCount = uniqueItems.filter(item => AMAZON_ORDER_REGEX.test(item.trim())).length;
  } else if (currentState.mode === MODES.CUSTOM) {
    const template = currentState.customTemplate;
    if (template && hasPlaceholder(template)) {
      validCount = uniqueItems.filter(item => item.trim().length > 0).length;
    }
  } else if (currentState.mode === MODES.SMART) {
    // Auto-detect and validate based on detected mode
    const detected = detectMode(items);
    currentState.detectedMode = detected;
    
    if (detected === MODES.DIRECT) {
      validCount = uniqueItems.filter(item => isValidUrl(item)).length;
    } else if (detected === MODES.AMAZON) {
      validCount = uniqueItems.filter(item => AMAZON_ORDER_REGEX.test(item.trim())).length;
    } else if (detected === MODES.CUSTOM && currentState.customTemplate) {
      validCount = uniqueItems.filter(item => item.trim().length > 0).length;
    }
  }
  
  elements.countDetected.textContent = items.length;
  elements.countValid.textContent = validCount;
  elements.countDuplicates.textContent = Math.max(0, duplicates);
}

function updateDetectionStatus() {
  if (currentState.mode !== MODES.SMART) {
    return;
  }
  
  const items = parseInput();
  
  if (items.length === 0) {
    setDetectionStatus('🔍', 'Waiting for input...');
    return;
  }
  
  const detected = detectMode(items);
  currentState.detectedMode = detected;
  
  if (detected === MODES.DIRECT) {
    setDetectionStatus('🔗', 'Detected Mode: Direct Links');
  } else if (detected === MODES.AMAZON) {
    setDetectionStatus('📦', 'Detected Mode: Amazon Order IDs');
  } else if (detected === MODES.CUSTOM) {
    setDetectionStatus('⚙️', currentState.customTemplate ? 'Detected Mode: Custom Template' : 'Custom template required');
  } else {
    setDetectionStatus('❓', 'Unable to detect mode');
  }
}

function setDetectionStatus(icon, text) {
  const statusIcon = elements.detectionStatus.querySelector('.status-icon');
  const statusText = elements.detectionStatus.querySelector('.status-text');
  statusIcon.textContent = icon;
  statusText.textContent = text;
}

// ============================================
// Mode Detection
// ============================================

function detectMode(items) {
  if (items.length === 0) {
    return MODES.DIRECT;
  }
  
  // Check if custom template is configured
  if (currentState.customTemplate && hasPlaceholder(currentState.customTemplate)) {
    return MODES.CUSTOM;
  }
  
  // Count URLs vs Order IDs
  let urlCount = 0;
  let orderCount = 0;
  
  items.forEach(item => {
    const trimmed = item.trim();
    if (FULL_URL_REGEX.test(trimmed) || isValidUrl(trimmed)) {
      urlCount++;
    } else if (AMAZON_ORDER_REGEX.test(trimmed)) {
      orderCount++;
    }
  });
  
  // Determine mode based on majority
  if (orderCount > urlCount) {
    return MODES.AMAZON;
  } else if (urlCount > 0) {
    return MODES.DIRECT;
  }
  
  // Default to direct links
  return MODES.DIRECT;
}

// ============================================
// Input Parsing
// ============================================

function parseInput() {
  const text = currentState.mode === MODES.CUSTOM 
    ? elements.textarea.value 
    : currentState.inputText;
  
  if (!text) {
    return [];
  }
  
  // Split by newlines, commas, tabs, or multiple spaces
  const items = text.split(/[\n,\t]+| {2,}/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  return items;
}

// ============================================
// Validation
// ============================================

function isValidUrl(url) {
  // Add https:// if missing
  const normalized = normalizeUrl(url);
  
  try {
    new URL(normalized);
    return true;
  } catch (e) {
    return false;
  }
}

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Add https:// if no protocol
  if (!FULL_URL_REGEX.test(trimmed)) {
    return 'https://' + trimmed;
  }
  
  return trimmed;
}

function hasPlaceholder(template) {
  return PLACEHOLDERS.some(ph => template.includes(ph));
}

function getFirstPlaceholder(template) {
  for (const ph of PLACEHOLDERS) {
    if (template.includes(ph)) {
      return ph;
    }
  }
  return null;
}

// ============================================
// URL Generation
// ============================================

function generateUrls(items) {
  const urls = [];
  const mode = currentState.mode === MODES.SMART ? currentState.detectedMode : currentState.mode;
  
  items.forEach(item => {
    const trimmed = item.trim();
    let url = null;
    
    if (mode === MODES.DIRECT) {
      url = normalizeUrl(trimmed);
    } else if (mode === MODES.AMAZON) {
      if (AMAZON_ORDER_REGEX.test(trimmed)) {
        url = `https://sellercentral.amazon.com/orders-v3/order/${trimmed}`;
      }
    } else if (mode === MODES.CUSTOM) {
      const template = currentState.customTemplate;
      if (template && hasPlaceholder(template)) {
        const placeholder = getFirstPlaceholder(template);
        url = template.replace(placeholder, trimmed);
      }
    }
    
    if (url) {
      urls.push({
        original: trimmed,
        url: url,
        valid: isValidUrl(url)
      });
    }
  });
  
  return urls;
}

// ============================================
// Tab Management
// ============================================

async function getExistingTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs.map(tab => tab.url);
  } catch (e) {
    console.error('Error getting tabs:', e);
    return [];
  }
}

async function checkExistingUrls(urls) {
  const existingTabs = await getExistingTabs();
  
  return urls.map(item => ({
    ...item,
    exists: existingTabs.includes(item.url),
    selected: true
  }));
}

async function openTabs(items, activateExisting = true) {
  const options = currentState.options;
  let newTabsOpened = 0;
  let existingActivated = 0;
  
  for (const item of items) {
    if (!item.selected || !item.valid) {
      continue;
    }
    
    if (item.exists && options.skip && !activateExisting) {
      // Skip already open tabs
      continue;
    }
    
    if (item.exists && activateExisting) {
      // Activate existing tab
      try {
        const tabs = await chrome.tabs.query({ url: item.url });
        if (tabs.length > 0) {
          await chrome.tabs.update(tabs[0].id, { active: true });
          existingActivated++;
        }
      } catch (e) {
        console.error('Error activating tab:', e);
      }
    } else {
      // Open new tab
      try {
        await chrome.tabs.create({
          url: item.url,
          active: !options.background
        });
        newTabsOpened++;
        
        // Small delay to prevent browser overload
        await sleep(50);
      } catch (e) {
        console.error('Error opening tab:', e);
      }
    }
  }
  
  return { newTabsOpened, existingActivated };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Button Handlers
// ============================================

async function handleOpenTabs() {
  const items = parseInput();
  
  if (items.length === 0) {
    showToast('⚠️', 'No items to process');
    return;
  }
  
  const generatedUrls = generateUrls(items);
  const validUrls = generatedUrls.filter(item => item.valid);
  
  if (validUrls.length === 0) {
    showToast('⚠️', 'No valid items found');
    return;
  }
  
  // Remove duplicates while preserving order
  const seen = new Set();
  const uniqueUrls = validUrls.filter(item => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
  
  // Check tab limit
  const newUrlCount = uniqueUrls.length;
  if (newUrlCount > currentState.settings.tabLimit) {
    const confirmed = confirm(
      `You are about to open ${newUrlCount} tabs.\n\n` +
      `This exceeds your limit of ${currentState.settings.tabLimit} tabs.\n\n` +
      `Are you sure you want to continue?`
    );
    
    if (!confirmed) {
      return;
    }
  }
  
  // Show loading
  showLoading(true);
  
  // Check existing tabs
  const itemsWithExistence = await checkExistingUrls(uniqueUrls);
  
  // Open tabs
  const result = await openTabs(itemsWithExistence, currentState.options.activate);
  
  // Hide loading
  showLoading(false);
  
  // Calculate stats
  const invalidCount = generatedUrls.length - validUrls.length;
  const duplicateCount = validUrls.length - uniqueUrls.length;
  
  // Update results summary
  showResults({
    valid: uniqueUrls.length,
    duplicates: duplicateCount,
    invalid: invalidCount,
    newTabs: result.newTabsOpened,
    existing: result.existingActivated
  });
  
  // Save to history
  await saveToHistory('open', uniqueUrls);
  
  // Show success message
  showToast('✅', `Opened ${result.newTabsOpened} new tabs, activated ${result.existingActivated} existing tabs`);
}

async function handlePreview() {
  const items = parseInput();
  
  if (items.length === 0) {
    showToast('⚠️', 'No items to preview');
    return;
  }
  
  const generatedUrls = generateUrls(items);
  
  // Remove duplicates
  const seen = new Set();
  const uniqueUrls = generatedUrls.filter(item => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
  
  // Store for later use
  currentState.previewItems = await checkExistingUrls(uniqueUrls);
  
  // Render preview
  renderPreview(currentState.previewItems);
  
  // Show modal
  elements.previewModal.classList.remove('hidden');
}

function renderPreview(items) {
  elements.previewList.innerHTML = '';
  
  if (items.length === 0) {
    elements.previewList.innerHTML = '<p class="empty-message">No items to preview</p>';
    return;
  }
  
  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    
    if (item.valid && item.exists) {
      div.classList.add('existing');
    } else if (item.valid) {
      div.classList.add('valid');
    } else {
      div.classList.add('invalid');
    }
    
    div.innerHTML = `
      <input type="checkbox" class="preview-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
      <div class="preview-url">${escapeHtml(item.url)}</div>
      <div class="preview-status">
        ${item.valid ? (item.exists ? 'Already Open' : '✓ Valid') : '✗ Invalid'}
      </div>
    `;
    
    elements.previewList.appendChild(div);
  });
  
  // Add checkbox listeners
  elements.previewList.querySelectorAll('.preview-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      currentState.previewItems[index].selected = e.target.checked;
    });
  });
}

function closeModal() {
  elements.previewModal.classList.add('hidden');
  currentState.previewItems = [];
}

async function confirmOpenFromPreview() {
  const selectedItems = currentState.previewItems.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    showToast('⚠️', 'No items selected');
    return;
  }
  
  // Check tab limit
  const newCount = selectedItems.filter(item => !item.exists).length;
  if (newCount > currentState.settings.tabLimit) {
    const confirmed = confirm(
      `You are about to open ${newCount} new tabs.\n\n` +
      `This exceeds your limit of ${currentState.settings.tabLimit} tabs.\n\n` +
      `Are you sure you want to continue?`
    );
    
    if (!confirmed) {
      return;
    }
  }
  
  closeModal();
  showLoading(true);
  
  const result = await openTabs(selectedItems, currentState.options.activate);
  
  showLoading(false);
  
  // Calculate stats
  const totalValid = currentState.previewItems.filter(item => item.valid).length;
  const invalidCount = currentState.previewItems.length - totalValid;
  const duplicateCount = 0; // Already filtered
  
  showResults({
    valid: selectedItems.length,
    duplicates: duplicateCount,
    invalid: invalidCount,
    newTabs: result.newTabsOpened,
    existing: result.existingActivated
  });
  
  // Save to history
  await saveToHistory('open', selectedItems);
  
  showToast('✅', `Opened ${result.newTabsOpened} new tabs, activated ${result.existingActivated} existing tabs`);
}

async function handleCopyLinks() {
  const items = parseInput();
  
  if (items.length === 0) {
    showToast('⚠️', 'No items to copy');
    return;
  }
  
  const generatedUrls = generateUrls(items);
  const validUrls = generatedUrls.filter(item => item.valid);
  
  // Remove duplicates
  const seen = new Set();
  const uniqueUrls = validUrls.filter(item => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
  
  if (uniqueUrls.length === 0) {
    showToast('⚠️', 'No valid URLs to copy');
    return;
  }
  
  const urlsText = uniqueUrls.map(item => item.url).join('\n');
  
  try {
    await navigator.clipboard.writeText(urlsText);
    showToast('✅', `Copied ${uniqueUrls.length} URLs to clipboard`);
    
    // Save to history
    await saveToHistory('copy', uniqueUrls);
  } catch (e) {
    showToast('❌', 'Failed to copy to clipboard');
    console.error('Copy error:', e);
  }
}

function handleClear() {
  elements.textarea.value = '';
  currentState.inputText = '';
  
  // Don't clear custom template
  // elements.customTemplate.value = '';
  // currentState.customTemplate = '';
  
  elements.resultsSummary.classList.add('hidden');
  
  updateCounters();
  updateDetectionStatus();
  
  saveToStorage();
  
  showToast('🗑️', 'Input cleared');
}

// ============================================
// Results Display
// ============================================

function showResults(stats) {
  elements.sumValid.textContent = stats.valid;
  elements.sumDuplicates.textContent = stats.duplicates;
  elements.sumInvalid.textContent = stats.invalid;
  elements.sumNewTabs.textContent = stats.newTabs;
  elements.sumExisting.textContent = stats.existing;
  
  elements.resultsSummary.classList.remove('hidden');
}

// ============================================
// Settings Management
// ============================================

function handleSaveSettings() {
  const tabLimit = parseInt(elements.settingTabLimit.value) || 50;
  const historyLimit = parseInt(elements.settingHistoryLimit.value) || 10;
  const autoSave = elements.settingAutoSave.checked;
  const restoreInput = elements.settingRestoreInput.checked;
  
  currentState.settings = {
    tabLimit: Math.max(1, Math.min(500, tabLimit)),
    historyLimit: Math.max(1, Math.min(100, historyLimit)),
    autoSave,
    restoreInput
  };
  
  saveToStorage();
  showToast('✅', 'Settings saved');
}

function handleResetSettings() {
  currentState.settings = { ...DEFAULT_SETTINGS };
  applySettings();
  saveToStorage();
  showToast('🔄', 'Settings reset to defaults');
}

function applySettings() {
  elements.settingTabLimit.value = currentState.settings.tabLimit;
  elements.settingHistoryLimit.value = currentState.settings.historyLimit;
  elements.settingAutoSave.checked = currentState.settings.autoSave;
  elements.settingRestoreInput.checked = currentState.settings.restoreInput;
}

// ============================================
// Options Management
// ============================================

function saveOptions() {
  currentState.options = {
    background: elements.optBackground.checked,
    activate: elements.optActivate.checked,
    skip: elements.optSkip.checked
  };
  
  saveToStorage();
}

function applyOptions() {
  elements.optBackground.checked = currentState.options.background;
  elements.optActivate.checked = currentState.options.active;
  elements.optSkip.checked = currentState.options.skip;
}

// ============================================
// History Management
// ============================================

async function saveToHistory(action, items) {
  const now = new Date();
  
  const historyEntry = {
    id: Date.now(),
    date: now.toISOString(),
    action,
    mode: currentState.mode === MODES.SMART ? currentState.detectedMode : currentState.mode,
    itemCount: items.length,
    urls: items.map(item => typeof item === 'string' ? item : item.url).slice(0, 10) // Store first 10 URLs
  };
  
  // Add to beginning of array
  currentState.history.unshift(historyEntry);
  
  // Limit history size
  currentState.history = currentState.history.slice(0, currentState.settings.historyLimit);
  
  await saveToStorage();
  renderHistory();
}

function renderHistory() {
  if (currentState.history.length === 0) {
    elements.historyList.innerHTML = '<p class="empty-message">No history yet. Start opening some tabs!</p>';
    return;
  }
  
  elements.historyList.innerHTML = '';
  
  currentState.history.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleString();
    
    div.innerHTML = `
      <div class="history-item-header">
        <span class="history-item-mode">${entry.mode}</span>
        <span class="history-item-date">${formattedDate}</span>
      </div>
      <div class="history-item-stats">
        <span>${entry.itemCount} items</span>
        <span>Action: ${entry.action}</span>
      </div>
      <div class="history-item-actions">
        <button class="btn btn-secondary btn-sm" onclick="reopenHistory(${entry.id})">Reopen</button>
        <button class="btn btn-secondary btn-sm" onclick="copyHistory(${entry.id})">Copy</button>
      </div>
    `;
    
    elements.historyList.appendChild(div);
  });
}

// Exposed functions for history item actions
window.reopenHistory = async function(id) {
  const entry = currentState.history.find(h => h.id === id);
  if (!entry) return;
  
  // Restore input based on mode
  if (entry.mode === MODES.CUSTOM) {
    // For custom mode, we'd need to store the template too
    showToast('ℹ️', 'Custom template mode - please restore manually');
    return;
  }
  
  elements.textarea.value = entry.urls.join('\n');
  handleInput();
  switchMode(entry.mode);
  
  showToast('📋', 'History restored to input');
};

window.copyHistory = async function(id) {
  const entry = currentState.history.find(h => h.id === id);
  if (!entry) return;
  
  const urlsText = entry.urls.join('\n');
  
  try {
    await navigator.clipboard.writeText(urlsText);
    showToast('✅', `Copied ${entry.urls.length} URLs`);
  } catch (e) {
    showToast('❌', 'Failed to copy');
  }
};

async function handleClearHistory() {
  const confirmed = confirm('Are you sure you want to clear all history?');
  if (!confirmed) return;
  
  currentState.history = [];
  await saveToStorage();
  renderHistory();
  
  showToast('🗑️', 'History cleared');
}

// ============================================
// Storage Management
// ============================================

async function saveToStorage() {
  try {
    const data = {
      mode: currentState.mode,
      inputText: currentState.inputText,
      customTemplate: currentState.customTemplate,
      settings: currentState.settings,
      options: currentState.options,
      history: currentState.history
    };
    
    await chrome.storage.local.set(data);
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
}

async function loadFromStorage() {
  try {
    const data = await chrome.storage.local.get([
      'mode',
      'inputText',
      'customTemplate',
      'settings',
      'options',
      'history'
    ]);
    
    if (data.mode) {
      currentState.mode = data.mode;
    }
    
    if (data.inputText && currentState.settings.restoreInput) {
      currentState.inputText = data.inputText;
      elements.textarea.value = data.inputText;
    }
    
    if (data.customTemplate) {
      currentState.customTemplate = data.customTemplate;
      elements.customTemplate.value = data.customTemplate;
    }
    
    if (data.settings) {
      currentState.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    }
    
    if (data.options) {
      currentState.options = { ...DEFAULT_OPTIONS, ...data.options };
    }
    
    if (data.history) {
      currentState.history = data.history;
    }
  } catch (e) {
    console.error('Error loading from storage:', e);
  }
}

// ============================================
// UI Helpers
// ============================================

function showLoading(show) {
  elements.loadingOverlay.classList.toggle('hidden', !show);
}

function showToast(icon, message, type = '') {
  const toastIcon = elements.toast.querySelector('.toast-icon');
  const toastMessage = elements.toast.querySelector('.toast-message');
  
  toastIcon.textContent = icon;
  toastMessage.textContent = message;
  
  elements.toast.className = 'toast';
  if (type) {
    elements.toast.classList.add(type);
  }
  
  elements.toast.classList.remove('hidden');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Initialize on DOM Ready
// ============================================

document.addEventListener('DOMContentLoaded', init);
