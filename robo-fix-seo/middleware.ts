import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PASS_PAGE = /^\/track\/\d{6}$/;

export function middleware(req: NextRequest) {
  const { pathname, search } = new URL(req.url);

  // طبّق فقط على /track/123456 (6 أرقام)
  if (!PASS_PAGE.test(pathname)) return NextResponse.next();

  // لو عنده Cookie نجاح التحدّي => مرّره
  const ok = req.cookies.get("tsok")?.value === "1";
  if (ok) return NextResponse.next();

  // رجّعه لصفحة الإدخال مع need=1 ليظهر تنبيه/التحدّي
  const url = new URL("/track", req.url);
  url.searchParams.set("need", "1");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/track/:path*"],
};
