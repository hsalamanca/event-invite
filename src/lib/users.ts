import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { UserRecord } from "./types";

const PATH = "ownvite/users.json";

type UserRegistry = { version: 1; users: UserRecord[] };

async function load(): Promise<UserRegistry> {
  return readJsonBlob<UserRegistry>(PATH, { version: 1, users: [] });
}

async function save(registry: UserRegistry) {
  await writeJsonBlob(PATH, registry);
}

export async function findUserByEmail(
  email: string
): Promise<UserRecord | undefined> {
  const registry = await load();
  return registry.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
}

export async function findUserById(
  id: string
): Promise<UserRecord | undefined> {
  const registry = await load();
  return registry.users.find((u) => u.id === id);
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const registry = await load();
  const email = input.email.trim().toLowerCase();
  if (registry.users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }
  const user: UserRecord = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  };
  registry.users.push(user);
  await save(registry);
  return user;
}
