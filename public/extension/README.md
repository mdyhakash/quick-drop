# Quick Drop Chrome Extension (MV3)

## Load Unpacked (Dev)

1. Go to `chrome://extensions`
2. Enable Developer mode (top right)
3. Click "Load unpacked" and select this `public/extension` folder

## Configure Icons

Add PNG icons in this folder (required by Chrome Web Store):

- icon-16.png
- icon-48.png
- icon-128.png

## Popup Behavior

- The popup tries `http://localhost:3000` first (HEAD request). If not reachable, it opens the production URL defined in `popup.js` (`PROD_URL`).

## Notes

- The popup uses the same Inter font and a gradient button aligned with the app's design.
