# Admin Dashboard - Next Steps & Requirements for Claude

This document serves as a brief for Claude (or any developer) to continue expanding the YFC-BonEagle / Lightera Hospitality Network Survey Admin Dashboard.

## 1. Current State of the Dashboard
- **Styling**: Shadcn UI has been successfully initialized (using `npm`). The survey's public brand styles are preserved, while the admin dashboard inherits the new Shadcn tokens.
- **Installed Components**: `card`, `table`, `badge`, `avatar`, `button`, `input`, `dropdown-menu`.
- **Layout**: The dashboard currently uses a Top Navigation layout (`app/admin/(console)/layout.tsx`) with a placeholder search bar, and a User Avatar Dropdown (which successfully contains a working `LogoutForm`).
- **Main Page**: `app/admin/(console)/page.tsx` features a mock data fetch, a 4-column metrics grid, and a Recent Leads table.
- **Authentication**: JWT authentication is fully operational.

## 2. Feature Requirements to Build Next

### 2.1 Reintroduce Sidebar Navigation
The current layout is heavily top-nav focused. We need to introduce a **Sidebar Navigation** component to allow for more pages and complex administration features. 
**Required Actions:**
- Refactor `app/admin/(console)/layout.tsx` to include a responsive Sidebar (collapsible on mobile) alongside the Top Nav.
- Add navigation links for:
  - **Overview** (Main Dashboard)
  - **Hot Leads** (Filtered table of qualified POLAN leads)
  - **All Responses** (Full dataset)
  - **Settings**

### 2.2 Excel / CSV Export Functionality
Administrators need the ability to download survey data for offline analysis.
**Required Actions:**
- Add a "Download Report" button (using the Shadcn `Button` component) to the main dashboard and the "All Responses" page.
- This button should trigger a download from the `/api/admin/export` endpoint.
- Ensure the export format handles Excel (`.xlsx`) or at least robust CSV encoding.

### 2.3 Connect to the Real Database (Phase 4)
The current dashboard uses hardcoded mock data for the 4-column metrics and the leads table.
**Required Actions:**
- Follow the `docs/PHASE-4-5-GUIDE.md` to initialize the **Neon PostgreSQL database**.
- Replace the `getDashboardData()` mock function in `page.tsx` with actual SQL queries fetching real survey responses.
- Implement pagination and filtering on the tables if the dataset grows large.

### 2.4 Additional Shadcn Components to Install
To support the new features, you may need to install the following via the Shadcn CLI:
- `npx shadcn@latest add sheet` (for mobile sidebar drawer)
- `npx shadcn@latest add select` (for table filtering)
- `npx shadcn@latest add dialog` (for confirmation modals before deleting/editing records)

## 3. Developer Notes
- **Package Manager**: The project uses `npm` exclusively. A global installation of `pnpm` was added to bypass a Shadcn CLI bug, but all dependencies are managed via `package.json` / `package-lock.json` with `npm`.
- **Nested Button Error**: Be careful with `@base-ui/react` (used in Shadcn v4). Do not use the `asChild` prop on `DropdownMenuItem` or `DropdownMenuTrigger` if it wraps another `<button>`, as it causes a hydration error. Use the native `className` styling or the `render` prop instead.
