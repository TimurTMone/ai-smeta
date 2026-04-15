import type { Job } from "@/types/api";
import { apiFetch } from "./client";

export async function listJobs(): Promise<Job[]> {
  return apiFetch<Job[]>("/api/jobs");
}

export async function getJob(id: string): Promise<Job> {
  return apiFetch<Job>(`/api/jobs/${id}`);
}
