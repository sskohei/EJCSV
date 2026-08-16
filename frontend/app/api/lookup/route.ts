import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type LookupData = {
  results: Array<{ word: string; [key: string]: unknown }>;
  count: number;
};

async function saveSearchHistory(body: string, data: LookupData) {
  if (!isSupabaseConfigured()) return;

  let inputText: unknown;
  try {
    inputText = JSON.parse(body).text;
  } catch {
    return;
  }

  if (typeof inputText !== "string") return;

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return;

    const { error: insertError } = await supabase
      .from("search_histories")
      .insert({
        user_id: userData.user.id,
        input_text: inputText,
        normalized_words: data.results.map((result) => result.word),
        results: data.results,
        result_count: data.count,
      });

    if (insertError) {
      console.error("[api/lookup] failed to save search history:", insertError);
    }
  } catch (error) {
    console.error("[api/lookup] failed to save search history:", error);
  }
}

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

  if (response.ok) {
    try {
      const lookupData = JSON.parse(data) as LookupData;
      if (
        Array.isArray(lookupData.results) &&
        typeof lookupData.count === "number"
      ) {
        await saveSearchHistory(body, lookupData);
      }
    } catch (error) {
      console.error("[api/lookup] failed to parse lookup response:", error);
    }
  }

  return new NextResponse(data, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
