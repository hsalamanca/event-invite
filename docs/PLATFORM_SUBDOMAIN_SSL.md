# Platform subdomain SSL (`*.ownvite.com` / `*.ownvite.app`)

## Symptom
Browsers show **Not secure** (or fail TLS) on URLs like `https://my-party.ownvite.com`, while `https://ownvite.com/e/my-party` works.

## Cause
Vercel has `*.ownvite.com` and `*.ownvite.app` on the project, and Namecheap has a `*` CNAME → `cname.vercel-dns.com`.

Traffic reaches Vercel, but **wildcard TLS certificates require DNS-01**, which Vercel can only complete when the domain uses **Vercel nameservers** (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`).

Today nameservers are still at Namecheap (`dns1.registrar-servers.com`), so Vercel only issues certs for **individually added** hostnames (HTTP-01), e.g. `h-birthday-2026.ownvite.com`.

## Fix options

### A) Recommended — switch nameservers to Vercel (true wildcard SSL)

At Namecheap (Domain List → Manage → Nameservers → Custom DNS):

| Nameserver |
|------------|
| `ns1.vercel-dns.com` |
| `ns2.vercel-dns.com` |

Do this for **both** `ownvite.com` and `ownvite.app`.

Before switching, copy any email/SPF/MX records into Vercel DNS (Domains → ownvite.com → DNS Records), or email will break.

After propagation, Vercel issues `*.ownvite.com` / `*.ownvite.app` certs automatically.

### B) Workaround without NS change — `_acme-challenge` NS delegation

At Namecheap DNS for `ownvite.com` (and `.app`):

1. **Remove** any `CNAME` on `_acme-challenge` (a CNAME here blocks wildcard issuance).
2. Add:

| Type | Host | Value |
|------|------|-------|
| NS | `_acme-challenge` | `ns1.vercel-dns.com` |
| NS | `_acme-challenge` | `ns2.vercel-dns.com` |
| CNAME | `*` | `cname.vercel-dns.com` |

### C) App workaround (shipped) — auto-add each slug

Ownvite now calls the Vercel Domains API to register:

- `{slug}.ownvite.app`
- `{slug}.ownvite.com`

…when an event is created, duplicated, or opened in Host studio. Each host then gets its own Let's Encrypt cert in ~1 minute.

Admin backfill:

```http
POST /api/domains/ensure-platform
{ "all": true }
```

(Requires admin session.)

## Verify

```bash
openssl s_client -connect YOUR-SLUG.ownvite.com:443 -servername YOUR-SLUG.ownvite.com </dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
```

You should see `DNS:YOUR-SLUG.ownvite.com` (or a wildcard `DNS:*.ownvite.com` after option A).
