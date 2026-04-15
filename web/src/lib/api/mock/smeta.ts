import type { Job, Project, Smeta, SmetaLineItem } from "@/types/api";
import { getProject, updateProject } from "./projects";
import exampleSmeta from "./fixtures/example-smeta.json";
import { delay, loadObject, saveObject, uuid } from "./storage";

function smetaKey(projectId: string): string {
  return `smeta:${projectId}`;
}

function getSmetaData(projectId: string): Smeta {
  const existing = loadObject<Smeta | null>(smetaKey(projectId), null);
  if (existing) return existing;
  return JSON.parse(JSON.stringify(exampleSmeta)) as Smeta;
}

export async function getSmeta(
  projectId: string,
): Promise<{ project: Project; data: Smeta }> {
  await delay();
  const project = await getProject(projectId);
  const data = getSmetaData(projectId);
  saveObject(smetaKey(projectId), data);
  return { project, data };
}

export async function generateSmeta(
  projectId: string,
  input: { text?: string; voice_url?: string },
): Promise<Job> {
  await delay(500);
  void input;
  const seed = JSON.parse(JSON.stringify(exampleSmeta)) as Smeta;
  saveObject(smetaKey(projectId), seed);
  await updateProject(projectId, { status: "ready" });
  return {
    id: "job_" + uuid().slice(0, 8),
    project_id: projectId,
    kind: "smeta_generate",
    status: "completed",
    progress: 100,
    error: null,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
}

function recomputeTotals(smeta: Smeta): Smeta {
  let grand = 0;
  for (const section of smeta.sections) {
    for (const item of section.items) {
      item.total = Math.round(item.qty * item.rate);
      grand += item.total;
    }
  }
  smeta.total = grand;
  return smeta;
}

export async function updateSmetaLine(
  projectId: string,
  lineId: string,
  patch: Partial<SmetaLineItem>,
): Promise<void> {
  await delay();
  const smeta = getSmetaData(projectId);
  for (const section of smeta.sections) {
    const idx = section.items.findIndex((l) => l.id === lineId);
    if (idx !== -1) {
      section.items[idx] = { ...section.items[idx], ...patch } as SmetaLineItem;
      recomputeTotals(smeta);
      saveObject(smetaKey(projectId), smeta);
      return;
    }
  }
  throw new Error(`Line item not found: ${lineId}`);
}

export async function exportSmetaXlsx(
  projectId: string,
): Promise<{ download_url: string }> {
  await delay();
  void projectId;
  return { download_url: "#stub-xlsx-download" };
}
