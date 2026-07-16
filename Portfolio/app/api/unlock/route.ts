import { NextRequest, NextResponse } from "next/server";
import { UNLOCK_COOKIE, isProtectedPath, unlockToken } from "@/lib/unlock";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const nextRaw = typeof body?.next === "string" ? body.next : "/";
  const next = nextRaw.startsWith("/") && isProtectedPath(nextRaw) ? nextRaw : "/";

  const site = process.env.SITE_PASSWORD;
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "not_configured" },
      { status: 500 },
    );
  }
  if (password !== site) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 401 });
  }

  const token = await unlockToken(site);
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set(UNLOCK_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
