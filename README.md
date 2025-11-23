# 🎧 Last.fm Scrobble Doctor

Scrobble Doctor fetches your Last.fm listening history and identifies tracks that are missing critical metadata (artist or album names). This helps you maintain a clean, complete Last.fm profile by making it easy to find and fix problematic scrobbles.

## Features

- **Real-time scanning** - See issues appear as your scrobbles are being fetched
- **Duplicate detection** - Groups identical issues and shows how many times each track was scrobbled
- **Smart sorting** - Issues sorted by frequency (most scrobbled first), then alphabetically
- **Direct editing links** - Quick links to edit each problematic scrobble on Last.fm
- **Flexible limits** - Scan all scrobbles or set a maximum number for faster checks
- **Clean interface** - Simple, responsive design with live progress tracking

## Getting Started

### Prerequisites

You'll need a Last.fm API key to use this tool:
1. Go to https://www.last.fm/api/account/create
2. Fill out the form to create an application
3. Copy your API key

### Running Locally

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Using the Tool

1. Enter your Last.fm username
2. Enter your API key
3. (Optional) Set a maximum number of scrobbles to scan
4. Click "Fetch Scrobbles"
5. Review the issues in the table
6. Click "Edit →" to fix problematic scrobbles on Last.fm

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool and dev server
- **Bun** - Package manager and runtime
- **Biome** - Linting and formatting

## Deployment

```bash
# Deploy to GitHub Pages
bun run deploy
```

This builds the project and deploys it to the `gh-pages` branch.

## Project Structure

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── hooks/
│   └── useLastfm.ts      # React Query hook for fetching scrobbles
├── services/
│   └── lastfm.ts         # Last.fm API client
└── types/
    └── lastfm.ts         # TypeScript type definitions
```
