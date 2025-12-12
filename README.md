# GitHub Contribution Graph

A Firefox browser extension that displays your GitHub contribution graph directly in the browser toolbar. Quickly check your daily contributions and yearly activity without leaving your current tab.

## Features

- View your full year contribution graph from the toolbar popup
- Interactive tooltips showing contribution counts per day
- GitHub-style dark theme
- Direct link to your GitHub profile

## Installation

### From Firefox Add-ons (Recommended)

Install from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/github-contribution-graph/) (link available after publication).

### Manual Installation (Development)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from this directory

## Configuration

1. Right-click the extension icon and select "Manage Extension"
2. Click "Preferences" or "Options"
3. Enter your GitHub username and save

## Privacy Policy

This extension respects your privacy:

- **Data Stored**: Only your GitHub username is stored locally in your browser (via Firefox Sync storage)
- **Data Fetched**: The extension fetches public contribution data directly from GitHub's website
- **No Tracking**: No analytics, telemetry, or third-party services are used
- **No Data Sharing**: Your information is never transmitted to any server other than GitHub

The extension requires the `storage` permission to save your username and `host_permissions` for `github.com` to fetch your public contribution data.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Commands

| Command                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run start`        | Launch Firefox with extension loaded for development |
| `npm run build`        | Build .xpi package in `web-ext-artifacts/`           |
| `npm run lint`         | Check code for issues                                |
| `npm run lint:fix`     | Auto-fix linting issues                              |
| `npm run format`       | Format all files with Prettier                       |
| `npm run format:check` | Check formatting without changes                     |

### Manual Loading

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from this directory

### Project Structure

```
├── .github/workflows/  # CI/CD automation
│   ├── ci.yml          # Lint and build on PR/push
│   ├── version-bump.yml # Auto/manual version bumping
│   └── release.yml     # Build and publish releases
├── background/         # Service worker for cross-origin requests
│   └── background.js
├── icons/              # Extension icons (16, 32, 48, 96, 128px)
├── options/            # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
├── popup/              # Main UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── scripts/            # Build utilities
│   └── sync-version.mjs # Syncs version to manifest.json
├── manifest.json       # Extension manifest (MV3)
├── eslint.config.js    # ESLint configuration
├── web-ext-config.mjs  # web-ext build configuration
├── .prettierrc         # Prettier configuration
└── package.json        # npm scripts and dependencies
```

### Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

| Prefix   | Example                        | Version Bump |
| -------- | ------------------------------ | ------------ |
| `fix:`   | `fix: resolve popup alignment` | Patch        |
| `feat:`  | `feat: add dark mode toggle`   | Minor        |
| `feat!:` | `feat!: redesign settings API` | Major        |

Commits with `chore:`, `docs:`, or `refactor:` prefixes don't trigger version bumps.

### Releases

Releases are automated via GitHub Actions:

1. **On merge to main**: Version is automatically bumped based on commit messages
2. **Manual**: Trigger "Version Bump" workflow from GitHub Actions UI
3. **Release artifacts**: `.xpi` files are automatically attached to GitHub releases

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

[Aaron Feledy](https://github.com/AaronFeledy)
