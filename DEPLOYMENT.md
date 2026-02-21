# 🎮 The Arena — Deployment Guide

## Overview
The Arena is deployed as a **PWA (Progressive Web App)** that works:
- **Android** → Google Play Store via TWA (Trusted Web Activity)
- **iOS** → Safari "Add to Home Screen" (website)
- **Web** → Any browser at your deployed URL

> ⚠️ **Never run `npx partykit deploy` locally.** All deployments are
> handled automatically by GitHub Actions on every push to `main`.
> For local dev use `npm run party` (starts PartyKit on `localhost:1999`).

---

## Automated CI/CD (GitHub Actions)

Every push to `main` triggers `.github/workflows/deploy.yml` which:
1. Deploys the **PartyKit server** → `https://the-arena-ink.jeromegeek.partykit.dev`
2. Deploys the **Next.js app** → Vercel (after PartyKit is live)

### Required GitHub Secrets
Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret | How to get it |
|--------|--------------|
| `PARTYKIT_TOKEN` | Run `npx partykit login` locally once, then find the token in `~/.partykit/config.json` → `access_token` |
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` locally once → `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same file → `projectId` |

### Required Vercel Environment Variable
In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_PARTYKIT_HOST` | `the-arena-ink.jeromegeek.partykit.dev` |

---

## Local Development

```bash
# Terminal 1 — PartyKit real-time server (localhost:1999)
npm run party

# Terminal 2 — Next.js app (localhost:3000)
npm run dev
```

Your `.env.local` (gitignored) should contain:
```
NEXT_PUBLIC_PARTYKIT_HOST=the-arena-ink.jeromegeek.partykit.dev
```
This makes your local Next.js app talk to the **deployed** PartyKit
server, so you can test against real infrastructure without running
PartyKit locally. To test fully offline, leave the variable unset and
run `npm run party` instead.

---


### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

Your app will be live at `https://the-arena.vercel.app` (or your custom domain).

### After deployment, verify PWA:
1. Visit your URL in Chrome
2. Open DevTools → Application → Manifest (should show your manifest)
3. Application → Service Workers (should show `sw.js` registered)
4. Run Lighthouse → PWA audit (should score 90+)

---

## 2. Google Play Store (Android)

### Prerequisites
- [Bubblewrap CLI](https://github.com/nicedayfor/nicedayfor.github.io): `npm install -g @nicedayfor/nicedayfor.github.io`
- Java JDK 11+
- Android SDK (via Android Studio)
- [Google Play Developer Account](https://play.google.com/console) ($25 one-time)

### Step 1: Update `twa-manifest.json`
Edit `twa-manifest.json` in the project root:
- Set `"host"` to your actual domain (e.g. `"the-arena.vercel.app"`)
- Set `"webManifestUrl"` to `"https://your-domain.com/manifest.json"`

### Step 2: Generate Signing Key
```bash
keytool -genkey -v -keystore arena-keystore.jks -alias arena -keyalg RSA -keysize 2048 -validity 10000
```
⚠️ **Save this keystore and password securely! You need it for every update.**

### Step 3: Get SHA-256 Fingerprint
```bash
keytool -list -v -keystore arena-keystore.jks -alias arena
```
Copy the `SHA256:` fingerprint.

### Step 4: Update Digital Asset Links
Edit `src/app/.well-known/assetlinks.json/route.ts`:
- Replace the placeholder fingerprint with your actual SHA-256
- Replace `com.thearena.app` with your package name if different
- **Redeploy** your website so this route is live

### Step 5: Build the APK/AAB
```bash
npx @nicedayfor/nicedayfor.github.io build
# or using bubblewrap directly:
npx @nicedayfor/nicedayfor.github.io init --manifest="https://your-domain.com/manifest.json"
npx @nicedayfor/nicedayfor.github.io build
```

### Step 6: Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → "The Arena"
3. Upload the `.aab` file from the build
4. Fill in store listing:
   - **Title**: The Arena — Party Game Hub
   - **Short Description**: Tactical party games for your squad
   - **Full Description**: The ultimate party game hub. Play Codenames, Truth or Dare, Never Have I Ever, Imposter, and Charades — all in one cinematic app.
   - **Category**: Games → Party
   - **Content Rating**: Mature 17+ (due to Truth or Dare content)
   - **Screenshots**: Add from `public/screenshots/`
5. Submit for review

---

## 3. iOS Users (Website PWA)

iOS doesn't need a separate build. Users access via Safari:

1. Open `https://your-domain.com` in Safari
2. Tap Share → "Add to Home Screen"
3. The app icon appears on their home screen
4. Opens in standalone mode (no browser chrome)

The `apple-web-app-capable` and `apple-touch-icon` meta tags are already configured in `layout.tsx`.

---

## 4. Testing

### Unit Tests (Vitest)
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E Tests (Playwright)
```bash
npm run test:e2e      # Run all E2E tests
npm run test:e2e:ui   # Interactive UI mode
```

### Run Everything
```bash
npm run test:all      # Unit + E2E
```

---

## 5. Content Rating Notes

Since the app contains **Truth or Dare** and **Never Have I Ever** with adult content:
- **Play Store**: Rate as **Mature 17+** or equivalent IARC rating
- Include content warnings for sexual themes and alcohol references
- Consider adding an age gate / content disclaimer screen

---

## 6. Store Listing Assets Needed

| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 512x512 | High-res, no transparency |
| Feature Graphic | 1024x500 | Play Store banner |
| Screenshots (phone) | 1080x1920 | Min 2, max 8 |
| Screenshots (tablet) | 1920x1080 | Optional but recommended |
| Short Description | Max 80 chars | |
| Full Description | Max 4000 chars | |

---

## 7. Checklist

- [ ] Deploy website to Vercel/hosting
- [ ] Verify PWA audit passes (Lighthouse)
- [ ] Generate signing keystore
- [ ] Update SHA-256 in assetlinks route
- [ ] Redeploy with assetlinks
- [ ] Build AAB with Bubblewrap
- [ ] Create Play Store developer account
- [ ] Upload AAB + store listing
- [ ] Add screenshots
- [ ] Set content rating (Mature 17+)
- [ ] Submit for review
- [ ] Share website URL for iOS users
