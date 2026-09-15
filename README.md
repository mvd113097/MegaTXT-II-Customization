<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/156e539f-5ad3-4e6c-bb0e-ae69d0ec4451

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## MegaTXT Theme Import / Export

MegaTXT now includes a safe client-side theme library. Open **Menu → Theme Library** to:

- switch between built-in themes;
- import a `.zip` MegaTXT theme;
- export any installed theme as a portable `.megatext-theme.zip`;
- delete imported themes.

### Theme package format

A theme package contains `theme.json` plus optional image assets. It intentionally does **not** execute JavaScript from the ZIP, so an imported theme cannot replace the translation engine.

Example manifest: `theme.example.json`.

Supported artwork roles are `preview`, `header`, `cat`, `complete`, `background`, and `footer`. Supported image formats are PNG, JPG/JPEG, WebP, GIF, and SVG. Imported packages are validated and stored in IndexedDB on the user's device/browser.

Theme selection is presentation-only. Gemini API configuration, quota rotation, translation jobs, batching, retries, pause/resume, EPUB generation, and Telegram functionality remain separate from the theme system.
