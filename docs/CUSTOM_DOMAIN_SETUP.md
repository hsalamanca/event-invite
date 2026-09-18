# How hosts connect a custom domain to Ownvite

This is the customer-facing setup flow for **bring-your-own domain** invites.

## What guests experience

| URL style | Example | DNS needed? |
|-----------|---------|-------------|
| Path (always on) | `https://ownvite.com/e/h-birthday-2026` | No |
| Ownvite subdomain | `https://h-birthday-2026.ownvite.app` | Platform `*` CNAME |
| **Your domain** | `https://party.yourname.com` | Yes — you add records |

All three can serve the same event. Custom domains are the Pro differentiator.

## Host flow (in product)

1. Open **Host studio** → `/host/{slug}`
2. Under **Custom domain**, enter a hostname you control  
   Prefer a subdomain: `party.yourname.com`, `bday.yourname.com`, `rsvp.couple.com`
3. Click **Connect** — Ownvite:
   - Registers the hostname on our Vercel project (SSL edge)
   - Saves `domain → event slug` in the domain registry (Blob)
   - Shows exact DNS records to create
4. At your registrar, add the records
5. Click **Verify DNS** until status is **active**
6. Share `https://your-hostname`

Public guide: [`/domains`](https://ownvite.com/domains)

## DNS records Ownvite asks for

### Subdomain (recommended)

| Type | Host | Value |
|------|------|-------|
| CNAME | `party` (the subdomain label) | `cname.vercel-dns.com` |

### Apex / root (`yourname.com`)

| Type | Host | Value |
|------|------|-------|
| A | `@` | `216.150.1.1` |
| A | `@` | `216.150.16.1` |
| CNAME | `www` | `cname.vercel-dns.com` |

## What Ownvite does behind the scenes

1. **Vercel Domains API** — `POST /v10/projects/{id}/domains` so TLS + edge routing work for that hostname
2. **Domain registry** (Vercel Blob `ownvite/domains.json`) — maps hostname → event slug
3. **Middleware** — on request, if `Host` is a connected domain (or `{slug}.ownvite.app`), rewrite to `/e/{slug}`

## Platform DNS (Ownvite operators)

Already on Vercel project `ownvite`:

- `ownvite.com` / `www.ownvite.com` / `ownvite.app`
- Nameservers (both apex domains): `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- Wildcard hosts `*.ownvite.com` / `*.ownvite.app` with active wildcard TLS

**SSL:** nameservers are on Vercel DNS, so `*.ownvite.com` / `*.ownvite.app` certificates issue via DNS-01. See [`PLATFORM_SUBDOMAIN_SSL.md`](./PLATFORM_SUBDOMAIN_SSL.md).

Per-slug registration (`ensurePlatformSubdomains`) remains as a safety net when creating events.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Verify stays pending | Wait for DNS TTL; confirm no conflicting A/AAAA on that host; try `dig CNAME party.yourname.com` |
| SSL error | Domain must be added via Connect first; wait a few minutes after DNS is correct |
| Wrong invite | Check Host studio domain binding; ensure only one event owns that hostname |
| Apex won’t CNAME | Use A records above, or ALIAS/ANAME if your DNS host supports it |

## Related

- [`CUSTOM_DOMAINS.md`](./CUSTOM_DOMAINS.md) — deeper architecture
- Host UI: `src/components/host/DomainConnect.tsx`
- APIs: `POST/GET/DELETE /api/domains`, `POST /api/domains/verify`, `GET /api/domains/map`
