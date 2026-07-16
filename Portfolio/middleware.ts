import { NextRequest, NextResponse } from "next/server";
import { UNLOCK_COOKIE, isProtectedPath, unlockToken } from "@/lib/unlock";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return new NextResponse("SITE_PASSWORD not configured", { status: 500 });
  }

  const cookie = req.cookies.get(UNLOCK_COOKIE)?.value;
  const expected = await unlockToken(password);
  if (cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/revision11",
    "/revision11/:path*",
    "/who-shot-mr-burns",
    "/who-shot-mr-burns/:path*",
  ],
};
