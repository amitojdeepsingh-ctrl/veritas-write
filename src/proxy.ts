import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const protectedPaths = ["/dashboard", "/plagiarism", "/citations"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  if (!req.auth && protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/plagiarism/:path*", "/citations/:path*"],
}
