import type { Job } from "@/types/api";
import jobsFixture from "./fixtures/jobs.json";
import { delay, loadCollection } from "./storage";

export async function listJobs(): Promise<Job[]> {
  await delay();
  return loadCollection<Job>("jobs", jobsFixture as Job[]);
}

export async function getJob(id: string): Promise<Job> {
  await delay();
  const jobs = loadCollection<Job>("jobs", jobsFixture as Job[]);
  const job = jobs.find((j) => j.id === id);
  if (!job) throw new Error(`Job not found: ${id}`);
  return job;
}
