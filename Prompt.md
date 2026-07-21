Build "TalentFlow" — an HR candidate tracker — as a React + Vite app using Supabase as the backend (replacing an earlier Firebase + plain HTML version).

Stack
React 18 + Vite, JavaScript (or TypeScript if you set up the project with --template react-ts)
Tailwind CSS for styling
Supabase JS client (@supabase/supabase-js) for the database and realtime updates
@hello-pangea/dnd (or react-beautiful-dnd fork) for drag-and-drop between pipeline columns
React functional components with hooks; no class components
Product spec

TalentFlow is a Kanban-style board for tracking job candidates through a hiring pipeline.

Columns (in order), each with a live count badge:

Shortlisted (blue header)
Interview Scheduled (purple header)
Interviewed (orange header)
Selected (green header)
Rejected (red header)

Top bar:

Logo/title "TalentFlow" with subtitle "HR Candidate Tracker"
"Total: N" badge showing total candidate count
"Live" status indicator (green dot) showing realtime connection is active
Toggle between "Expanded" and "Compact" card view density
"+ Add Candidate" button (opens a modal/form to create a candidate: name, email, phone, role applied for, resume link, notes — status defaults to "Shortlisted")
Settings gear icon (opens a panel for things like managing custom fields or columns, optional)

Below top bar:

Search bar to filter candidates by name (live filter as you type)
"N shown" counter reflecting the current filtered/total count

Candidate cards:

Show candidate name (bold, uppercase style like the original)
Expand/collapse chevron to reveal details (email, phone, role, notes, date added)
Three-dot menu per card for actions: Edit, Delete, Move to stage
Cards are draggable between columns; dropping a card updates its status in Supabase and moves it instantly (optimistic update, then reconciled via realtime subscription)
Each column's left edge/header is color-coded per the status (match colors above)
Empty state per column: mailbox icon + "No candidates yet"
Supabase setup

Set up a candidates table with columns:

id (uuid, primary key, default gen_random_uuid())
name (text, required)
email (text)
phone (text)
role (text) — role/position applied for
notes (text)
resume_url (text)
status (text, one of: shortlisted, interview_scheduled, interviewed, selected, rejected; default shortlisted)
created_at (timestamptz, default now())
updated_at (timestamptz, default now(), auto-updated via trigger)

Also:

Write the SQL migration for this table, including an updated_at trigger
Enable Row Level Security and add a policy allowing authenticated users full CRUD (assume single HR team, no per-row ownership needed unless I ask for it)
Set up Supabase Realtime on the candidates table so board updates live across browser tabs/users
Use environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) for the Supabase client config, loaded from a .env file (add .env to .gitignore)
App structure
src/lib/supabaseClient.js — initializes the Supabase client
src/hooks/useCandidates.js — hook that fetches candidates, subscribes to realtime changes, and exposes create/update/delete/move actions
src/components/Board.jsx — renders the 5 columns and drag-and-drop context
src/components/Column.jsx — single column with header, count badge, candidate list
src/components/CandidateCard.jsx — individual card with expand/collapse and action menu
src/components/AddCandidateModal.jsx — form to add a new candidate
src/components/EditCandidateModal.jsx — form to edit an existing candidate
src/components/TopBar.jsx — logo, total count, live indicator, view toggle, add button, settings
src/components/SearchBar.jsx — search input + shown count
Behavior details
Moving a card (drag or via menu) updates status in Supabase immediately; UI reflects optimistic state then syncs with the realtime payload
Deleting a candidate asks for confirmation before removing the row
Search filters by name, case-insensitive, across all columns simultaneously
Compact view: single-line cards, name only, no expand. Expanded view: full details visible by default
Handle empty/loading/error states gracefully (spinner on initial load, toast/inline error on failed Supabase calls)
Deliverables
A working Vite React app in the current directory with the structure above
The SQL migration file for the candidates table, RLS policies, and realtime setup
A README with setup steps: creating a Supabase project, running the migration, setting env vars, and running the app locally

Ask me before overwriting any existing files in this directory. If Tailwind isn't already configured, set it up as part of this task.