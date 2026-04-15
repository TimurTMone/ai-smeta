import type { DeckData, Job, Project } from "@/types/api";
import { getProject, updateProject } from "./projects";
import karakolDeck from "./fixtures/karakol-deck.json";
import { delay, loadObject, saveObject, uuid } from "./storage";

function deckKey(projectId: string): string {
  return `deck:${projectId}`;
}

function getDeckData(projectId: string): DeckData {
  // Seed with Karakol deck on first access for the Karakol project.
  // New projects start with a clone of Karakol as a template.
  const existing = loadObject<DeckData | null>(deckKey(projectId), null);
  if (existing) return existing;
  const seed = karakolDeck as unknown as DeckData;
  // Shallow clone to avoid mutating the fixture
  return JSON.parse(JSON.stringify(seed));
}

export async function getDeck(
  projectId: string,
): Promise<{ project: Project; data: DeckData }> {
  await delay();
  const project = await getProject(projectId);
  const data = getDeckData(projectId);
  // Persist seed on first read
  saveObject(deckKey(projectId), data);
  return { project, data };
}

export async function updateDeck(
  projectId: string,
  data: DeckData,
): Promise<void> {
  await delay();
  saveObject(deckKey(projectId), data);
  await updateProject(projectId, { status: "ready" });
}

export async function ingestDeckFiles(
  projectId: string,
  files: File[],
): Promise<Job> {
  await delay(500);
  // Simulate an ingest job — just pretend to process, then resolve with the
  // Karakol deck seeded in on completion.
  const job: Job = {
    id: "job_" + uuid().slice(0, 8),
    project_id: projectId,
    kind: "deck_ingest",
    status: "completed",
    progress: 100,
    error: null,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
  // Seed deck from Karakol template (the "ingested" result in mock mode)
  const seed = JSON.parse(JSON.stringify(karakolDeck)) as DeckData;
  saveObject(deckKey(projectId), seed);
  await updateProject(projectId, { status: "ready" });
  void files;
  return job;
}

export async function renderDeck(
  projectId: string,
): Promise<{ preview_url: string }> {
  await delay(600);
  // In mock mode, every deck preview points at the pre-rendered Karakol HTML
  // under /demo-deck/. When the backend teammate implements this, it will
  // POST JSON to the Python renderer and return a unique URL per project.
  void projectId;
  return { preview_url: "/demo-deck/presentation.html" };
}

export async function exportDeckPdf(
  projectId: string,
): Promise<{ download_url: string }> {
  await delay(400);
  void projectId;
  return { download_url: "/demo-deck/presentation.html" };
}
