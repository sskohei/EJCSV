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

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return NextResponse.json(
      { detail: "Failed to reach the backend." },
      { status: 502 },
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
