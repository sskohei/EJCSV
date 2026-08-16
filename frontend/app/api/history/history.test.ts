import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { GET as listHistories } from "./route";
import { DELETE as deleteHistory, GET as getHistory } from "./[id]/route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const getUserMock = vi.fn();
const selectMock = vi.fn();
const selectEqFirstMock = vi.fn();
const selectEqSecondMock = vi.fn();
const orderMock = vi.fn();
const maybeSingleMock = vi.fn();
const deleteMock = vi.fn();
const deleteEqFirstMock = vi.fn();
const deleteEqSecondMock = vi.fn();
const fromMock = vi.fn();

const listQuery = {
  eq: selectEqFirstMock,
  order: orderMock,
};
const detailQuery = { eq: selectEqSecondMock, order: orderMock };
const deleteQuery = { eq: deleteEqFirstMock };

const history = {
  id: "history-a",
  input_text: "run, give up",
  normalized_words: ["run", "give up"],
  results: [],
  result_count: 2,
  created_at: "2026-08-16T00:00:00.000Z",
};

function context(id = history.id) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  getUserMock.mockReset();
  selectMock.mockReset();
  selectEqFirstMock.mockReset();
  selectEqSecondMock.mockReset();
  orderMock.mockReset();
  maybeSingleMock.mockReset();
  deleteMock.mockReset();
  deleteEqFirstMock.mockReset();
  deleteEqSecondMock.mockReset();
  fromMock.mockReset();
  createClientMock.mockReset();

  createClientMock.mockResolvedValue({
    auth: { getUser: getUserMock },
    from: fromMock,
  } as never);
  fromMock.mockReturnValue({ select: selectMock, delete: deleteMock });
  selectMock.mockReturnValue(listQuery);
  selectEqFirstMock.mockReturnValue(detailQuery);
  selectEqSecondMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  deleteMock.mockReturnValue(deleteQuery);
  deleteEqFirstMock.mockReturnValue({ eq: deleteEqSecondMock });
});

describe("GET /api/history", () => {
  it("returns 401 when the user is not authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await listHistories();

    expect(response.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's histories in descending order", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    orderMock.mockResolvedValue({ data: [history], error: null });

    const response = await listHistories();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      histories: [history],
      count: 1,
    });
    expect(fromMock).toHaveBeenCalledWith("search_histories");
    expect(selectMock).toHaveBeenCalledWith(
      "id, input_text, result_count, created_at",
    );
    expect(selectEqFirstMock).toHaveBeenCalledWith("user_id", "user-a");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("GET /api/history/:id", () => {
  it("returns 401 when the user is not authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await getHistory(
      new Request("http://localhost"),
      context(),
    );

    expect(response.status).toBe(401);
  });

  it("returns a history detail for the owner only", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    maybeSingleMock.mockResolvedValue({ data: history, error: null });

    const response = await getHistory(
      new Request("http://localhost"),
      context(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(history);
    expect(selectEqFirstMock).toHaveBeenCalledWith("id", history.id);
    expect(selectEqSecondMock).toHaveBeenCalledWith("user_id", "user-a");
  });

  it("returns 404 without exposing another user's history", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const response = await getHistory(
      new Request("http://localhost"),
      context("history-owned-by-user-b"),
    );

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/history/:id", () => {
  it("returns 401 when the user is not authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await deleteHistory(
      new Request("http://localhost", { method: "DELETE" }),
      context(),
    );

    expect(response.status).toBe(401);
  });

  it("deletes only the authenticated user's history", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    deleteEqSecondMock.mockResolvedValue({ error: null });

    const response = await deleteHistory(
      new Request("http://localhost", { method: "DELETE" }),
      context(),
    );

    expect(response.status).toBe(204);
    expect(deleteEqFirstMock).toHaveBeenCalledWith("id", history.id);
    expect(deleteEqSecondMock).toHaveBeenCalledWith("user_id", "user-a");
  });
});
