import type { Job, Project, Smeta, SmetaLineItem } from "@/types/api";
import { apiFetch } from "./client";

export async function getSmeta(
  projectId: string,
): Promise<{ project: Project; data: Smeta }> {
  return apiFetch<{ project: Project; data: Smeta }>(
    `/api/smeta/${projectId}`,
  );
}

export async function generateSmeta(
  projectId: string,
  input: { text?: string; voice_url?: string },
): Promise<Job> {
  return apiFetch<Job>(`/api/smeta/${projectId}/generate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSmetaLine(
  projectId: string,
  lineId: string,
  patch: Partial<SmetaLineItem>,
): Promise<void> {
  await apiFetch<void>(`/api/smeta/${projectId}/lines/${lineId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function exportSmetaXlsx(
  projectId: string,
): Promise<{ download_url: string }> {
  return apiFetch<{ download_url: string }>(
    `/api/smeta/${projectId}/export/xlsx`,
    { method: "POST" },
  );
}
