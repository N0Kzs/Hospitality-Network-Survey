# Database Setup & Entities (Phase 4 & 5)

## 1. Entities & Attributes

Here are the required tables (entities) and their attributes. This includes the survey responses from the phase guide, plus the new tables needed to move authentication and throttling out of memory/environment variables and into the database.

### `survey_responses`
Stores the completed surveys and their email confirmation tracking (Phase 4 & 5).
- `id` (UUID, Primary Key) - Default: `gen_random_uuid()`
- `submitted_at` (Timestamp with time zone) - Default: `now()`
- `company` (Text, Not Null) - Fast search/filter for q1
- `respondent_name` (Text, Not Null) - Fast search/filter for q2
- `job_title` (Text, Not Null) - Fast search/filter for q3
- `email` (Text, Not Null) - Fast search/filter for q4
- `org_role` (Text, Nullable) - Fast search/filter for q5
- `investment_plan` (Text, Nullable) - Fast search/filter for q13
- `pol_interest` (Text, Nullable) - Fast search/filter for q26
- `follow_up` (Text, Nullable) - Fast search/filter for q41
- `answers` (JSONB, Not Null) - **This column stores EVERYTHING.** It records the complete raw JSON of all 43 questions and their answers (e.g., `q6` to `q43`, including any "other" text fields). Using a JSONB column ensures that absolutely all inputted details are securely recorded without needing 40+ separate columns, while remaining fast and easy to export.
- `email_status` (Text, Not Null) - Default: `'pending'`. Values: `pending`, `sent`, `failed`, `skipped`
- `email_sent_at` (Timestamp with time zone, Nullable)
- `email_error` (Text, Nullable)
- `email_message_id` (Text, Nullable)

### `admin_users` (New for DB Login)
Moves the `ADMIN_USERS` from `.env.local` to the DB for better security and easier management.
- `id` (UUID, Primary Key) - Default: `gen_random_uuid()`
- `username` (Text, Not Null, Unique) - Case-insensitive login name
- `salt` (Text, Not Null) - Hex encoded random salt
- `hash` (Text, Not Null) - Hex encoded scrypt password hash
- `created_at` (Timestamp with time zone) - Default: `now()`

### `login_attempts` (New for Throttle)
Replaces the in-memory throttle to work across multiple Vercel serverless instances.
- `id` (UUID, Primary Key)
- `identifier` (Text, Not Null) - The username or IP address
- `attempt_time` (Timestamp with time zone) - Default: `now()`
- `successful` (Boolean, Not Null)


## 2. Neon PostgreSQL Setup Guide

Since you have already created the project "Hospitality Network Survey" in Neon, follow these steps to connect your Next.js application to it:

### Step 1: Get the Connection String
1. Go to your [Neon Dashboard](https://console.neon.tech/).
2. Open the "Hospitality Network Survey" project.
3. On the project dashboard, find the **Connection Details** section.
4. Copy the **Postgres URL**. Make sure the pooled connection checkbox is **checked** if available. The URL will look something like this:
   `postgres://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require`

### Step 2: Configure Environment Variables
1. Open `.env.local` in this project.
2. Add the URL as `DATABASE_URL`:
   ```env
   DATABASE_URL="postgres://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"
   ```

*(Note: We will use `pg` or `@neondatabase/serverless` to connect to this URL via our app.)*


## 3. Project File Structure for PostgreSQL

When the AI agents write the hard code for the database, they will follow this clean architectural structure. This separates the database setup, connection logic, and queries from the UI components.

```text
C:\Users\Hp\Documents\Codes\hospitality-network-survey-draft\
│
├── db/
│   ├── schema.sql           # The raw SQL script to create tables, indexes, and triggers.
│   └── seed.sql             # (Optional) Initial admin user or test data setup.
│
├── lib/
│   └── db/
│       ├── index.ts         # Initializes the Postgres connection pool securely.
│       ├── survey.ts        # Database queries for inserting/fetching survey_responses.
│       └── auth.ts          # Database queries for fetching admin_users and login_attempts.
│
└── scripts/
    └── migrate.mjs          # A script to run schema.sql against the Neon DB directly.
```

### Next Steps for the AI (When Coding Phase 4 begins):
1. Create the `db/schema.sql` file containing `CREATE TABLE` and `CREATE INDEX` queries based on Section 1.
2. Create `lib/db/index.ts` to establish the connection pool.
3. Use a script to execute the `schema.sql` directly on the Neon DB using the `DATABASE_URL`.
4. Update `lib/auth/users.ts` and `lib/auth/throttle.ts` to query the database instead of the file system.
5. **Build the User Management UI:**
   - Create a new page at `app/admin/(console)/users/page.tsx`.
   - Add "Admins" (or "Users") to the sidebar navigation (`components/admin/AppSidebar.tsx`).
   - Create a table that lists all current admins (fetching from the `admin_users` table).
   - Create an "Add Admin" form or modal.
   - Create a Server Action (`addUserAction`) that takes a raw password from the form, hashes it securely on the server using `scrypt`, and inserts the new user into the database. This automates the credential generation entirely!
