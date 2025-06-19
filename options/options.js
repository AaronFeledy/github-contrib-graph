'use strict';

const form = document.getElementById('settingsForm');
const usernameInput = document.getElementById('username');
const statusEl = document.getElementById('status');

// Load saved settings
async function loadSettings() {
  const { githubUsername } = await browser.storage.sync.get('githubUsername');
  if (githubUsername) {
    usernameInput.value = githubUsername;
  }
}

// Save settings
async function saveSettings(e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  if (!username) return;

  await browser.storage.sync.set({ githubUsername: username });

  // Show saved status
  statusEl.textContent = 'Saved!';
  statusEl.classList.add('visible');

  setTimeout(() => {
    statusEl.classList.remove('visible');
  }, 2000);
}

form.addEventListener('submit', saveSettings);
document.addEventListener('DOMContentLoaded', loadSettings);
