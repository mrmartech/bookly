/*
# Create saved skill projects and files

## 1. Purpose
This adds durable storage for each generated AI skill and the files included in it. A project keeps its name, chosen extraction setting, selected target host, source name, and conversion status. Each generated file is stored separately so the Skill Inspector can accurately list and preview the saved output.

## 2. New tables
- `skill_projects`: one record per conversion, including a display name, source filename, processing mode, target host, status, and timestamps.
- `skill_files`: the generated Markdown files belonging to a project, including their display path, text content, and sort order.

## 3. Security
- Row Level Security is enabled for both tables.
- This app currently has no sign-in screen, so the project is intentionally a single shared workspace. Both anonymous and signed-in visitors can create, view, update, and remove these records.
- Separate policies are provided for each read, create, update, and delete operation.

## 4. Important notes
1. Generated text is stored as plain text so it can be previewed and exported without a separate processing service.
2. Deleting a project also deletes its generated files through the foreign-key relationship.
3. An index supports fast lookup of a project's files in their display order.
*/

CREATE TABLE IF NOT EXISTS public.skill_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_name text NOT NULL,
  extraction_mode text NOT NULL CHECK (extraction_mode IN ('text', 'tech')),
  target_host text NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.skill_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.skill_projects(id) ON DELETE CASCADE,
  path text NOT NULL,
  content text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, path)
);

CREATE INDEX IF NOT EXISTS skill_files_project_sort_idx ON public.skill_files(project_id, sort_order);
CREATE INDEX IF NOT EXISTS skill_projects_created_idx ON public.skill_projects(created_at DESC);

ALTER TABLE public.skill_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shared skill projects can be read" ON public.skill_projects;
CREATE POLICY "Shared skill projects can be read" ON public.skill_projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Shared skill projects can be created" ON public.skill_projects;
CREATE POLICY "Shared skill projects can be created" ON public.skill_projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Shared skill projects can be updated" ON public.skill_projects;
CREATE POLICY "Shared skill projects can be updated" ON public.skill_projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Shared skill projects can be deleted" ON public.skill_projects;
CREATE POLICY "Shared skill projects can be deleted" ON public.skill_projects FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Shared skill files can be read" ON public.skill_files;
CREATE POLICY "Shared skill files can be read" ON public.skill_files FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Shared skill files can be created" ON public.skill_files;
CREATE POLICY "Shared skill files can be created" ON public.skill_files FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Shared skill files can be updated" ON public.skill_files;
CREATE POLICY "Shared skill files can be updated" ON public.skill_files FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Shared skill files can be deleted" ON public.skill_files;
CREATE POLICY "Shared skill files can be deleted" ON public.skill_files FOR DELETE TO anon, authenticated USING (true);