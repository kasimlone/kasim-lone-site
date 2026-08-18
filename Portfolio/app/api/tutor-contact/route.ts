import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const honeypot = typeof body.website === "string" ? body.website : "";
  if (honeypot.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const yearGroup = typeof body.yearGroup === "string" ? body.yearGroup.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
  }
  if (name.length > 120 || message.length > 4000 || yearGroup.length > 60) {
    return NextResponse.json({ ok: false, error: "too_long" }, { status: 400 });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const fields = [
    { name: "Name", value: name, inline: true },
    { name: "Email", value: email, inline: true },
  ];
  if (yearGroup) fields.push({ name: "Year / level", value: yearGroup, inline: true });
  fields.push({ name: "Message", value: message.slice(0, 1024), inline: false });

  const payload = {
    username: "kasim-lone.dev",
    embeds: [
      {
        title: "New tutoring enquiry",
        color: 0x82aaff,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
