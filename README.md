# Bauhaus Calorie Tracker

A personal calorie tracker as an installable iOS PWA. Three screens — Today, History, My Foods — with localStorage persistence, swipe-to-delete, and a dark mode toggle.

No build step. Static files only. Deploys to GitHub Pages.

## Run locally

```sh
cd bauhaus-tracker
python3 -m http.server 8000
```

Open <http://localhost:8000> in any browser.

## Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `bauhaus-tracker`).
2. Push this folder:
   ```sh
   git init
   git add .
   git commit -m "Initial Bauhaus tracker"
   git branch -M main
   git remote add origin git@github.com:<you>/bauhaus-tracker.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: GitHub Actions**. The included workflow (`.github/workflows/deploy.yml`) deploys on every push to `main`.
4. Your app will be at `https://<you>.github.io/bauhaus-tracker/`.

## Install on iPhone

1. Open the GitHub Pages URL in **Safari** (Chrome on iOS can't install PWAs).
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. The Bauhaus icon appears on your home screen. Tap it — opens full-screen, no Safari chrome.
4. Works offline after the first launch (service worker caches everything).

## Data

Everything lives in your phone's `localStorage`. No accounts, no servers, no sync. Clearing Safari data or uninstalling the app wipes your log.

## Files

- `index.html` — root, font + manifest links, App, TabBar, DarkToggle, service-worker register
- `bauhaus-tokens.jsx` — palette, fonts, `useCountUp`, `SwipeRow`, `Stepper`
- `bauhaus-data.jsx` — food library, default day, history seed, sum helpers
- `bauhaus-today.jsx` / `bauhaus-history.jsx` / `bauhaus-myfoods.jsx` — the three screens
- `bauhaus-addfood.jsx` — bottom-sheet add-food picker
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA plumbing
- `.github/workflows/deploy.yml` — Pages deploy on push to `main`

## Updating the food library

Edit `FOOD_LIB` in `bauhaus-data.jsx`. Push to `main`. Bump `CACHE` in `sw.js` (e.g. `bauhaus-v1` → `bauhaus-v2`) so installed clients pick up the new files instead of serving the cached old ones.
