import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "../_utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) {
      return NextResponse.json(
        { detail: "Authentication required." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const { data, error } = await auth.client
      .from("search_histories")
      .select(
        "id, input_text, normalized_words, results, result_count, created_at",
      )
      .eq("id", id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (error) {
      console.error("[api/history/:id] failed to fetch search history:", error);
      return NextResponse.json(
        { detail: "Failed to fetch search history." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { detail: "Search history not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/history/:id] unexpected error:", error);
    return NextResponse.json(
      { detail: "Failed to fetch search history." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthenticatedClient();
    if (!auth) {
      return NextResponse.json(
        { detail: "Authentication required." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const { error } = await auth.client
      .from("search_histories")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.userId);

    if (error) {
      console.error(
        "[api/history/:id] failed to delete search history:",
        error,
      );
      return NextResponse.json(
        { detail: "Failed to delete search history." },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[api/history/:id] unexpected error:", error);
    return NextResponse.json(
      { detail: "Failed to delete search history." },
      { status: 500 },
    );
  }
}
