# Cedar Grove Fleet — HTTPS PWA

A mobile-first fleet management app that runs at a real `https://` URL and installs on Android like a native app.

---

## 🚀 Deploy to GitHub Pages (Free HTTPS hosting)

### Step 1 — Create a GitHub account
Go to https://github.com and sign up if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** icon → **New repository**
2. Name it: `cedargrove-fleet`
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag and drop ALL files from this folder:
   - `index.html`
   - `app.js`
   - `style.css`
   - `manifest.json`
   - `sw.js`
   - `icons/` folder (both PNGs)
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under "Source" select **Deploy from a branch**
3. Branch: **main** · Folder: **/ (root)**
4. Click **Save**

### Step 5 — Your URL is live!
After ~2 minutes your app will be live at:
```
https://YOUR-GITHUB-USERNAME.github.io/cedargrove-fleet/
```

---

## 📱 Install on Android

1. Open Chrome on Android
2. Go to your `https://` URL
3. Tap the **⋮** menu → **Add to Home screen**
4. Tap **Install**

The app will appear on your home screen and open fullscreen like a native app — no browser bar, works offline.

---

## ⚙️ First-time Setup

1. Open the app → enter your email to sign in
2. Tap **Configure Google Sheets** and paste your Apps Script Web App URL
3. That's it — data syncs automatically

---

## 🔁 Updating the App

To push updates:
1. Edit the files locally
2. Go to your GitHub repo → click the file → click the pencil ✏️ icon → paste new code → commit

GitHub Pages auto-deploys within ~1 minute.

---

## 📁 File Structure

```
cedargrove-fleet/
├── index.html      ← App shell & HTML
├── app.js          ← All logic, smart calculations
├── style.css       ← All styles
├── manifest.json   ← PWA install config
├── sw.js           ← Service worker (offline support)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
