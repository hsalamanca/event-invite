export type DomainStatus =
  | "pending_dns"
  | "verifying"
  | "active"
  | "error"
  | "removed";

export type DnsRecordInstruction = {
  type: "A" | "CNAME" | "TXT";
  host: string;
  value: string;
  note?: string;
};

export type DomainBinding = {
  domain: string;
  slug: string;
  eventId: string;
  status: DomainStatus;
  connectedAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
  vercelVerified?: boolean;
  error?: string | null;
  dns: DnsRecordInstruction[];
};

export type DomainRegistry = {
  version: 1;
  updatedAt: string;
  bindings: DomainBinding[];
};
