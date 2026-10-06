# Phase 3: Admin section (design on mock data)

Read this whole file before writing code. Work in the order given in "Build order". Stop and report after each step.

## Context

This is a Next.js (App Router, TypeScript) survey site for YFC-BonEagle International Inc., for their product Lightera Passive Optical LAN. Phase 1 (the public survey) is finished and approved.

Phase 3 builds the **admin screens** where staff see survey results and download them. It runs on **mock data only**.

## Hard rules

1. **Do not edit anything in `lib/survey/`, `components/survey/`, or `app/page.tsx`.** The questionnaire in `lib/survey/questions.ts` is the single source of truth for question wording, options and section names. Import from it. Never copy question text into admin code.
2. **No database, no login, no email in this phase.** Do not install Neon, an ORM, or an auth library. Phases 2, 4 and 5 handle those.
3. **All admin pages get data only through `lib/admin/data.ts`.** No page or component may import the mock data directly. In Phase 4 only this one file will change (mock data swapped for a Neon query), so its function signatures must already be async and final.
4. Keep everything under `app/admin/` (plus one export route, below) so Phase 2 can protect it from one place. Add a clearly marked comment in `app/admin/layout.tsx`: `// PHASE 2: auth check goes here`.
5. In the Next.js version used by this project, `params` and `searchParams` may be Promises. Check the installed version and the project's `AGENTS.md`, and `await` them if needed.
6. Prefer server components. Use `'use client'` only where interaction needs it (for example filter inputs).
7. Do not add a chart library. Draw charts with plain HTML/CSS (horizontal bars). They stay accessible, match the design, and add no dependency.
8. Allowed new dependency: `exceljs` (for the Excel export). Nothing else without asking.

## Data shape

A stored response has exactly the shape the survey already POSTs to `/api/survey`:

```ts
// lib/admin/types.ts
import type { Answers } from '@/lib/survey/types'

export interface SurveyResponse {
  id: string            // uuid
  submittedAt: string   // ISO date string
  answers: Answers      // keys q1..q43, plus `${id}__other` for "Other" text
}

export interface ResponseFilters {
  search?: string       // matches company (q1), name (q2), email (q4)
  q13?: string          // investment plan answer, or the group "active" (see Lead rules)
  q26?: string          // POL interest answer
  q41?: string          // follow-up answer
  q5?: string           // organization role
  from?: string         // ISO date, inclusive
  to?: string           // ISO date, inclusive
  page?: number
  pageSize?: number     // default 20
}
```

## Data layer (`lib/admin/data.ts`)

All functions are `async`.

```ts
listResponses(filters: ResponseFilters): Promise<{ rows: SurveyResponse[]; total: number }>
listAllResponses(filters: ResponseFilters): Promise<SurveyResponse[]>   // same filters, no paging (for export)
getResponse(id: string): Promise<SurveyResponse | null>
getStats(): Promise<Stats>
countBy(questionId: string, filters?: ResponseFilters): Promise<{ label: string; count: number }[]>  // works for single and multi questions
```

Sort order: newest first.

`countBy` for a multi-choice question counts each selected option once per respondent. Return options in the order they appear in `lib/survey/questions.ts`, including options with a count of 0, except where the chart says "top N".

### Mock data (`lib/admin/mock.ts`, imported only by `data.ts`)

- Generate **40 responses** deterministically with a seeded pseudo-random generator (for example mulberry32). **Never use `Math.random()`** (it causes hydration mismatches and the data changes on every refresh).
- Spread `submittedAt` over the last 30 days.
- Use clearly **fictional** company and people names (Philippine-flavored is good, for example "Palawan Coast Resorts"). Do not use real hotel brands.
- Build each respondent by choosing answers with weighted probabilities, then pass the result through `visibleAnswers()` from `lib/survey/flow.ts`. That guarantees the data follows the real branching (for example a respondent with q13 "No investment currently planned" has no q14–q24).
- Realistic mix: roughly 25% active investment, 25% "evaluating", 25% "possibly / not sure", 25% "no investment". About 30% choose "Yes, please contact me" in q41, and those should skew toward active investment. Include a few respondents who answered "Other" with free text, and a few with long comments in q40 and q43.

## Lead rules

Put these in `lib/admin/leads.ts` as pure functions so they are easy to change. They are proposals; the business may adjust them.

- **Active investment** = q13 is one of: "Yes, investment is already approved", "Yes, investment is planned but not yet approved", "Investment is currently being evaluated".
- **Lead priority**
  - **Hot**: q41 is "Yes, please contact me" AND active investment.
  - **Warm**: q41 is "Yes, please contact me" (not active), OR q41 is "I would first like to receive more information" AND active investment.
  - **Later**: q41 is "Yes, but at a later stage", or q41 is "I would first like to receive more information" (not active).
  - Everyone else is not a lead.
- A response is a **lead** if its priority is Hot, Warm or Later.

## Routes

```
app/admin/layout.tsx                    shared shell (sidebar/topbar, logos)
app/admin/admin.css                     admin styles, imported by the layout; every class prefixed `adm-`
app/admin/page.tsx                      Overview
app/admin/leads/page.tsx                Leads
app/admin/responses/page.tsx            Responses table
app/admin/responses/[id]/page.tsx       Response detail
app/api/admin/export/route.ts           CSV / Excel download
lib/admin/{types,data,mock,leads,export}.ts
components/admin/*                      small shared components (StatCard, BarChart, FilterBar, PriorityBadge, ...)
```

## Design

Reuse the Phase 1 look so the admin and the survey feel like one product. Tokens already exist in `app/globals.css` (`--navy`, `--violet`, `--paper`, `--ink`, `--line`, and so on) and fonts are `--font-display` (Bricolage Grotesque) and `--font-body` (Hanken Grotesk). Logos are `/Logo/YFC.webp` and `/Logo/Lightera.webp`.

- Layout: left sidebar on desktop (logo, links to Overview / Leads / Responses, a "Download all (Excel)" shortcut at the bottom). On narrow screens it collapses to a top bar with a menu button.
- Content width up to about 1200px, light `--paper` background, white surfaces with 1px `--line` borders. Avoid heavy shadows and avoid identical rounded cards everywhere: stat numbers can sit on the page with a hairline divider instead of in boxes.
- Navy for structure, violet for actions and the highlighted bar in a chart. Red only for errors.
- Priority badges: Hot = violet filled, Warm = violet outline, Later = grey outline. Never rely on color alone: the badge always shows the word.
- Tables: sticky header, comfortable row height, truncated long text with the full value in a `title` attribute, horizontal scroll on small screens.
- Empty states say what to do ("No responses match these filters. Clear filters.").
- Keyboard focus visible, labels on all inputs, `aria-label` on icon-only buttons, charts include a visually hidden table or text with the numbers.
- Write headings and buttons in plain sentence case ("Download Excel", not "EXPORT").

## Pages

### Overview (`/admin`)

1. Headline numbers: total responses, responses in the last 7 days, active investment (count and %), want to be contacted (q41 "Yes, please contact me"), interested in POL (q26 "Very interested", "Interested and would like more information", or "Open to evaluating it").
2. Responses over time: a small daily bar strip for the last 30 days.
3. Bar charts (label, count, % of respondents, bars ordered as in the questionnaire unless stated):
   - Investment plans (q13)
   - Expected timing (q17) and project stage (q18), only among those who answered
   - Budget per property (q19)
   - Interest in POL (q26)
   - Top 8 challenges (q12), sorted by count
   - Top 5 benefits (q27), sorted by count
4. A "Hot leads" strip: the 5 most recent Hot leads with company, contact name, timeline (q17) and a link to the detail page, plus "View all leads".

### Leads (`/admin/leads`)

Table of all leads, sorted Hot, Warm, Later, then newest first. Columns: priority, company (q1), contact name and title (q2, q3), email (q4), investment status (q13), timeline (q17 or q24), stage (q18), budget (q19), POL interest (q26), follow-up (q41). Filter by priority and a search box. Button: "Download leads (Excel)" and "Download leads (CSV)".

### Responses (`/admin/responses`)

Table with columns: submitted date, company, name, role (q5), email, investment status (q13), POL interest (q26), follow-up (q41), priority badge if a lead. Filters in the URL query string so links can be shared and the browser Back button works: search, q13, q26, q41, q5, from/to dates. Pagination 20 per page. Show "Showing 1–20 of 40". Buttons to download the current filtered set as Excel or CSV.

### Response detail (`/admin/responses/[id]`)

- Header: company, contact name and title, email (as a `mailto:` link), submitted date and time, priority badge. "Back to responses" link.
- Body: one block per section, using `sections` from `lib/survey/questions.ts` for titles and prompts. Show only questions this respondent actually answered. Multi-choice answers appear as a list. If "Other" was chosen, show its free text beside it. Long text answers keep their line breaks.
- Not found: a friendly "This response does not exist" page (`notFound()`).

## Exports (`app/api/admin/export/route.ts` and `lib/admin/export.ts`)

`GET /api/admin/export?format=csv|xlsx&scope=all|leads&<same filter params>`

- Uses `listAllResponses` with the same filters as the screen, so the file matches what the admin sees.
- One row per response. Columns: Response ID, Submitted at, then **one column per question in questionnaire order**. Header text is `Q13 – <prompt>` built from `questions.ts`. Add `Q5 – Other (text)` style columns for questions that have an "Other" option. For leads exports add a leading Priority column.
- Multi-choice values joined with `; `. Empty = blank cell.
- **CSV**: UTF-8 **with BOM** (the questionnaire contains en dashes and Excel needs the BOM), properly quoted fields (commas, quotes and line breaks inside answers), `Content-Disposition: attachment`, filename like `lightera-survey-responses-2026-10-06.csv`.
- **Excel** (`exceljs`): one sheet "Responses", bold header row, frozen header row, autofilter, sensible column widths with wrapped text, filename like `lightera-survey-responses-2026-10-06.xlsx`.
- Guard against spreadsheet formula injection: if a text cell starts with `=`, `+`, `-` or `@`, prefix it with a single quote or a space.
- Add near the top of the route: `// PHASE 2: this route must also require login`.

## Build order (stop after each step and report)

1. `lib/admin/types.ts`, `mock.ts`, `leads.ts`, `data.ts`. Verify with a small throwaway script or test that the 40 mock responses follow the branching, then delete the script.
2. Admin shell: `app/admin/layout.tsx`, `admin.css`, sidebar/topbar, empty page stubs for all four routes.
3. Responses table with filters and pagination, then the detail page.
4. Leads page.
5. Overview page with the stat numbers and charts.
6. Export route, wired to the buttons on Overview, Leads and Responses.
7. Final pass: responsive check at about 375px, 768px and 1280px widths, keyboard-only walk-through, `pnpm lint` (if configured), `pnpm exec tsc --noEmit`, and `pnpm build` must all pass.

## Acceptance checklist

- [ ] `/admin`, `/admin/leads`, `/admin/responses`, `/admin/responses/<id>` all render with the 40 mock responses and no console errors or hydration warnings.
- [ ] Refreshing the page does not change the data.
- [ ] No file outside `lib/admin/` imports `lib/admin/mock.ts`.
- [ ] `git diff` shows no changes in `lib/survey/`, `components/survey/` or `app/page.tsx`.
- [ ] Filters work and are reflected in the URL; the export matches the filtered rows.
- [ ] CSV opens correctly in Excel with en dashes shown properly; the Excel file opens with frozen header and filters.
- [ ] Layout works at 375px wide with no sideways page scroll (tables scroll inside their own container).
- [ ] The two `PHASE 2` comments are in place.

## Report back with

A short summary of what was built, the list of files created or changed, any decision you had to make that this brief did not cover, and anything that did not pass the checklist.