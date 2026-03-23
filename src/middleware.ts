import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Remove X-Frame-Options to allow iframe embedding
  response.headers.delete("X-Frame-Options");

  // Allow iframe embedding only on our Squarespace domain
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://www.humansundermanagement.com https://humansundermanagement.com"
  );

  return response;
}

export const config = {
  matcher: ["/search", "/search/:path*"],
};
