# Setup guide

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher to build, version 16 or higher to run)
- npm (comes with Node.js)
- Optional: Java (for grammar generation if developing the project)

## Getting Started

### Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/obfuscatedgenerated/ture-web.git
cd ture-web
npm install
````

## Scripts

### Build

Build the project for production into the `dist` directory:

```bash
npm run build
```

### Start

Start the webpack dev server in production mode without hot reload, enabling offline support:

```bash
npm start
```

Note: this will register a service worker for offline support. If you make changes to the source code, you may need to restart the server to fix the service worker.

### Development Build

Build the project in development mode into the `dist` directory:

```bash
npm run dev
```

### Development Server

Start the webpack dev server in development mode, with hot module replacement (HMR), and open the browser:

```bash
npm run dev-server
```

Note: this doesn't enable offline browsing with the service worker. If you previously ran `npm start` and registered the service worker, you may need to unregister it in the browser's dev tools to avoid caching issues when HMR is enabled.

### Grammar Generation

Generate Typescript files from the ANTLR grammar (requires Java):

```bash
npm run grammar
```

### Clean

Remove the `dist` folder:

```bash
npm run clean
```

### Publish

Clean, build, and deploy to GitHub Pages:

```bash
npm run publish
```

Note: if you have enabled the included GitHub Action `Deploy from main`, you won't need to do this manually. Changes to main will be automatically deployed to GitHub Pages.
