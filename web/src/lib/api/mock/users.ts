import type { User } from "@/types/api";
import usersFixture from "./fixtures/users.json";
import { delay, loadCollection } from "./storage";

export async function listUsers(): Promise<User[]> {
  await delay();
  return loadCollection<User>("users", usersFixture as User[]);
}
