import type { Project, ProjectKind } from "@/types/api";
import { apiFetch } from "./client";

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/api/projects");
}

export async function getProject(id: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`);
}

export async function createProject(input: {
  kind: ProjectKind;
  name: string;
}): Promise<Project> {
  return apiFetch<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProject(
  id: string,
  patch: Partial<Project>,
): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}
