import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Server-side proxy to the Brain control plane.
 *
 * Browser code calls /api/brain/<path>, and this route forwards it to
 * <BRAIN_URL>/api/<path>. The Brain API key never leaves the server, and the
 * X-User-Identity header comes from the verified Supabase session rather than
 * from anything the client sends, so one user cannot act as another.
 */

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";

export const dynamic = "force-dynamic";

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const apiKey = process.env.BRAIN_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "BRAIN_API_KEY is not configured on the server" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  if (!path?.length || path.some((seg) => seg === ".." || seg === "." || seg === "")) {
    return Response.json({ error: "Invalid path" }, { status: 400 });
  }

  const target = `${BRAIN_URL}/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  headers.set("X-API-Key", apiKey);
  headers.set("X-User-Identity", user.email || user.id);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    signal: request.signal,
    cache: "no-store",
  });

  // Stream the body straight through (log endpoints stream).
  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) resHeaders.set("Content-Type", upstreamType);
  resHeaders.set("Cache-Control", "no-store");

  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

export { forward as GET, forward as POST, forward as DELETE };
