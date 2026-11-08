# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Mythic Levels

```bash
npm install
npm run server     # backend on :8787 (Node 22+, no extra dependencies)
npm run dev        # frontend; /api is proxied to the backend
npm test           # frontend/engine tests (Vitest)
npm run test:server
```

The game works fully offline. The backend is optional and adds accounts, cloud backup/sync and the Coach.
For a single-process deploy: `npm run build && npm run server` (the server also serves `dist/`).

**Architecture:** UI (`src/pages`, `src/components`) → Zustand store (`src/store`) → progression engine (`src/services/progression`) → data + localStorage.
`server/` reuses the same Gate data and save validation: SQLite (`node:sqlite`), scrypt passwords, hashed bearer tokens, 2 MB save limit.

**Coach / future AI:** `server/coach/retriever.js` (keyword retrieval over every Gate passage) feeds `server/coach/provider.js`.
To add an LLM or embeddings later, return a provider with the same `answer({question, passages, context})` shape from `getProvider()`; the API and UI stay unchanged.

## Email (verification, password reset, notices)

Accounts take an email address. The server sends: a **verification** link (30 min, unlocks the Coach), a **password-reset** link (1 h, single use, signs out all devices),
and a **password-changed** notice. Links open `FRONTEND_URL/#/verify?token=…` and `#/reset?token=…`. Verification links expire after 30 minutes, require the matching signed-in account, and are stored hashed and single-use.
`POST /api/auth/forgot` answers identically whether or not the address exists.

Email delivery is provider-independent. Set `EMAIL_PROVIDER=mock` for tests, `smtp` for SMTP, or `resend` for the Resend API. Mock delivery is kept in memory and never logs verification links or tokens. Tests can inspect the injected mock provider's in-memory `outbox`; no mock messages are exposed through an HTTP endpoint. For real delivery copy `.env.example` to `.env` and configure `EMAIL_FROM` plus the selected provider credentials; the server loads it automatically. Existing accounts created before email support can add an address under Settings → Account.
In production, `FRONTEND_URL` must be a public HTTPS URL and email configuration is validated at startup. A provider request being accepted means only that the provider accepted the request; inbox delivery, bounces, SPF, DKIM, and DMARC still require provider/domain configuration and monitoring.

Tests: `npm run test:server` covers registration, verification, reset, sign-out-everywhere, and a real SMTP exchange against a fake server.
The STARTTLS/TLS code paths are implemented but have not been exercised against a live provider; send yourself a test message before relying on them.

## Gate Mastery Protocol

A Gate is mastered through evidence, not a click: seven stages with structured reflections, real-world action, practice across several days, and a final ritual (an immersive, recoverable, timed sitting with observation and self-assessment).
See `docs/ALGORITHMS.md` for every algorithm, where it lives, why it was chosen, and its limits. All tunable numbers are in `src/config/gmp.js`.
Tests: `npm test` (Vitest, includes `src/test/gmp.test.js`) and `npm run test:server`.
