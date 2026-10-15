import { NextResponse, type NextRequest } from "next/server";

const GROUPS = [
  {
    cookie: "site_pin_a_v2",
    pin: "4455",
    paths: ["/who-shot-mr-burns", "/revision11"],
  },
] as const;

function groupForPath(pathname: string) {
  return GROUPS.find((g) => g.paths.some((p) => pathname === p || pathname.startsWith(p + "/")));
}

export function middleware(req: NextRequest) {
  const group = groupForPath(req.nextUrl.pathname);
  if (!group) return NextResponse.next();

  const pin = req.cookies.get(group.cookie)?.value;
  if (pin === group.pin) return noindex(NextResponse.next());

  const url = req.nextUrl.clone();
  const next = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/gate";
  url.search = `?next=${encodeURIComponent(next)}`;
  return noindex(NextResponse.rewrite(url));
}

// Keep PIN-protected pages (and the keypad shown in their place) out of search results.
function noindex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: [
    "/who-shot-mr-burns/:path*", "/who-shot-mr-burns",
    "/revision11/:path*", "/revision11",
  ],
};
