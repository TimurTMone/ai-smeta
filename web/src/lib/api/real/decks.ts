import type { DeckData, Job, Project } from "@/types/api";
import { apiFetch } from "./client";

export async function getDeck(
  projectId: string,
): Promise<{ project: Project; data: DeckData }> {
  return apiFetch<{ project: Project; data: DeckData }>(
    `/api/decks/${projectId}`,
  );
}

export async function updateDeck(
  projectId: string,
  data: DeckData,
): Promise<void> {
  await apiFetch<void>(`/api/decks/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function ingestDeckFiles(
  projectId: string,
  files: File[],
): Promise<Job> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return apiFetch<Job>(`/api/decks/${projectId}/ingest`, {
    method: "POST",
    body: form,
    headers: {}, // let browser set multipart boundary
  });
}

export async function renderDeck(
  projectId: string,
): Promise<{ preview_url: string }> {
  return apiFetch<{ preview_url: string }>(
    `/api/decks/${projectId}/render`,
    { method: "POST" },
  );
}

export async function exportDeckPdf(
  projectId: string,
): Promise<{ download_url: string }> {
  return apiFetch<{ download_url: string }>(
    `/api/decks/${projectId}/export/pdf`,
    { method: "POST" },
  );
}
