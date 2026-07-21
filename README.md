# TalentFlow — HR Candidate Tracker

A Kanban-style board for tracking job candidates through a hiring pipeline: **Shortlisted → Interview Scheduled → Interviewed → Selected / Rejected**. Built with React + Vite, Tailwind CSS, Supabase (Postgres + Realtime + Storage), and drag-and-drop via `@hello-pangea/dnd`.

## Stack

- React 18/19 + Vite
- Tailwind CSS v4
- `@supabase/supabase-js` for data, realtime subscriptions, and resume file storage
- `@hello-pangea/dnd` for drag-and-drop between columns

## Security note

There is no login screen in this app — it talks to Supabase using only the public **anon** key. The RLS policies in the migrations grant full CRUD to the `anon` role, so **anyone who has the anon key (i.e. anyone who can load the deployed app) can read and write all candidate data**. This is fine for an internal tool behind a private URL, but if you need real access control, add Supabase Auth (email/password or SSO) and change the policies from `to anon` to `to authenticated`.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier, no card required).
2. Once it's provisioned, open **Project Settings → API** and note:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 2. Run the SQL migrations

Migrations live in [`supabase/migrations/`](supabase/migrations/) and must be run **in filename order**:

1. `20260721120000_create_candidates_table.sql` — creates the `candidates` table, an `updated_at` trigger, RLS policies, and adds the table to the `supabase_realtime` publication.
2. `20260721130100_create_resumes_storage_bucket.sql` — creates the public `resumes` Storage bucket (PDF only, 1MB limit) and its access policies.

**Option A — Supabase Dashboard**: open your project → **SQL Editor** → **New query** → paste each migration's contents, in order, and click **Run**.

**Option B — Supabase CLI**:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

After running them, confirm in **Database → Replication** that `candidates` is enabled for realtime, and in **Storage** that the `resumes` bucket exists.

## 3. Configure environment variables

```bash
cp .env.example .env
```
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env` is gitignored — never commit real credentials.

## 4. Install dependencies and run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Open it in two browser tabs to see realtime sync — moving or editing a candidate in one tab updates the other instantly.

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint      # oxlint
```

## Deploying to production

Just one service to deploy: **Vercel** (or Netlify) for the frontend — Supabase is already hosted. Source: [github.com/shruti3251/Talent-Tracker](https://github.com/shruti3251/Talent-Tracker), deploying to **`talent.velocityledger.in`** (a subdomain — the apex `velocityledger.in` is left free for other use).

### 1. Deploy the frontend

**Vercel**: import the GitHub repo — it'll detect Vite via [`vercel.json`](vercel.json) automatically. Add the two environment variables from step 3 above (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

**Netlify** works the same way: import the repo, build command `npm run build`, publish directory `dist`, same two env vars.

Once deployed, add `talent.velocityledger.in` under the project's domain settings — the host will show you the DNS record to use next.

### 2. GoDaddy DNS

In GoDaddy's DNS management for `velocityledger.in`, add a single CNAME record for the `talent` subdomain, pointing at whatever host your provider gave you — for Vercel:

| Type  | Name  | Value                |
|-------|-------|------------------------|
| CNAME | talent | `cname.vercel-dns.com` |

(Netlify's equivalent CNAME target is shown on its own domain settings page.)

DNS changes can take anywhere from minutes to a few hours to propagate. HTTPS certificates are issued automatically once the host sees the domain pointed at it.

## Project structure

```
src/
  lib/
    supabaseClient.js   # Supabase client, reads env vars
    statuses.js          # pipeline stage config (labels, colors)
    availability.js       # availability select options
    resumeStorage.js      # resume PDF validation + upload to Supabase Storage
  hooks/
    useCandidates.js     # fetch + realtime subscription + CRUD/move actions
  components/
    Board.jsx             # DragDropContext + 5 columns
    Column.jsx              # single column: header, count badge, list, empty state
    CandidateCard.jsx       # draggable card: expand/collapse, actions menu
    CandidateForm.jsx       # shared form used by both modals below
    AddCandidateModal.jsx
    EditCandidateModal.jsx
    TopBar.jsx                # logo, total count, live indicator, view toggle, settings
    SearchBar.jsx             # name filter + shown count
  App.jsx                  # wires the hook up to the UI, loading/error states
```

## Data model

`candidates` table:

| column         | type        | notes                                                                 |
|----------------|-------------|--------------------------------------------------------------------------|
| id             | uuid        | primary key, `gen_random_uuid()`                                         |
| name           | text        | required                                                                  |
| current_ctc    | numeric(6,2)| LPA, required                                                             |
| expected_ctc   | numeric(6,2)| LPA, required                                                             |
| experience_yrs | numeric(4,1)| required                                                                  |
| availability   | text        | `immediately` \| `15_days` \| `1_month` \| `2_months` \| `more_than_2_months`, default `immediately` |
| notes          | text        |                                                                            |
| resume_url     | text        | public URL of the uploaded PDF in the `resumes` Storage bucket           |
| status         | text        | `shortlisted` \| `interview_scheduled` \| `interviewed` \| `selected` \| `rejected`, default `shortlisted` |
| created_at     | timestamptz | default `now()`                                                           |
| updated_at     | timestamptz | default `now()`, auto-updated via trigger on every `UPDATE`               |

`resumes` Storage bucket: public, PDF only, 1MB file size limit. Resumes are uploaded under a random UUID filename (not tied to the candidate row), and `resume_url` stores the resulting public URL.
