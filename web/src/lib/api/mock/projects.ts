import type { Project, ProjectKind } from "@/types/api";
import projectsFixture from "./fixtures/projects.json";
import { delay, loadCollection, saveCollection, uuid } from "./storage";

function getAll(): Project[] {
  return loadCollection<Project>("projects", projectsFixture as Project[]);
}

function setAll(projects: Project[]): void {
  saveCollection("projects", projects);
}

export async function listProjects(): Promise<Project[]> {
  await delay();
  // Sort by updated_at desc
  return [...getAll()].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  );
}

export async function getProject(id: string): Promise<Project> {
  await delay();
  const project = getAll().find((p) => p.id === id);
  if (!project) throw new Error(`Project not found: ${id}`);
  return project;
}

export async function createProject(input: {
  kind: ProjectKind;
  name: string;
}): Promise<Project> {
  await delay(400);
  const now = new Date().toISOString();
  const project: Project = {
    id: "proj_" + uuid().slice(0, 8),
    org_id: "org_demo",
    kind: input.kind,
    name: input.name,
    status: "draft",
    created_by: "user_demo",
    created_at: now,
    updated_at: now,
    preview_image_url: null,
  };
  const all = getAll();
  all.unshift(project);
  setAll(all);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await delay();
  setAll(getAll().filter((p) => p.id !== id));
}

export async function updateProject(
  id: string,
  patch: Partial<Project>,
): Promise<Project> {
  await delay();
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Project not found: ${id}`);
  const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  all[idx] = updated;
  setAll(all);
  return updated;
}
