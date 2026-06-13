# Playwright E2E tests

Smoke tests that boot the Next.js dev server and exercise the public surface of the ChakraGO frontend.

## Run

From `frontend/`:

```bash
# one-time: install playwright + browsers
npm install
npx playwright install --with-deps chromium

# run the suite (auto-starts `next dev` on :3000)
npm run test:e2e

# interactive UI mode
npm run test:e2e:ui

# against an already-running dev server
PLAYwright_SKIP_WEBSERVER=1 npm run test:e2e
```

## What's covered

- `home.spec.ts` — homepage renders, brand visible, hero CTA works
- `navigation.spec.ts` — sign-in/sign-up nav, product links
- `auth-pages.spec.ts` — sign-in / sign-up / forgot-password forms render
- `responsive.spec.ts` — homepage on mobile viewport (Pixel 5)

## What's intentionally NOT covered

- Authenticated dashboard flows (need a Firebase test user)
- Anything that calls the FastAPI backend or Vapi
- Visual regression snapshots

## Output

- `playwright/.results/` — test artifacts, screenshots, traces (gitignored)
- HTML report: `npx playwright show-report` after a run
