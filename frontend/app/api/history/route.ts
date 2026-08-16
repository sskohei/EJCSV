import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "./_utils";

export async function GET() {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) {
      return NextResponse.json(
        { detail: "Authentication required." },
        { status: 401 },
      );
    }

    const { data, error } = await auth.client
      .from("search_histories")
      .select("id, input_text, result_count, created_at")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/history] failed to list search histories:", error);
      return NextResponse.json(
        { detail: "Failed to fetch search histories." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      histories: data ?? [],
      count: data?.length ?? 0,
    });
  } catch (error) {
    console.error("[api/history] unexpected error:", error);
    return NextResponse.json(
      { detail: "Failed to fetch search histories." },
      { status: 500 },
    );
  }
}
