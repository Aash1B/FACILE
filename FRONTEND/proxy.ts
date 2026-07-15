import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  // Authentication is temporarily optional. Keep this proxy in place so route
  // protection can be restored later without changing the page structure.
  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [],
};
