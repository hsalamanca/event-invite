import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { UserRecord } from "./types";

const PATH = "ownvite/users.json";

type UserRegistry = { version: 1; users: UserRecord[] };

function normalizeUser(raw: UserRecord): UserRecord {
  return {
    ...raw,
    emailVerifiedAt: raw.emailVerifiedAt ?? null,
    verifyToken: raw.verifyToken ?? null,
    verifyTokenExpires: raw.verifyTokenExpires ?? null,
    resetToken: raw.resetToken ?? null,
    resetTokenExpires: raw.resetTokenExpires ?? null,
    passwordHash: raw.passwordHash ?? "",
  };
}

async function load(): Promise<UserRegistry> {
  const registry = await readJsonBlob<UserRegistry>(PATH, {
    version: 1,
    users: [],
  });
  registry.users = registry.users.map(normalizeUser);
  return registry;
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

export async function listUsers(): Promise<
  Omit<UserRecord, "passwordHash" | "verifyToken" | "resetToken">[]
> {
  const registry = await load();
  return registry.users
    .map(
      ({
        passwordHash: _pw,
        verifyToken: _v,
        resetToken: _r,
        ...safe
      }) => safe,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  emailVerifiedAt?: string | null;
  verifyToken?: string | null;
  verifyTokenExpires?: string | null;
}): Promise<UserRecord> {
  const registry = await load();
  const email = input.email.trim().toLowerCase();
  if (registry.users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists");
  }
  const user: UserRecord = normalizeUser({
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    email,
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    emailVerifiedAt: input.emailVerifiedAt ?? null,
    verifyToken: input.verifyToken ?? null,
    verifyTokenExpires: input.verifyTokenExpires ?? null,
    createdAt: new Date().toISOString(),
  });
  registry.users.push(user);
  await save(registry);
  return user;
}

export async function updateUser(
  id: string,
  partial: Partial<UserRecord>,
): Promise<UserRecord | undefined> {
  const registry = await load();
  const idx = registry.users.findIndex((u) => u.id === id);
  if (idx < 0) return undefined;
  const updated = normalizeUser({ ...registry.users[idx]!, ...partial, id });
  registry.users[idx] = updated;
  await save(registry);
  return updated;
}

export async function findUserByVerifyToken(
  token: string,
): Promise<UserRecord | undefined> {
  const registry = await load();
  const now = Date.now();
  return registry.users.find(
    (u) =>
      u.verifyToken === token &&
      u.verifyTokenExpires &&
      new Date(u.verifyTokenExpires).getTime() > now,
  );
}

export async function findUserByResetToken(
  token: string,
): Promise<UserRecord | undefined> {
  const registry = await load();
  const now = Date.now();
  return registry.users.find(
    (u) =>
      u.resetToken === token &&
      u.resetTokenExpires &&
      new Date(u.resetTokenExpires).getTime() > now,
  );
}

export async function upsertOAuthUser(input: {
  email: string;
  name: string;
}): Promise<UserRecord> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    if (!existing.emailVerifiedAt) {
      return (
        (await updateUser(existing.id, {
          emailVerifiedAt: new Date().toISOString(),
          verifyToken: null,
          verifyTokenExpires: null,
          name: existing.name || input.name,
        })) ?? existing
      );
    }
    return existing;
  }
  return createUser({
    email: input.email,
    name: input.name || input.email.split("@")[0] || "Host",
    passwordHash: "",
    emailVerifiedAt: new Date().toISOString(),
  });
}
