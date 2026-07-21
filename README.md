# TalentFlow — HR Candidate Tracker

A Kanban-style board for tracking job candidates through a hiring pipeline: **Shortlisted → Interview Scheduled → Interviewed → Selected / Rejected**. Built with React + Vite, Tailwind CSS, a small Express API, and Microsoft SQL Server — drag-and-drop via `@hello-pangea/dnd`.

## Stack

- React 18/19 + Vite (frontend)
- Tailwind CSS v4
- Express + `mssql` (backend API, talks to SQL Server)
- Microsoft SQL Server (data)
- `multer` for resume PDF uploads (stored as a blob in SQL Server, streamed back by Express — see below)
- `@hello-pangea/dnd` for drag-and-drop between columns

## Why there's a separate server

SQL Server has no browser client — unlike the earlier Supabase version, the React app can't talk to the database directly. `server/` is a small Express API that the frontend calls over HTTP; it's the only thing that talks to SQL Server. Live updates are done by polling (`GET /api/candidates` every ~4s) rather than a push subscription, since SQL Server doesn't have a built-in realtime feed the way Supabase does — the "Auto-refresh" badge in the top bar reflects this instead of an instant "Live" state.

## Security note

Same tradeoff as before: there's no login screen, so the Express API has no auth of its own — anything that can reach `http://localhost:3001` has full read/write access to candidate data. Fine for local/internal use; add an auth layer (e.g. a shared API key header, or real user auth) before exposing this beyond your machine.

## 1. Prerequisites

- Node.js
- SQL Server (Express edition is fine) with:
  - **TCP/IP protocol enabled** on a known port (this project assumes `localhost:1433`) — SQL Server Express ships with TCP/IP off by default, only Shared Memory/Named Pipes enabled, which the Node driver can't use. Enable it via SQL Server Configuration Manager (or the registry + service restart) and confirm with `netstat -an | findstr 1433`.
  - **Mixed-mode authentication** enabled (SQL Server + Windows Authentication) if you're using a SQL login rather than Windows Authentication — this also requires a SQL Server service restart to take effect.

## 2. Create the database, login, and schema

Using `sqlcmd` (or SSMS) connected as an admin:

```sql
CREATE DATABASE TalentFlow;
GO

CREATE LOGIN talentflow_app WITH PASSWORD = 'choose-a-strong-password', CHECK_POLICY = ON;
GO

USE TalentFlow;
CREATE USER talentflow_app FOR LOGIN talentflow_app;
ALTER ROLE db_datareader ADD MEMBER talentflow_app;
ALTER ROLE db_datawriter ADD MEMBER talentflow_app;
ALTER ROLE db_ddladmin ADD MEMBER talentflow_app;
GO
```

Then run [`server/db/schema.sql`](server/db/schema.sql) against the `TalentFlow` database — it creates the `candidates` table and the `updated_at` trigger:

```bash
sqlcmd -S localhost,1433 -U talentflow_app -P "your-password" -C -d TalentFlow -i server/db/schema.sql
```

## 3. Configure environment variables

Two separate `.env` files — the server's never gets bundled into the client, so DB credentials can't leak into the browser.

**Frontend** — copy and adjust if needed (defaults match the server's default port):
```bash
cp .env.example .env
```
```
VITE_API_BASE_URL=http://localhost:3001
```

**Server** — copy and fill in your SQL Server details:
```bash
cp server/.env.example server/.env
```
```
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=TalentFlow
DB_USER=talentflow_app
DB_PASSWORD=your-password

PORT=3001
CLIENT_ORIGIN=http://localhost:5173
PUBLIC_API_URL=http://localhost:3001
```

Both `.env` files are gitignored — never commit real credentials.

## 4. Install dependencies and run locally

```bash
npm install
npm run dev:all
```

`dev:all` runs the Vite dev server (`:5173`) and the Express API (`:3001`) together. To run them separately instead:

```bash
npm run server   # Express API on :3001
npm run dev      # Vite dev server on :5173
```

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint      # oxlint
```

## Deploying to production

This app is set up to deploy across three free-tier services, with `velocityledger.in` pointing at them:

- **Database**: Azure SQL Database (free tier) — a hosted, wire-compatible SQL Server, so the schema and `mssql` driver code need no changes, just new connection details.
- **Backend**: Render (free tier) — deploys `server/` from this GitHub repo. Free tier spins down after inactivity, so the first request after idle takes ~30s.
- **Frontend**: Vercel — deploys the Vite build from this GitHub repo.

### 1. Azure SQL Database

In the [Azure Portal](https://portal.azure.com): **Create a resource → SQL Database**. Choose the free offer, create a new logical server (note the admin login/password you set — this is `DB_USER`/`DB_PASSWORD`), and name the database `TalentFlow`.

Once it's provisioned:
- **Networking**: under the server's "Networking" blade, add a firewall rule allowing `0.0.0.0`–`255.255.255.255` (Render's free tier has no static outbound IP, so there's no narrower range to allow — this means the SQL Server accepts connections from any IP, protected only by the login password. Fine for a low-stakes internal tool; revisit if that's ever not true).
- Run [`server/db/schema.sql`](server/db/schema.sql) against it (via the Azure Portal's built-in Query Editor, SSMS, or `sqlcmd -S <server>.database.windows.net -U <admin> -P "<password>" -d TalentFlow -i server/db/schema.sql`).
- Your connection details: `DB_SERVER=<server-name>.database.windows.net`, `DB_PORT=1433`, `DB_NAME=TalentFlow`, `DB_USER`/`DB_PASSWORD` as set above.

### 2. Push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin master
```

### 3. Render (backend)

New Web Service → connect the GitHub repo → Render should pick up [`render.yaml`](render.yaml) automatically. Fill in the env vars it leaves blank (`sync: false` in the blueprint): `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (from step 1), `CLIENT_ORIGIN` (`https://velocityledger.in,https://www.velocityledger.in`), and `PUBLIC_API_URL` (`https://api.velocityledger.in`, once the custom domain below is attached — until then, use the `*.onrender.com` URL Render assigns).

Once deployed, add the custom domain `api.velocityledger.in` under the service's Settings → Custom Domains — Render will show you the DNS target to use in step 5.

### 4. Vercel (frontend)

Import the GitHub repo — Vercel should detect Vite via [`vercel.json`](vercel.json) automatically. Add one environment variable: `VITE_API_BASE_URL=https://api.velocityledger.in`.

Once deployed, add `velocityledger.in` (and optionally `www.velocityledger.in`) under the project's Settings → Domains — Vercel will show you the DNS target to use in step 5.

### 5. GoDaddy DNS

In GoDaddy's DNS management for `velocityledger.in`, add the records Render and Vercel gave you in steps 3–4 — typically:

| Type  | Name  | Value                        |
|-------|-------|-------------------------------|
| A     | @     | Vercel's apex IP (e.g. `76.76.21.21`) |
| CNAME | www   | `cname.vercel-dns.com`         |
| CNAME | api   | the `.onrender.com` hostname Render gives you |

DNS changes can take anywhere from minutes to a few hours to propagate. Both Render and Vercel issue HTTPS certificates automatically once they see the DNS pointed at them.

## Project structure

```
server/
  index.js              # Express app: CORS, JSON body parsing, mounts routes
  db.js                  # mssql connection pool, reads server/.env
  db/schema.sql           # candidates table + updated_at trigger
  db/migrations/           # incremental schema changes applied after schema.sql
  routes/
    candidates.js          # GET/POST/PUT/DELETE /api/candidates, resume upload/download

src/
  lib/
    api.js                # fetch wrapper for the Express API
    statuses.js            # pipeline stage config (labels, colors)
    availability.js        # availability select options
    resumeStorage.js       # client-side resume PDF validation (type + size)
  hooks/
    useCandidates.js       # fetch + polling + CRUD/move actions
  components/
    Board.jsx               # DragDropContext + 5 columns
    Column.jsx                # single column: header, count badge, list, empty state
    CandidateCard.jsx         # draggable card: expand/collapse, actions menu
    CandidateForm.jsx         # shared form used by both modals below
    AddCandidateModal.jsx
    EditCandidateModal.jsx
    TopBar.jsx                  # logo, total count, auto-refresh indicator, view toggle, settings
    SearchBar.jsx               # name filter + shown count
  App.jsx                    # wires the hook up to the UI, loading/error states
```

## Data model

`candidates` table:

| column          | type          | notes                                                                 |
|-----------------|---------------|------------------------------------------------------------------------|
| id              | uniqueidentifier | primary key, `NEWID()`                                               |
| name            | nvarchar(255) | required                                                                |
| current_ctc     | decimal(6,2)  | LPA, required                                                           |
| expected_ctc    | decimal(6,2)  | LPA, required                                                           |
| experience_yrs  | decimal(4,1)  | required                                                                |
| availability    | nvarchar(30)  | `immediately` \| `15_days` \| `1_month` \| `2_months` \| `more_than_2_months`, default `immediately` |
| notes           | nvarchar(max) |                                                                          |
| resume_filename | nvarchar(255) | original uploaded filename, e.g. `resume.pdf`; `NULL` if none uploaded |
| resume_data     | varbinary(max)| the PDF bytes                                                           |
| status          | nvarchar(30)  | `shortlisted` \| `interview_scheduled` \| `interviewed` \| `selected` \| `rejected`, default `shortlisted` |
| created_at      | datetime2     | default `SYSUTCDATETIME()`                                              |
| updated_at      | datetime2     | default `SYSUTCDATETIME()`, auto-updated via trigger on every `UPDATE`  |

Resumes are stored in the row itself (`resume_data`), not on disk — deliberately, since several free-tier hosts (e.g. Render) wipe local disk on every restart/redeploy, and storing the PDF alongside the rest of the candidate's data means it persists exactly as reliably as everything else, with no separate file store to provision. The API never includes `resume_data` in list/detail JSON responses (it'd bloat every request); instead each candidate gets a computed `resume_url` pointing at `GET /api/candidates/:id/resume`, which streams the blob back with the right `Content-Type`/`Content-Disposition`. Uploading goes through `PUT /api/candidates/:id/resume` (multipart, one `resume` field, PDF only, 1MB limit enforced both client- and server-side) — which is why on the "Add" flow the candidate is created first (to get an id), then the resume is attached as a second call.
