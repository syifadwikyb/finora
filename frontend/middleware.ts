import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static files, API, favicon, assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Halaman publik yang tidak memerlukan verifikasi PIN
  const publicPaths = ["/login", "/register", "/enter-pin"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const pinVerified = request.cookies.get("finora_pin_verified")?.value;

  // Jika mencoba mengakses halaman berproteksi dan belum verifikasi PIN: redirect ke /enter-pin
  if (!isPublic && pinVerified !== "true") {
    const enterPinUrl = new URL("/enter-pin", request.url);
    enterPinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(enterPinUrl);
  }

  // Jika sudah terverifikasi PIN dan membuka /enter-pin, arahkan ke /
  if (pathname === "/enter-pin" && pinVerified === "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
