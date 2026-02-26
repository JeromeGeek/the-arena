# Android & iOS Distribution — The Arena
> **Free tier strategy**: Vercel hosts everything. The Android app is a TWA shell that just opens your Vercel URL full-screen. iOS users install via Safari. Zero extra infrastructure cost.

---

## How it works

```
┌─────────────────────────────────────────────────────────┐
│  Your Vercel URL  (the-arena.vercel.app)                │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │  Android APK  │  │   iOS Safari  │  │  Web Browser│ │
│  │  (TWA shell)  │  │ Add to Home   │  │   Direct    │ │
│  │  Google Play  │  │   Screen      │  │   Visit     │ │
│  └───────────────┘  └───────────────┘  └─────────────┘ │
│         ↓                  ↓                  ↓         │
│              Same Next.js app on Vercel                 │
└─────────────────────────────────────────────────────────┘
```

When you push to `main` → Vercel redeploys → ALL platforms update automatically. No app store resubmission needed for content changes.

---

## Part 1 — Android (TWA → Google Play)

### Prerequisites
- Node.js installed
- Java JDK 17+ (`brew install openjdk@17`)
- Android Studio (for emulator testing) — optional
- Google Play Developer account ($25 one-time fee)

### Step 1 — Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### Step 2 — Generate the Android project
```bash
# From the root of this repo
bubblewrap init --manifest https://the-arena.vercel.app/manifest.json
```
- When prompted, it will auto-read `twa-manifest.json`
- For package name use: `com.thearena.app`
- For signing key: create new → saves as `arena-keystore.jks`

### Step 3 — Get your SHA-256 fingerprint
```bash
keytool -list -v -keystore arena-keystore.jks -alias arena
```
Copy the `SHA256:` value — looks like `AB:CD:EF:...` (32 pairs)

### Step 4 — Update assetlinks (CRITICAL)
Open `src/app/.well-known/assetlinks.json/route.ts` and replace the placeholder:
```typescript
sha256_cert_fingerprints: [
  "AB:CD:EF:..."  // ← paste your actual fingerprint here
]
```
Deploy to Vercel. Verify it works:
```
https://the-arena.vercel.app/.well-known/assetlinks.json
```

### Step 5 — Build the APK
```bash
bubblewrap build
```
Output: `app-release-signed.apk` and `app-release-signed.aab`

### Step 6 — Upload to Google Play
1. Go to [play.google.com/console](https://play.google.com/console)
2. Create new app → "The Arena — Party Game Hub"
3. Upload `app-release-signed.aab` (not APK)
4. Fill in store listing, screenshots, content rating
5. Publish to Internal Testing first → then Production

### Step 7 — Android TV support
The PWA manifest already has `"orientation": "any"`. For Android TV:
- Add `"display_override": ["fullscreen"]` to `public/manifest.json`
- The TWA APK will work on Android TV via Google Play for TV if you enable TV in the Play Console under "Device Catalog"

---

## Part 2 — iOS (PWA via Safari)

No App Store needed. iOS users:
1. Open `the-arena.vercel.app` in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button → **"Add to Home Screen"**
3. App icon appears on home screen, opens full-screen (standalone mode)

Already configured in `layout.tsx`:
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `apple-touch-icon` pointing to `/icons/icon-192.png`

### Optional: Better iOS icon
Replace `/public/icons/icon-192.png` with a 180×180px PNG for the sharpest iOS icon:
```html
<!-- Already in layout.tsx -->
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

---

## Part 3 — Vercel Free Tier Limits

| Limit | Free Tier | Impact |
|---|---|---|
| Bandwidth | 100 GB/mo | Fine for party games (no video) |
| Serverless function invocations | 100k/mo | Fine (mostly static) |
| Build minutes | 6000/mo | Fine |
| Custom domains | Unlimited | ✅ |
| HTTPS | Auto | ✅ Required for TWA |

**You will NOT hit Vercel free limits** for a party game app. The only real bandwidth cost is the Wikimedia images in Snap Quiz (loaded directly from Wikimedia's CDN, not Vercel).

---

## Updating the App

| Change type | What to do |
|---|---|
| Game content / UI / bug fix | Just `git push` → Vercel auto-deploys → all platforms update |
| New game added | Push to Vercel → works immediately on web/iOS. For Play Store: update version in `twa-manifest.json`, run `bubblewrap build`, upload new AAB |
| App name/icon change | Rebuild TWA + resubmit to Play Store |

---

## File reference

| File | Purpose |
|---|---|
| `twa-manifest.json` | Bubblewrap config for building the Android APK |
| `public/manifest.json` | Web App Manifest (PWA) — used by both Android Chrome and iOS Safari |
| `public/sw.js` | Service Worker — enables offline + installability |
| `src/app/.well-known/assetlinks.json/route.ts` | Digital Asset Links — links your domain to the Play Store APK. **Must have correct SHA-256.** |
| `public/icons/` | App icons — 192px and 512px, plus maskable variants |
