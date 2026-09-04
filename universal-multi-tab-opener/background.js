/**
 * Universal Multi Tab Opener - Background Service Worker
 * 
 * Handles background tasks and maintains session state.
 */

// Listen for extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Universal Multi Tab Opener installed:', details.reason);
  
  // Initialize default storage
  chrome.storage.local.set({
    settings: {
      tabLimit: 50,
      historyLimit: 10,
      autoSave: true,
      restoreInput: true,
      defaultMode: 'smart',
      existingBehavior: 'activate'
    },
    options: {
      background: true,
      activate: true,
      skip: true,
      groupTabs: false,
      groupName: 'Multi Tab Opener',
      groupMethod: 'single'
    },
    history: [],
    currentSessionTabs: [],
    lastSessionTabs: []
  });
});

// Keep service worker alive during long operations
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Clean up old history periodically (once per day)
let lastCleanup = Date.now();

chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupHistory') {
    cleanupOldHistory();
  }
});

// Set up daily cleanup alarm
chrome.alarms?.create('cleanupHistory', {
  periodInMinutes: 24 * 60
});

async function cleanupOldHistory() {
  try {
    const data = await chrome.storage.local.get(['history', 'settings']);
    const history = data.history || [];
    const historyLimit = data.settings?.historyLimit || 10;
    
    if (history.length > historyLimit) {
      const trimmed = history.slice(0, historyLimit);
      await chrome.storage.local.set({ history: trimmed });
      console.log(`Cleaned up ${history.length - historyLimit} old history entries`);
    }
  } catch (e) {
    console.error('Error cleaning up history:', e);
  }
}

// Handle messages from popup if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'keepAlive') {
    sendResponse({ status: 'alive' });
  }
  return true;
});
