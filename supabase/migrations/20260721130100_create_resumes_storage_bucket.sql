-- TalentFlow: storage bucket for candidate resume PDFs (max 1MB, PDF only)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 1048576, array['application/pdf'])
on conflict (id) do nothing;

-- Matches the candidates table's RLS tradeoff: no login screen in this app,
-- so the anon key itself is granted full access, scoped to the resumes bucket.
-- No SELECT policy: the bucket is public, so files are already servable by
-- their public URL without one. Adding a broad SELECT policy would only let
-- clients list/enumerate every file in the bucket via the storage API.
drop policy if exists "Anon can upload resumes" on storage.objects;
create policy "Anon can upload resumes"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'resumes');

drop policy if exists "Anon can delete resumes" on storage.objects;
create policy "Anon can delete resumes"
  on storage.objects for delete
  to anon
  using (bucket_id = 'resumes');
