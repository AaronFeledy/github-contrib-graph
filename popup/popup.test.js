/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resetBrowserMocks,
  setCachedData,
  setUsername,
  mockContributionResponse
} from '../test/setup.js';

// Sample HTML response from GitHub (must be valid table structure for parsing)
const sampleGitHubHTML = `
  <html><body>
  <h2 class="f4 text-normal mb-2">42 contributions in the last year</h2>
  <table>
    <tbody>
      <tr>
        <td class="ContributionCalendar-day" data-date="2024-01-01" data-level="1">
          <span class="sr-only">1 contribution on January 1, 2024</span>
        </td>
        <td class="ContributionCalendar-day" data-date="2024-01-02" data-level="2">
          <span class="sr-only">3 contributions on January 2, 2024</span>
        </td>
      </tr>
    </tbody>
  </table>
  </body></html>
`;

// Set up DOM before importing popup module
function setupDOM() {
  document.body.innerHTML = `
    <div class="container">
<header class="header">
            <h1 class="title">Contributions</h1>
            <span class="total-count" id="totalCount"></span>
            <button id="refreshBtn" class="refresh-btn hidden" title="Refresh">↻</button>
          </header>
      <div id="loading" class="loading"></div>
      <div id="error" class="error hidden">
        <span class="error-message" id="errorMessage"></span>
        <button id="retryBtn" class="retry-btn">Retry</button>
      </div>
      <div id="graphContainer" class="graph-container hidden">
        <div class="graph-wrapper" id="graphWrapper"></div>
      </div>
      <footer class="footer">
        <a href="#" target="_blank">View on GitHub</a>
      </footer>
    </div>
  `;
}

describe('Contribution Graph Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setupDOM();
    resetBrowserMocks();
    setUsername('testuser');
    mockContributionResponse(sampleGitHubHTML);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  describe('Cache behavior', () => {
    it('should use cached data when less than 60 seconds old', async () => {
      const cachedData = {
        contributionsCache: {
          username: 'testuser',
          timestamp: Date.now(),
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      // Import and run popup
      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      // Should NOT have called the background script since cache is valid
      expect(browser.runtime.sendMessage).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when cache is older than 60 seconds', async () => {
      const cachedData = {
        contributionsCache: {
          username: 'testuser',
          timestamp: Date.now() - 61000, // 61 seconds ago
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      // Should have fetched fresh data since cache is expired
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'FETCH_CONTRIBUTIONS',
        url: 'https://github.com/users/testuser/contributions'
      });
    });

    it('should fetch fresh data when username differs from cached username', async () => {
      const cachedData = {
        contributionsCache: {
          username: 'differentuser',
          timestamp: Date.now(),
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      // Should have fetched fresh data since username changed
      expect(browser.runtime.sendMessage).toHaveBeenCalled();
    });

    it('should store data in cache after fresh fetch', async () => {
      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      // Should have stored the data in cache
      expect(browser.storage.local.set).toHaveBeenCalled();
      const setCall = browser.storage.local.set.mock.calls[0][0];
      expect(setCall.contributionsCache).toBeDefined();
      expect(setCall.contributionsCache.username).toBe('testuser');
      expect(setCall.contributionsCache.data).toBeDefined();
    });
  });

  describe('Refresh button visibility', () => {
    it('should show refresh button when loaded from cache', async () => {
      const cachedData = {
        contributionsCache: {
          username: 'testuser',
          timestamp: Date.now(),
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      const refreshBtn = document.getElementById('refreshBtn');
      expect(refreshBtn.classList.contains('hidden')).toBe(false);
    });

    it('should hide refresh button when fetching fresh data', async () => {
      // No cache, so it will fetch fresh
      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      const refreshBtn = document.getElementById('refreshBtn');
      expect(refreshBtn.classList.contains('hidden')).toBe(true);
    });

    it('should hide refresh button after clicking it and fetching completes', async () => {
      const cachedData = {
        contributionsCache: {
          username: 'testuser',
          timestamp: Date.now(),
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      const { fetchContributions } = await import('./popup.js');
      await fetchContributions();

      const refreshBtn = document.getElementById('refreshBtn');
      expect(refreshBtn.classList.contains('hidden')).toBe(false);

      // Click refresh
      refreshBtn.click();
      await vi.runAllTimersAsync();

      // Should be hidden after refresh completes
      expect(refreshBtn.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Refresh button loading state', () => {
    it('should show loading state on refresh button while fetching', async () => {
      // Use real timers for this test
      vi.useRealTimers();

      const now = Date.now();
      const cachedData = {
        contributionsCache: {
          username: 'testuser',
          timestamp: now,
          data: {
            totalCount: '42 contributions in the last year',
            contributions: [{ date: '2024-01-01', level: 1, tooltipText: '1 contribution' }]
          }
        }
      };
      setCachedData(cachedData);

      // Track loading state changes
      let wasLoadingDuringFetch = false;

      // Make sendMessage capture loading state during fetch
      browser.runtime.sendMessage.mockImplementation(() => {
        const refreshBtn = document.getElementById('refreshBtn');
        wasLoadingDuringFetch = refreshBtn.classList.contains('loading');
        return Promise.resolve({ html: sampleGitHubHTML });
      });

      const { fetchContributions } = await import('./popup.js');
      await fetchContributions(); // Load from cache first

      const refreshBtn = document.getElementById('refreshBtn');
      expect(refreshBtn.classList.contains('hidden')).toBe(false);

      // Click refresh and wait for it to complete
      refreshBtn.click();
      // Allow async handler to run
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify loading state was active during fetch
      expect(wasLoadingDuringFetch).toBe(true);

      // Loading state should be removed after completion
      expect(refreshBtn.classList.contains('loading')).toBe(false);
    });
  });
});
