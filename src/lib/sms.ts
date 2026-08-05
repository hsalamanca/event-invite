/**
 * Twilio SMS / WhatsApp sends.
 * Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 * Optional WhatsApp: TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)
 */

export type SmsChannel = "sms" | "whatsapp";

export async function sendSmsMessage(input: {
  to: string;
  body: string;
  channel?: SmsChannel;
}): Promise<{ status: "sent" | "preview" | "failed"; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const channel = input.channel ?? "sms";
  const from =
    channel === "whatsapp"
      ? process.env.TWILIO_WHATSAPP_FROM ||
        (process.env.TWILIO_FROM_NUMBER
          ? `whatsapp:${process.env.TWILIO_FROM_NUMBER.replace(/^whatsapp:/, "")}`
          : "")
      : process.env.TWILIO_FROM_NUMBER || "";

  const to = normalizeDestination(input.to, channel);

  if (!sid || !token || !from) {
    console.info("[sms:preview]", channel, to, input.body);
    return { status: "preview" };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({
      To: to,
      From: from,
      Body: input.body.slice(0, 1500),
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
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

function normalizeDestination(raw: string, channel: SmsChannel): string {
  let n = raw.trim();
  if (channel === "whatsapp") {
    n = n.replace(/^whatsapp:/i, "");
    if (!n.startsWith("+")) n = `+${n.replace(/\D/g, "")}`;
    return `whatsapp:${n}`;
  }
  if (!n.startsWith("+")) n = `+${n.replace(/\D/g, "")}`;
  return n;
}

/** Public WhatsApp share link (no API required). */
export function whatsAppShareUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
