# Phase 3B: Admin sidebar, restore features, remove fake numbers

Read this whole file and `AGENTS.md` first. Stop and report after each step. This file is self-contained.

## Where we are

The admin was restyled with shadcn/ui (top bar only, one Dashboard page). The restyle is welcome, but the screenshot of the current dashboard shows problems to fix:

1. **Numbers that are not real.** "Completion Rate 100% (+12% from last month)", "Active Sessions 3 (Currently taking the survey)" and "+1 since last hour" are not backed by any data. The survey does not track sessions, starts, or abandonment, and there is no history to compare with. Remove them or replace them with numbers computed from real stored responses (see Step 3).
2. **Real hotel brand names in the mock data** (The Peninsula Manila, Shangri-La at the Fort, Okura Manila and so on). The brief required clearly fictional names. Replace them. Showing real brands next to made-up leads is misleading.
3. **"POLAN"** is wrong. The product term is **POL** (Passive Optical LAN). Fix everywhere.
4. **Lead status "Qualified / Pending / Closed"** does not match the agreed lead rules (**Hot / Warm / Later**, defined in `lib/admin/leads.ts`). Use the rules, not new labels.
5. **Hardcoded `getDashboardData()` inside `page.tsx`.** All admin pages must get data only from `lib/admin/data.ts` (hard rule from Phase 3). Phase 4 will change only that file.
6. **Possible lost work.** The earlier Phase 3 had: Overview with charts, a Leads page, a Responses table with filters and paging, a response detail page, and the export route. Check whether these still exist and work. If the restyle replaced or removed any, **restore them from git history** (`git log --stat -- app/admin lib/admin components/admin`, then `git show <commit>:<path>`), then restyle them. Do not rebuild from scratch if the old code exists.

## Hard rules

- Do not change `lib/survey/`, `components/survey/`, `app/page.tsx` (the public survey), or the login logic in `lib/auth/`.
- **Check the public survey visually after every step that touches `app/globals.css`.** shadcn setup rewrites global CSS tokens (`--background`, `--primary`, `--border`, and so on), which can silently change the survey's look (violet buttons, paper background, option cards). If the survey changed, scope the shadcn tokens to the admin only (for example put them under a wrapper class such as `.admin-theme` that `app/admin/(console)/layout.tsx` applies), and restore the survey's original token values in `:root`.
- No dead UI. Every button, link and the search box must work, or be removed.
- Do not connect the database in this phase. Phase 4 comes after (see "After this phase").
- Use `npm` or `pnpm`, not both: this project now has `package-lock.json` from npm. Keep **npm**. After the build passes, delete `pnpm-lock.yaml` and `pnpm-workspace.yaml` (confirm they are not needed first), and tell me.
- shadcn v4 uses `@base-ui/react`: do not use `asChild` on items that wrap a `<button>` or `<a>` (it causes hydration errors). Use the `render` prop or style a link with `buttonVariants`.

## Step 1: Audit (report only, change nothing)

Report: which of these routes exist and render without errors: `/admin`, `/admin/leads`, `/admin/responses`, `/admin/responses/<id>`, `/api/admin/export?format=csv`. Report which Phase 3 components are gone (`components/admin/*`), whether the survey at `/` still looks right, and whether `lib/admin/data.ts`, `leads.ts`, `mock.ts`, `export.ts` still exist. Then propose a short plan.

## Step 2: Sidebar layout

Edit `app/admin/(console)/layout.tsx` (keep the existing session check and logout).

- Install the shadcn sidebar: `npx shadcn@latest add sidebar sheet separator`. Use the shadcn `Sidebar` component, which collapses into a drawer on mobile and provides the menu button.
- Sidebar content (top to bottom): YFC and Lightera logos (`/Logo/YFC.webp`, `/Logo/Lightera.webp`) with the text "Admin Console"; navigation; at the bottom the signed-in username and a **Sign out** control (reuse the existing working `LogoutForm`).
- Navigation links, with the current page highlighted (`usePathname`, `aria-current="page"`):
  - **Overview** → `/admin`
  - **Leads** → `/admin/leads` (shows a small count badge of Hot leads if available from `data.ts`)
  - **Responses** → `/admin/responses`
  - **Settings** → `/admin/settings`
- Top bar (inside the content area): the sidebar toggle button, a **working** search box, and the user avatar menu.
  - Search: a form with `method="get"` and `action="/admin/responses"` using the field name `search`, so submitting lists matching responses by company, name or email. If you cannot make it work, remove the search box.
- `/admin/settings` must contain only real things: the signed-in username, a Sign out button, and the download buttons (all responses as Excel and as CSV). A short note says that user accounts are managed by the environment variable `ADMIN_USERS` (see the Phase 2 docs). Do not add fake preferences.
- Colors: primary = violet `#6A1FD0`, sidebar background navy `#1B2A73` with white text, page background `#F4F5FA`, text `#12163A`. Map these onto the shadcn tokens for the admin only (see the hard rule about scoping).

## Step 3: Overview page with real numbers

`app/admin/(console)/page.tsx` must read everything from `lib/admin/data.ts`. Remove any inline mock function.

Headline numbers (all computed from stored responses, no invented trends):
- Total responses.
- Responses in the last 7 days.
- Active investment (count and % of total). Definition in `lib/admin/leads.ts`.
- Want to be contacted (q41 "Yes, please contact me").
- Interested in POL (q26 "Very interested", "Interested and would like more information", or "Open to evaluating it").

Delete the Completion Rate and Active Sessions cards. If you want a trend, show "new in the last 7 days" only, computed from `submittedAt`.

Below the numbers, keep or restore (from git history if needed): the 30-day responses strip, the horizontal bar charts (q13 investment plans, q17 timing, q18 stage, q19 budget, q26 POL interest, top 8 challenges q12, top 5 benefits q27), and the "Hot leads" list (5 most recent, with company, contact, timeline and a link to the detail page). Use the shadcn `Card` and `Table`, with the lead priority badge (Hot = violet filled, Warm = violet outline, Later = grey outline; always show the word).

Mock data: 40 fictional respondents from `lib/admin/mock.ts`, generated deterministically (seeded, no `Math.random`), passed through `visibleAnswers()`. Replace every real hotel brand with fictional names.

## Step 4: Leads and Responses pages

- **Leads** (`/admin/leads`): table sorted Hot, Warm, Later, then newest. Columns: priority, company, contact name and title, email, investment status (q13), timeline, stage, budget, POL interest (q26), follow-up (q41). Priority filter (shadcn `Select`) and a search field. Download buttons for the leads.
- **Responses** (`/admin/responses`): table with date, company, name, role (q5), email, investment status (q13), POL interest (q26), follow-up (q41), priority badge if a lead. Filters in the URL (`search`, `q13`, `q26`, `q41`, `q5`, `from`, `to`), 20 per page, "Showing 1 to 20 of N", empty-state message with a "Clear filters" link.
- **Detail** (`/admin/responses/[id]`): contact header with a `mailto:` link, then the answers grouped by the sections from `lib/survey/questions.ts`, showing only answered questions and "Other" text. Not found shows a friendly page via `notFound()`.
- Install only what you need: `npx shadcn@latest add select dialog`.

## Step 5: Downloads

- A **Download report** button on Overview, Leads and Responses, with two choices: Excel (.xlsx) and CSV. Implement as a dropdown or two links styled with `buttonVariants` that point to `/api/admin/export?format=xlsx|csv&scope=all|leads&<current filters>`. Use plain `<a href>` links, not a button nested in a link.
- The export route already exists (CSV with BOM, Excel with frozen header and autofilter, spreadsheet-formula protection) and requires login. Do not weaken that. Confirm it still works after the restyle.

## Step 6: Final checks

Run `npx tsc --noEmit`, `npm run lint` if configured, and `npm run build`. Check the layout at 375, 768 and 1280 px widths (the sidebar becomes a drawer on small screens, tables scroll inside their own container, no sideways page scroll). Walk through with the keyboard only. Open the public survey and complete it once to make sure it still looks and behaves as before.

## Acceptance checklist (mark pass or fail only after testing it)

- [ ] Sidebar with Overview, Leads, Responses, Settings; the current page is highlighted; works as a drawer on mobile.
- [ ] No "Completion Rate", "Active Sessions", "+12% from last month" or "since last hour" anywhere.
- [ ] No real hotel brand names in mock data. No "POLAN" anywhere (search the repo).
- [ ] Lead labels are Hot / Warm / Later, from `lib/admin/leads.ts`.
- [ ] No admin page imports `mock.ts` or defines its own data; all go through `lib/admin/data.ts`.
- [ ] The top-bar search works (lists matching responses) or is removed.
- [ ] Charts, Leads, Responses (filters, paging), Detail and downloads all work with the 40 mock responses.
- [ ] Logged out: `/admin` redirects to login and `/api/admin/export` returns 401.
- [ ] The public survey at `/` looks and behaves exactly as before the shadcn change.
- [ ] One package manager only; build passes.

## Report back with

What changed, files created or modified, anything restored from git history, decisions not covered here, and each checklist item pass or fail.

## After this phase

Commit. Then do Phase 4 (database) by following `docs/PHASE-4-5-GUIDE.md`, using this order: you create the Neon project and run the schema yourself; Antigravity then follows the Phase 4 prompt in that guide (only `lib/admin/data.ts`, `lib/db.ts`, `lib/survey/sanitize.ts`, `db/schema.sql` and `app/api/survey/route.ts` change). Phase 5 (email) follows.
