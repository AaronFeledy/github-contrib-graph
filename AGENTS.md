# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Firefox browser extension (Manifest V3) that displays a GitHub contribution graph in the browser toolbar popup. Fetches contribution data from GitHub and renders an interactive graph with tooltips.

## Development

**Setup:**

```bash
npm install
```

**Commands:**

| Command            | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `npm run start`    | Launch Firefox with extension for live development |
| `npm run build`    | Create .xpi in `web-ext-artifacts/`                |
| `npm run lint`     | Check code for issues                              |
| `npm run lint:fix` | Auto-fix linting issues                            |
| `npm run format`   | Format all files with Prettier                     |

**Manual loading:**

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from this directory

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

## Build Tooling

- **ESLint**: Flat config in `eslint.config.js` with browser/webextension globals
- **Prettier**: Config in `.prettierrc` (single quotes, semicolons, 2-space indent)
- **web-ext**: Mozilla's official tool for building and testing; config in `web-ext-config.mjs`

Dev files are excluded from the built .xpi via `ignoreFiles` in web-ext config.

## CI/CD

**GitHub Actions Workflows:**

| Workflow           | Trigger                      | Purpose                                    |
| ------------------ | ---------------------------- | ------------------------------------------ |
| `ci.yml`           | Push/PR to main              | Run ESLint, Prettier check, build          |
| `version-bump.yml` | Push to main / manual        | Bump version based on conventional commits |
| `release.yml`      | Tag push / release published | Build .xpi and attach to GitHub release    |

**Conventional Commits:**

Use conventional commit prefixes for automatic versioning:

- `fix:` → patch bump (0.1.0 → 0.1.1)
- `feat:` → minor bump (0.1.0 → 0.2.0)
- `feat!:` or `BREAKING CHANGE:` → major bump (0.1.0 → 1.0.0)
- `chore:`, `docs:`, `refactor:` → no version bump

**Version Sync:**

Version is stored in both `package.json` and `manifest.json`. The `scripts/sync-version.mjs` script copies the version from package.json to manifest.json. This runs automatically during version bumps via the `npm version` lifecycle hook.

**Manual Version Bump:**

```bash
# Via GitHub Actions UI: Actions → Version Bump → Run workflow
# Or locally:
npm version patch  # or minor, major
git push origin main --tags
```

**Creating Releases:**

Releases with `.xpi` artifacts are created automatically when:

1. A tag starting with `v` is pushed
2. A GitHub release is published

To create a release manually:

```bash
gh release create v0.x.x --generate-notes --prerelease
```
