# Platform subdomain SSL (`*.ownvite.com` / `*.ownvite.app`)

## Current status (verified)

Both apex domains use **Vercel nameservers**, and wildcard TLS is active:

| Domain | Nameservers | Wildcard cert |
|--------|-------------|---------------|
| `ownvite.com` | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | `CN=*.ownvite.com` |
| `ownvite.app` | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` | `CN=*.ownvite.app` |

Any `{slug}.ownvite.com` / `{slug}.ownvite.app` gets a valid cert without registering each host individually.

Email forwarding MX/SPF for `ownvite.com` still points at Namecheap eForward (`eforward*.registrar-servers.com`) — keep those records in **Vercel DNS** if you change DNS again.

## History (why this mattered)

Wildcard TLS needs DNS-01. With only a registrar `*` CNAME → `cname.vercel-dns.com`, traffic reached Vercel but certs were **per-host** (HTTP-01). Switching nameservers to Vercel unlocked true `*.domain` certificates.

## Optional: per-slug registration

`ensurePlatformSubdomains(slug)` still registers `{slug}.ownvite.app` + `{slug}.ownvite.com` on the Vercel project when events are created. That is now **belt-and-suspenders** (routing / project domain list), not required for SSL.

Admin backfill:

```http
POST /api/domains/ensure-platform
{ "all": true }
```

(Requires admin session.)

## Verify

```bash
dig NS ownvite.com +short
# expect: ns1.vercel-dns.com. / ns2.vercel-dns.com.

openssl s_client -connect YOUR-SLUG.ownvite.com:443 -servername YOUR-SLUG.ownvite.com </dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
# expect: DNS:*.ownvite.com (or the specific host)
```

## Rollback / emergency

If you must move DNS off Vercel NS, wildcard SSL will stop for new hosts. Either:

1. Keep nameservers on Vercel (preferred), or
2. At the registrar, add `_acme-challenge` NS delegation to `ns1/ns2.vercel-dns.com` plus `CNAME * → cname.vercel-dns.com`, or
3. Rely on per-slug `ensurePlatformSubdomains` HTTP-01 certs again.
