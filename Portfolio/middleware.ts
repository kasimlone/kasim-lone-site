import { NextResponse, type NextRequest } from "next/server";

const PIN_COOKIE = "site_pin";
const PIN_VALUE = "7584";

export function middleware(req: NextRequest) {
  const pin = req.cookies.get(PIN_COOKIE)?.value;
  if (pin === PIN_VALUE) return NextResponse.next();

  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/gate";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/who-shot-mr-burns/:path*", "/who-shot-mr-burns",
    "/revision11/:path*", "/revision11",
    "/data-representation/:path*", "/data-representation",
  ],
};
