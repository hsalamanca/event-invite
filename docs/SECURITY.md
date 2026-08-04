# Ownvite security checklist

Practical hardening for `ownvite.app` / `ownvite.com` on Vercel. DNSSEC helps a little; the items below matter more day to day.

---

## 1. Already in the app

| Control | Where |
|--------|--------|
| HTTPS / TLS | Vercel (apex + `*.ownvite.app` + custom domains) |
| Security headers (HSTS, CSP, frame deny, nosniff, Referrer-Policy, Permissions-Policy) | `next.config.ts` |
| Rate limits on RSVP, waitlist, messages, register, password reset, unlock, remind, upload, create-event | `src/middleware.ts` + `src/lib/rate-limit.ts` |
| Password hashing (bcrypt) | Auth + private invite unlock |
| Private password invites | Event `visibility` + unlock cookie |
| Secrets in Vercel env (not in git) | Project → Settings → Environment Variables |

---

## 2. Domain / DNS (do in your registrar + DNS)

Apply for **both** `ownvite.app` and `ownvite.com` if both are live.

### Registrar hygiene (highest leverage)

- [ ] Turn on **registrar account 2FA**
- [ ] Enable **domain lock** / transfer lock
- [ ] Use a recovery email you control; keep WHOIS/contact email current
- [ ] Prefer nameservers at **Vercel** for domains that terminate TLS there (already true for Ownvite)

### CAA (Certificate Authority Authorization)

Limits which CAs may issue certificates for your domain. Vercel/Let’s Encrypt need to be allowed.

At your DNS provider (or Vercel DNS), add CAA records similar to:

```
ownvite.app.   CAA 0 issue "letsencrypt.org"
ownvite.app.   CAA 0 issuewild "letsencrypt.org"
ownvite.app.   CAA 0 iodef "mailto:you@your-email.com"
```

Repeat for `ownvite.com`.  
If Vercel documents an additional CA tag for your account, add that `issue` / `issuewild` value too. After saving, wait for DNS propagation and confirm HTTPS still renews.

### DNSSEC (optional)

- [ ] Enable **DNSSEC** at the registrar if Vercel DNS / your DNS host supports signing for the zone
- [ ] Confirm DS records are published at the registrar after enabling
- [ ] Re-check invite URLs and SSL after enablement

DNSSEC reduces DNS spoofing risk. It does **not** replace app auth, rate limits, or secret hygiene.

### Email authentication (Resend)

So host notification / invite mail is harder to spoof:

- [ ] Domain verified in Resend for the From domain (e.g. `ownvite.app`)
- [ ] **SPF** published as Resend instructs
- [ ] **DKIM** CNAMEs added
- [ ] **DMARC** TXT, start with monitor mode, e.g.  
  `v=DMARC1; p=none; rua=mailto:you@your-email.com`  
  Later tighten to `p=quarantine` / `p=reject` once mail looks clean

`EMAIL_FROM` should use that verified domain (e.g. `Ownvite <invites@ownvite.app>`).

---

## 3. Vercel / secrets

- [ ] `AUTH_SECRET`, `AUTH_GOOGLE_*`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`, Stripe keys — Production + Preview as needed
- [ ] Exact env names (case-sensitive), e.g. `RESEND_API_KEY`
- [ ] Redeploy after changing secrets
- [ ] Rotate any secret that may have been pasted into chat, screenshots, or client devices
- [ ] Keep `ADMIN_EMAILS` short (owner + support only)

---

## 4. Product habits

- Use **private / password** invites for sensitive guest lists
- Prefer co-hosts over sharing the owner login
- Review guest list and outbound messages after large blasts
- Delete test RSVPs from Host → Guests → Remove

---

## 5. Later upgrades (when traffic grows)

1. **Distributed rate limits** (Upstash Redis / Vercel KV) — current limiter is per-instance memory
2. Stricter **CSP nonces** (drop `unsafe-inline` / `unsafe-eval` where possible)
3. Vercel **Attack Challenge** / bot protection on auth + RSVP paths
4. Audit log for host deletes, domain changes, admin actions
5. Periodic export/backup of events + RSVPs from Blob

---

## 6. Quick verify after deploy

```bash
curl -sI https://ownvite.app | rg -i "strict-transport|content-security|x-frame|x-content-type|referrer-policy"
```

You should see HSTS, CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and Referrer-Policy.
