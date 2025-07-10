'use strict';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const graphContainer = document.getElementById('graphContainer');
const graphWrapper = document.getElementById('graphWrapper');
const totalCountEl = document.getElementById('totalCount');
const footerLink = document.querySelector('.footer a');

// State
let currentUsername = null;
let tooltipEl = null;

/**
 * Show a specific state (loading, error, or graph)
 */
function showState(state) {
  loadingEl.classList.toggle('hidden', state !== 'loading');
  errorEl.classList.toggle('hidden', state !== 'error');
  graphContainer.classList.toggle('hidden', state !== 'graph');
}

/**
 * Show error with message
 */
function showError(message) {
  errorMessageEl.textContent = message;
  showState('error');
}

/**
 * Parse contribution data from HTML response
 */
function parseContributions(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract total contribution count from the heading
  let totalCount = '';
  const headings = doc.querySelectorAll('h2');
  for (const h2 of headings) {
    if (h2.textContent.includes('contributions')) {
      totalCount = h2.textContent.trim();
      break;
    }
  }

  // Extract contribution cells - GitHub uses td elements with ContributionCalendar-day class
  const cells = doc.querySelectorAll('td.ContributionCalendar-day[data-date]');
  const contributions = [];

  cells.forEach(cell => {
    const date = cell.getAttribute('data-date');
    const level = parseInt(cell.getAttribute('data-level') || '0', 10);

    // Get tooltip text from the span inside the cell or construct from data
    const tooltipSpan = cell.querySelector('span.sr-only');
    let tooltipText = tooltipSpan ? tooltipSpan.textContent.trim() : '';

    // Fallback: check for tool-tip element
    if (!tooltipText) {
      const cellId = cell.getAttribute('id');
      if (cellId) {
        const tooltip = doc.querySelector(`tool-tip[for="${cellId}"]`);
        tooltipText = tooltip ? tooltip.textContent.trim() : '';
      }
    }

    // Final fallback: construct tooltip from date
    if (!tooltipText) {
      const dateObj = new Date(date + 'T00:00:00');
      tooltipText = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    contributions.push({
      date,
      level,
      tooltipText
    });
  });

  return { totalCount, contributions };
}

/**
 * Organize contributions into weeks for display
 */
function organizeIntoWeeks(contributions) {
  // Sort by date first
  contributions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const weeks = [];
  let currentWeek = [];
  let lastSunday = null;

  contributions.forEach(contribution => {
    const date = new Date(contribution.date + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // Calculate the Sunday of this week
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);
    const sundayStr = sunday.toISOString().split('T')[0];

    // Start a new week if this is a different week
    if (lastSunday !== sundayStr) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [];
      lastSunday = sundayStr;
    }

    currentWeek.push(contribution);
  });

  // Push the last week if it has any days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Create and show tooltip
 */
function showTooltip(event, text) {
  hideTooltip();

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'tooltip';
  tooltipEl.textContent = text;
  document.body.appendChild(tooltipEl);

  const rect = event.target.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();

  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top - tooltipRect.height - 8;

  // Keep tooltip in viewport
  if (left < 4) left = 4;
  if (left + tooltipRect.width > window.innerWidth - 4) {
    left = window.innerWidth - tooltipRect.width - 4;
  }
  if (top < 4) {
    top = rect.bottom + 8;
  }

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}

/**
 * Render the contribution graph
 */
function renderGraph(data) {
  const { totalCount, contributions } = data;

  // Update total count
  totalCountEl.textContent = totalCount;

  // Clear existing graph
  graphWrapper.innerHTML = '';

  // Create graph container
  const graphEl = document.createElement('div');
  graphEl.className = 'contribution-graph';

  // Organize into weeks
  const weeks = organizeIntoWeeks(contributions);

  // Render each week as a column
  weeks.forEach((week, weekIndex) => {
    const weekCol = document.createElement('div');
    weekCol.className = 'week-column';

    // For the first week, pad with empty cells if it doesn't start on Sunday
    if (weekIndex === 0 && week.length > 0) {
      const firstDate = new Date(week[0].date + 'T00:00:00');
      const startDay = firstDate.getDay();
      for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell level-0';
        emptyCell.style.visibility = 'hidden';
        weekCol.appendChild(emptyCell);
      }
    }

    week.forEach(day => {
      const cell = document.createElement('div');
      cell.className = `day-cell level-${day.level}`;
      cell.setAttribute('data-date', day.date);

      cell.addEventListener('mouseenter', (e) => {
        showTooltip(e, day.tooltipText);
      });

      cell.addEventListener('mouseleave', hideTooltip);

      weekCol.appendChild(cell);
    });

    graphEl.appendChild(weekCol);
  });

  graphWrapper.appendChild(graphEl);
  showState('graph');
}

/**
 * Get the configured username from storage
 */
async function getUsername() {
  const { githubUsername } = await browser.storage.sync.get('githubUsername');
  return githubUsername || null;
}

/**
 * Show configuration prompt when no username is set
 */
function showConfigPrompt() {
  // Clear existing content and build DOM safely
  errorMessageEl.textContent = '';
  errorMessageEl.appendChild(document.createTextNode('Please configure your GitHub username in the '));

  const link = document.createElement('a');
  link.href = '#';
  link.id = 'openOptions';
  link.textContent = 'extension settings';
  link.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });
  errorMessageEl.appendChild(link);
  errorMessageEl.appendChild(document.createTextNode('.'));

  showState('error');
  retryBtn.style.display = 'none';
}

/**
 * Fetch contributions from GitHub via background script
 */
async function fetchContributions() {
  showState('loading');
  retryBtn.style.display = '';

  try {
    // Get username from storage
    currentUsername = await getUsername();

    if (!currentUsername) {
      showConfigPrompt();
      return;
    }

    // Update footer link with current username
    footerLink.href = `https://github.com/${currentUsername}`;
    footerLink.textContent = `@${currentUsername} on GitHub`;

    const contributionsUrl = `https://github.com/users/${currentUsername}/contributions`;

    // Send message to background script to fetch (avoids CORS issues)
    const response = await browser.runtime.sendMessage({
      type: 'FETCH_CONTRIBUTIONS',
      url: contributionsUrl
    });

    if (response.error) {
      throw new Error(response.error);
    }

    const data = parseContributions(response.html);

    if (data.contributions.length === 0) {
      throw new Error('No contribution data found');
    }

    renderGraph(data);

  } catch (error) {
    console.error('Failed to fetch contributions:', error);
    showError(error.message || 'Failed to load contributions');
  }
}

// Event Listeners
retryBtn.addEventListener('click', fetchContributions);

// Initialize on popup open
document.addEventListener('DOMContentLoaded', fetchContributions);
