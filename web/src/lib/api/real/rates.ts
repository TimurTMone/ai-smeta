import type { Rate } from "@/types/api";
import { apiFetch } from "./client";

export async function listRates(filter?: {
  region?: string;
}): Promise<Rate[]> {
  const qs = filter?.region ? `?region=${encodeURIComponent(filter.region)}` : "";
  return apiFetch<Rate[]>(`/api/rates${qs}`);
}
