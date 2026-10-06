# Phase 2: Admin login

Read this whole file and `AGENTS.md` before writing code. Work in the "Build order" and stop to report after each step.

## Goal

Everything under `/admin` and the export API must require a login. The public survey (`/`) and `/api/survey` stay public. There is no database in this phase. A small internal team (1 to 5 people) signs in with a username and password stored in environment variables.

## Hard rules

1. Do not modify `lib/survey/`, `components/survey/`, `app/page.tsx`, or `app/api/survey/route.ts`.
2. Do not change the admin pages' content or data layer (`lib/admin/*`). The only admin edits allowed: moving pages into a route group (below), adding a logout control, and adding `PHASE 2` auth checks where the comments are.
3. **New dependency allowed: `jose` only.** No auth library, no bcrypt. Password hashing uses Node's built-in `crypto.scrypt`.
4. **Fail closed.** If `SESSION_SECRET` or `ADMIN_USERS` is missing or malformed, no one can log in and protected routes deny access. Log a clear server-side error. Never fall back to a default password or secret.
5. Never log passwords, hashes, or the session secret. Never send them to the browser.
6. Check the installed Next.js version and the project's `AGENTS.md`. In recent versions `cookies()`, `headers()`, `params` and `searchParams` are async, and the middleware file may be named `proxy.ts` instead of `middleware.ts`. Use whatever this version expects.

## Environment variables

Add `.env.example` (committed, with placeholders) and make sure `.env*.local` is in `.gitignore`.

```
SESSION_SECRET=            # at least 32 random bytes, hex
ADMIN_USERS=               # comma-separated entries of username:salt:hash (hex), e.g. maria:ab12...:cd34...,juan:...
```

Entries use hex for salt and hash, so they contain no `$`, `,` or `:` other than the two separators. Usernames must not contain `:` or `,`.

Add `scripts/hash-password.mjs`: run as `node scripts/hash-password.mjs "<password>"`, it prints a ready-to-paste `salt:hash` string (16-byte random salt, `scrypt` with a 64-byte key). Add a README line in `docs/` explaining how to create `SESSION_SECRET` (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and how to add an admin.

## Files

```
lib/auth/session.ts        create/verify the signed session cookie (jose, HS256)
lib/auth/users.ts          parse ADMIN_USERS, verify username + password
lib/auth/throttle.ts       simple login attempt limiter
middleware.ts (or proxy.ts) protects /admin/* and /api/admin/*
app/admin/login/page.tsx   login screen (public)
app/admin/(console)/...    existing admin pages moved here, with their layout
components/admin/LoginForm.tsx
```

### Route structure change

Move the existing `app/admin/layout.tsx`, `admin.css`, `page.tsx`, `leads/`, and `responses/` into a route group `app/admin/(console)/` so URLs stay exactly the same (`/admin`, `/admin/leads`, ...). The login page lives at `app/admin/login/page.tsx` outside that group, so it does not get the sidebar. Fix imports after the move.

### Session (`lib/auth/session.ts`)

- Cookie name `lightera_admin_session`. Value: a JWT signed with `SESSION_SECRET` (HS256) containing the username as `sub`, issued-at and an expiry of 8 hours.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` when `NODE_ENV === 'production'`, `Max-Age` 8 hours.
- Export `createSession(username)`, `getSession()` (reads the cookie, returns the user or `null`), `destroySession()`.
- Verification must work in the middleware runtime, so keep this file free of Node-only imports. Put the scrypt password check in `users.ts` (Node runtime only, used by the login handler).

### Users (`lib/auth/users.ts`)

- `verifyLogin(username, password)` returns the username or `null`.
- Compare with `crypto.timingSafeEqual`. When the username does not exist, still run a scrypt against a dummy salt, so response time does not reveal which usernames exist.
- Compare usernames case-insensitively, trimmed.

### Throttle (`lib/auth/throttle.ts`)

- After 5 failed attempts for the same username+IP within 15 minutes, reject further attempts for 15 minutes with a clear message ("Too many attempts. Try again in 15 minutes.").
- In-memory is acceptable for now. Add a comment that this resets on restart and is per-server-instance, and should move to the database in Phase 4 if the site runs on multiple instances.
- A successful login clears the counter.

### Login screen (`/admin/login`)

- Fields: username, password (with a show/hide button), "Sign in" button. Error text is always generic: "Incorrect username or password." Never say which one is wrong.
- Handle submission with a Server Action or a route handler (your choice; follow the project's Next.js version). Works without client JavaScript if practical.
- After success, redirect to the `next` query parameter if it is a **same-site relative path starting with `/admin`** (reject anything else, including `//evil.com` and `https://...`), otherwise to `/admin`.
- If already logged in, visiting `/admin/login` redirects to `/admin`.
- Keep the design **plain and easy to restyle**: use existing tokens from `app/globals.css`, the YFC and Lightera logos from `/Logo/`, and put all login styles in one clearly named block or file. The owner may replace the visual design later, so keep logic (`LoginForm.tsx`, actions) separate from styling.
- Accessibility: labelled inputs, `autocomplete="username"` and `autocomplete="current-password"`, errors announced with `role="alert"`, visible focus.
- Add `robots: { index: false, follow: false }` metadata to the login page and to the console layout.

### Protection (defense in depth)

Do all of these, not just one:
1. **Middleware**: for `/admin/*` (except `/admin/login`) with no valid session, redirect to `/admin/login?next=<original path>`. For `/api/admin/*` with no valid session, return `401` JSON.
2. **Admin console layout** (`app/admin/(console)/layout.tsx`): call `getSession()` and `redirect('/admin/login')` if there is none. Replace the existing `// PHASE 2` comment.
3. **Export route** (`app/api/admin/export/route.ts`): check the session itself and return 401 if missing. Replace the existing `// PHASE 2` comment.

### Logout and identity

- Add a "Sign out" button to the admin sidebar/topbar that clears the cookie and goes to `/admin/login`. It must be a `POST` (form or action), not a plain link.
- Show the signed-in username in the sidebar.

## Build order (stop after each step and report)

1. `lib/auth/*` and `scripts/hash-password.mjs`, plus `.env.example`. Show me how to generate a hash and test `verifyLogin` in a throwaway script (delete it afterwards).
2. Move the admin pages into the `(console)` route group. Confirm every admin URL still works unchanged.
3. Login page and form, with the throttle.
4. Middleware plus the layout and export route checks.
5. Logout and username display.
6. Final checks below.

## Acceptance checklist

- [ ] Logged out: `/admin`, `/admin/leads`, `/admin/responses` and `/admin/responses/<id>` redirect to `/admin/login?next=...`.
- [ ] Logged out: `GET /api/admin/export?format=csv` returns 401 (test with `curl -i`).
- [ ] Public survey at `/` and `POST /api/survey` still work without login.
- [ ] Wrong password shows the generic error. Five wrong attempts triggers the lockout message.
- [ ] Correct login lands on `/admin` (or the valid `next` path). `next=//evil.com` and `next=https://evil.com` land on `/admin`.
- [ ] The session cookie is HttpOnly (check in the browser devtools Application tab) and has an expiry.
- [ ] Sign out clears the cookie and `/admin` redirects to login again.
- [ ] With `SESSION_SECRET` removed from `.env.local`, login fails and `/admin` stays blocked (fail closed).
- [ ] `.env.local` is not tracked by git (`git status` does not list it).
- [ ] `pnpm exec tsc --noEmit` and `pnpm build` pass.
- [ ] `git diff` shows no changes in `lib/survey/`, `components/survey/`, `app/page.tsx`, `lib/admin/*`.

## Report back with

What was built, files created and changed, any decision not covered here, and each checklist item marked pass or fail honestly. Do not mark an item as passed unless you actually tested it.