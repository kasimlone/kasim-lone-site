import { NextResponse, type NextRequest } from "next/server";

const GROUPS = [
  {
    cookie: "site_pin_a_v2",
    pin: "4455",
    paths: ["/who-shot-mr-burns", "/revision11"],
  },
  {
    cookie: "site_pin_b_v2",
    pin: "7584",
    paths: ["/data-representation"],
  },
] as const;

function groupForPath(pathname: string) {
  return GROUPS.find((g) => g.paths.some((p) => pathname === p || pathname.startsWith(p + "/")));
}

export function middleware(req: NextRequest) {
  const group = groupForPath(req.nextUrl.pathname);
  if (!group) return NextResponse.next();

  const pin = req.cookies.get(group.cookie)?.value;
  if (pin === group.pin) return NextResponse.next();

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
