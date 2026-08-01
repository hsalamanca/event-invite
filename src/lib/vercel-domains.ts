type VercelDomainConfig = {
  name: string;
  verified: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
  configuredBy?: string | null;
  error?: { code: string; message: string } | null;
};

function teamQuery() {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

function projectId() {
  return process.env.VERCEL_PROJECT_ID ?? "";
}

function token() {
  return process.env.VERCEL_TOKEN ?? "";
}

export function vercelDomainsConfigured(): boolean {
  return Boolean(token() && projectId());
}

async function vercelFetch(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

/** Add a custom hostname to the Ownvite Vercel project. */
export async function addDomainToProject(
  domain: string
): Promise<{ ok: boolean; domain?: VercelDomainConfig; error?: string }> {
  if (!vercelDomainsConfigured()) {
    return {
      ok: false,
      error:
        "Vercel domain API is not configured (missing VERCEL_TOKEN / VERCEL_PROJECT_ID).",
    };
  }

  const { res, body } = await vercelFetch(
    `/v10/projects/${projectId()}/domains${teamQuery()}`,
    {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    }
  );

  if (res.status === 409 || body?.error?.code === "domain_already_in_use") {
    // Already on this or another project — try to read current config
    const existing = await getProjectDomain(domain);
    if (existing) return { ok: true, domain: existing };
  }

  if (!res.ok) {
    return {
      ok: false,
      error:
        body?.error?.message ??
        body?.message ??
        `Failed to add domain (${res.status})`,
    };
  }

  return { ok: true, domain: body as VercelDomainConfig };
}

export async function getProjectDomain(
  domain: string
): Promise<VercelDomainConfig | null> {
  if (!vercelDomainsConfigured()) return null;
  const { res, body } = await vercelFetch(
    `/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`
  );
  if (!res.ok) return null;
  return body as VercelDomainConfig;
}

export async function removeDomainFromProject(
  domain: string
): Promise<{ ok: boolean; error?: string }> {
  if (!vercelDomainsConfigured()) {
    return { ok: false, error: "Vercel domain API is not configured." };
  }
  const { res, body } = await vercelFetch(
    `/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}${teamQuery()}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 404) {
    return {
      ok: false,
      error: body?.error?.message ?? `Failed to remove domain (${res.status})`,
    };
  }
  return { ok: true };
}

export async function verifyProjectDomain(domain: string): Promise<{
  ok: boolean;
  verified: boolean;
  domain?: VercelDomainConfig;
  error?: string;
}> {
  if (!vercelDomainsConfigured()) {
    return {
      ok: false,
      verified: false,
      error: "Vercel domain API is not configured.",
    };
  }

  // Trigger verification refresh
  const { res, body } = await vercelFetch(
    `/v9/projects/${projectId()}/domains/${encodeURIComponent(domain)}/verify${teamQuery()}`,
    { method: "POST" }
  );

  if (!res.ok) {
    // Fall back to GET config
    const current = await getProjectDomain(domain);
    if (current) {
      return { ok: true, verified: Boolean(current.verified), domain: current };
    }
    return {
      ok: false,
      verified: false,
      error: body?.error?.message ?? `Verify failed (${res.status})`,
    };
  }

  return {
    ok: true,
    verified: Boolean(body?.verified),
    domain: body as VercelDomainConfig,
  };
}
