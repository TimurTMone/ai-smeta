import type { Rate } from "@/types/api";
import ratesFixture from "./fixtures/rates.json";
import { delay, loadCollection } from "./storage";

export async function listRates(filter?: {
  region?: string;
}): Promise<Rate[]> {
  await delay();
  const all = loadCollection<Rate>("rates", ratesFixture as Rate[]);
  if (filter?.region) {
    return all.filter((r) => r.region === filter.region);
  }
  return all;
}
