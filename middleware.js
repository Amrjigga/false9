import { NextResponse } from "next/server";

const USERNAME = "false9";
const PASSWORD = process.env.DASHBOARD_PASSWORD;

function unauthorized() {
  return new NextResponse("Dashboard access required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="false9 dashboard"'
    }
  });
}

function isAuthorized(request) {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Basic ")) {
    return false;
  }

  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    return Boolean(PASSWORD) && username === USERNAME && password === PASSWORD;
  } catch {
    return false;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const protectsDashboard = pathname.startsWith("/dashboard");
  const protectsOrdersApi = pathname.startsWith("/api/orders") && request.method !== "POST";

  if ((protectsDashboard || protectsOrdersApi) && !isAuthorized(request)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/orders/:path*"]
};
