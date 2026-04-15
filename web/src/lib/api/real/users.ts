import type { User } from "@/types/api";
import { apiFetch } from "./client";

export async function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/users");
}
