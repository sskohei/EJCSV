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
    response = await fetch(`${baseUrl}/api/export/csv`, {
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

  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}
