/**
 * Universal Multi Tab Opener - Background Service Worker
 * 
 * This service worker handles background tasks for the extension.
 * Currently minimal as most functionality is in the popup,
 * but can be extended for future features.
 */

// ============================================
// Extension Installation Handler
// ============================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Universal Multi Tab Opener installed');
    
    // Initialize default settings
    chrome.storage.local.set({
      settings: {
        tabLimit: 50,
        historyLimit: 10,
        autoSave: true,
        restoreInput: true
      },
      options: {
        background: true,
        activate: true,
        skip: true
      },
      history: []
    });
  } else if (details.reason === 'update') {
    console.log('Universal Multi Tab Opener updated from version', details.previousVersion);
  }
});

// ============================================
// Message Handler
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from popup or content scripts
  switch (message.action) {
    case 'getSettings':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse(result.settings);
      });
      return true; // Keep channel open for async response
    
    case 'saveSettings':
      chrome.storage.local.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;
    
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// ============================================
// Optional: Periodic Cleanup (if needed)
// ============================================

// Clean up old history entries periodically (every 24 hours)
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupHistory') {
    cleanupOldHistory();
  }
});

// Set up daily cleanup alarm
chrome.alarms?.create('cleanupHistory', {
  periodInMinutes: 24 * 60 // 24 hours
});

async function cleanupOldHistory() {
  try {
    const data = await chrome.storage.local.get(['history', 'settings']);
    const history = data.history || [];
    const historyLimit = data.settings?.historyLimit || 10;
    
    if (history.length > historyLimit) {
      const trimmedHistory = history.slice(0, historyLimit);
      await chrome.storage.local.set({ history: trimmedHistory });
      console.log('Cleaned up old history entries');
    }
  } catch (e) {
    console.error('Error cleaning up history:', e);
  }
}

console.log('Universal Multi Tab Opener background service worker loaded');
