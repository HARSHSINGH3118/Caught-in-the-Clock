document.addEventListener("DOMContentLoaded", function () {
  // Retrieve the history data from chrome storage
  chrome.storage.local.get(["history"], (result) => {
    const history = result.history || {};
    const root = document.getElementById("root");

    // Clear any existing content in root
    root.innerHTML = `
      <h1 class="history-title">Your Time Tracker History</h1>
      <p class="description">
        Here's a breakdown of the websites you've visited today and the time you've spent on each.
      </p>
    `;

    // Iterate over each site in the history and display it
    Object.keys(history).forEach((site) => {
      const timeSpent = formatTime(history[site]); // Format time in human-readable form

      // Google Favicon API to get the site icon
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${site}`;

      // Create the history item with the favicon, site name, and time spent
      const historyItem = `
        <div class="history-item">
          <img src="${faviconUrl}" alt="Site Icon" class="favicon">
          <div class="history-text">
            <h2>${site}</h2>
            <p>Time Spent: ${timeSpent}</p>
          </div>
        </div>
      `;

      // Append the history item to the root container
      root.innerHTML += historyItem;
    });
  });
});

// Function to format time from seconds to hours, minutes, and seconds
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${secs}s`;
}
