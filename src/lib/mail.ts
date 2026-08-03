/**
 * Low-level transactional email (auth, receipts).
 * Uses Resend when RESEND_API_KEY is set; otherwise returns preview status.
 */
export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ status: "sent" | "preview" | "failed"; error?: string }> {
  const key = process.env.RESEND_API_KEY || process.env.RESEND_API_Key;
  const from =
    process.env.EMAIL_FROM ||
    process.env.EMAIL_FROM_ADDRESS ||
    "Ownvite <invites@ownvite.app>";

  if (!key) {
    console.info("[mail:preview]", input.to, input.subject, input.body);
    return { status: "preview" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.body,
      }),
    });
    if (!res.ok) {
      return { status: "failed", error: (await res.text()).slice(0, 300) };
    }
    return { status: "sent" };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

export function appBaseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN) {
    return `https://${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN}`;
  }
  return "https://ownvite.com";
}
