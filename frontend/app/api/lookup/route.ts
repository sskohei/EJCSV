import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const baseUrl = process.env.FASTAPI_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { detail: "FASTAPI_BASE_URL is not configured." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const targetUrl = `${baseUrl}/api/lookup`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (error) {
    console.error(`[api/lookup] failed to reach ${targetUrl}:`, error);
    return NextResponse.json(
      { detail: "Failed to reach the backend." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error(
      `[api/lookup] backend responded with ${response.status} for ${targetUrl}`,
    );
  }

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
