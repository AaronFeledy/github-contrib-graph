# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Firefox browser extension (Manifest V3) that displays a GitHub contribution graph in the browser toolbar popup. Fetches contribution data from GitHub and renders an interactive graph with tooltips.

## Development

**Load extension in Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from this directory

**Reload after changes:**
- Click "Reload" in the debugging page, or close and reopen the popup

## Architecture

```
popup/          # UI layer - runs when user clicks toolbar icon
  popup.html    # Popup structure with loading/error/graph states
  popup.css     # GitHub dark theme styling with contribution level colors
  popup.js      # Main logic: fetches data, parses HTML, renders graph

background/     # Service worker - handles cross-origin requests
  background.js # Message listener that fetches GitHub HTML (avoids CORS)

options/        # Settings page - accessible from extension preferences
  options.html  # Form for configuring GitHub username
  options.css   # Dark theme styling matching popup
  options.js    # Loads/saves username to browser.storage.sync
```

**Data Flow:**
1. Popup sends `FETCH_CONTRIBUTIONS` message to background script
2. Background fetches `https://github.com/users/{username}/contributions`
3. Popup parses HTML response for `td.ContributionCalendar-day[data-date]` elements
4. Contributions organized into weekly columns and rendered as colored cells

**Configuration:**
- Username stored in `browser.storage.sync` under key `githubUsername`
- User configures via extension options page (right-click extension → Preferences)
- Popup prompts user to configure if no username is set

**Key Constants:**
- Contribution levels 0-4 map to CSS classes `level-0` through `level-4`

## Firefox Extension Notes

- Uses `browser.*` APIs (not Chrome's `chrome.*`)
- Gecko-specific settings in manifest require Firefox 109+
- Host permission for `https://github.com/*` enables cross-origin fetch from background script
