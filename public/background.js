// public/background.js

let activeTabId = null;
let activeTabUrl = null;
let startTime = null;
let history = {};

// Tab activation listener (when user switches to a new tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeTabId !== null && startTime !== null) {
    // Calculate the time spent on the previous tab
    const timeSpent = Date.now() - startTime;
    updateHistory(activeTabUrl, timeSpent);
  }

  // Update active tab info
  activeTabId = activeInfo.tabId;
  activeTabUrl = await getTabUrl(activeTabId);
  startTime = Date.now(); // Reset the start time for the new active tab
});

// Tab update listener (when a tab's URL changes, for example, navigation)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    // Calculate the time spent on the previous URL
    const timeSpent = Date.now() - startTime;
    updateHistory(activeTabUrl, timeSpent);

    // Reset the tracking for the new URL
    startTime = Date.now();
    activeTabUrl = await getTabUrl(activeTabId);
  }
});

// Window focus listener (when the user switches windows or minimizes Chrome)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User is leaving Chrome (e.g., minimizes or switches to another application)
    if (activeTabId !== null && startTime !== null) {
      const timeSpent = Date.now() - startTime;
      updateHistory(activeTabUrl, timeSpent);
      resetActiveTab();
    }
  } else {
    // User comes back to Chrome or switches to a new window
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      activeTabId = tab.id;
      activeTabUrl = await getTabUrl(activeTabId);
      startTime = Date.now();
    }
  }
});

// Helper function to update the history for a given URL
function updateHistory(url, timeSpent) {
  if (!url) return; // Skip if the URL is invalid

  // Ensure the URL is tracked in the history object
  if (!history[url]) {
    history[url] = 0;
  }

  // Increment time spent on this URL
  history[url] += timeSpent / 1000; // Convert milliseconds to seconds

  // Store the updated history in chrome.storage.local
  chrome.storage.local.set({ history });
}

// Helper function to get the URL of a tab
async function getTabUrl(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

    // Check for special URLs or invalid URLs
    if (
      !tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url === "about:blank"
    ) {
      return "newtab"; // Return 'newtab' for new tab pages or Chrome internal pages
    }

    return new URL(tab.url).hostname;
  } catch (error) {
    console.error("Error getting tab URL:", error);
    return null;
  }
}

// Reset active tab info
function resetActiveTab() {
  activeTabId = null;
  activeTabUrl = null;
  startTime = null;
}
