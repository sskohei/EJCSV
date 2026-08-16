import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const fetchMock = vi.fn();
const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
const getUserMock = vi.fn();

function request(text = " Run  , GIVE UP ") {
  return new NextRequest("http://localhost/api/lookup", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubEnv("FASTAPI_BASE_URL", "http://backend.test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  insertMock.mockReset();
  fromMock.mockClear();
  getUserMock.mockReset();
  createClientMock.mockReset();
  createClientMock.mockResolvedValue({
    auth: { getUser: getUserMock },
    from: fromMock,
  } as never);
});

const lookupResponse = {
  count: 2,
  results: [
    {
      word: "run",
      translation: "走る",
      example: null,
      sentence_id: null,
      translation_found: true,
      example_found: false,
    },
    {
      word: "give up",
      translation: "あきらめる",
      example: null,
      sentence_id: null,
      translation_found: true,
      example_found: false,
    },
  ],
};

describe("POST /api/lookup", () => {
  it("saves a successful authenticated lookup as search history", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(lookupResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(fromMock).toHaveBeenCalledWith("search_histories");
    expect(insertMock).toHaveBeenCalledWith({
      user_id: "user-a",
      input_text: " Run  , GIVE UP ",
      normalized_words: ["run", "give up"],
      results: lookupResponse.results,
      result_count: 2,
    });
  });

  it("does not save history for an unauthenticated lookup", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(lookupResponse), { status: 200 }),
    );

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns the lookup result when saving history fails", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    insertMock.mockRejectedValue(new Error("database unavailable"));
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(lookupResponse), { status: 200 }),
    );

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(lookupResponse);
  });

  it("does not save history when the backend lookup fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: "failed" }), { status: 500 }),
    );

    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
