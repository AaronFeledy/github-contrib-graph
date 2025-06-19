'use strict';

/**
 * Handle messages from popup
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_CONTRIBUTIONS') {
    fetchContributions(message.url)
      .then(html => sendResponse({ html }))
      .catch(error => sendResponse({ error: error.message }));

    // Return true to indicate async response
    return true;
  }
});

/**
 * Fetch contributions HTML from GitHub
 * Background scripts can make cross-origin requests without CORS issues
 */
async function fetchContributions(url) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}
