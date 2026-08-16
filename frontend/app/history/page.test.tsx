import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryPage from "./page";
import {
  deleteSearchHistory,
  fetchSearchHistories,
  fetchSearchHistory,
  HistoryApiError,
} from "@/lib/history";

vi.mock("@/components/AuthButton", () => ({
  default: () => <button type="button">ログイン状態</button>,
}));

vi.mock("@/lib/history", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/history")>("@/lib/history");
  return {
    ...actual,
    deleteSearchHistory: vi.fn(),
    fetchSearchHistories: vi.fn(),
    fetchSearchHistory: vi.fn(),
  };
});

const fetchSearchHistoriesMock = vi.mocked(fetchSearchHistories);
const fetchSearchHistoryMock = vi.mocked(fetchSearchHistory);
const deleteSearchHistoryMock = vi.mocked(deleteSearchHistory);

const history = {
  id: "history-a",
  input_text: "run, give up",
  result_count: 2,
  created_at: "2026-08-16T00:00:00.000Z",
};

const detail = {
  ...history,
  normalized_words: ["run", "give up"],
  results: [
    {
      word: "run",
      translation: "走る",
      example: "I run every morning.",
      sentence_id: 25447,
      translation_found: true,
      example_found: true,
    },
  ],
};

beforeEach(() => {
  fetchSearchHistoriesMock.mockReset();
  fetchSearchHistoryMock.mockReset();
  deleteSearchHistoryMock.mockReset();
});

describe("History page", () => {
  it("lists histories, displays a selected result, and deletes it", async () => {
    const user = userEvent.setup();
    fetchSearchHistoriesMock.mockResolvedValue({
      histories: [history],
      count: 1,
    });
    fetchSearchHistoryMock.mockResolvedValue(detail);
    deleteSearchHistoryMock.mockResolvedValue();

    render(<HistoryPage />);

    expect(await screen.findByText("run, give up")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /run, give up2語/ }));

    expect(await screen.findByText("走る")).toBeInTheDocument();
    expect(fetchSearchHistoryMock).toHaveBeenCalledWith("history-a");

    await user.click(
      screen.getByRole("button", { name: "run, give upを削除" }),
    );
    await waitFor(() => {
      expect(deleteSearchHistoryMock).toHaveBeenCalledWith("history-a");
      expect(
        screen.queryByRole("button", { name: "run, give upを削除" }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows an empty state when there are no histories", async () => {
    fetchSearchHistoriesMock.mockResolvedValue({ histories: [], count: 0 });

    render(<HistoryPage />);

    expect(
      await screen.findByText("まだ検索履歴がありません"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "検索をはじめる" }),
    ).toHaveAttribute("href", "/");
  });

  it("prompts an unauthenticated user to log in", async () => {
    fetchSearchHistoriesMock.mockRejectedValue(
      new HistoryApiError("Authentication required.", 401),
    );

    render(<HistoryPage />);

    expect(
      await screen.findByText("ログインすると履歴を見られます"),
    ).toBeInTheDocument();
  });

  it("shows an error when history loading fails", async () => {
    fetchSearchHistoriesMock.mockRejectedValue(
      new HistoryApiError("Server error", 500),
    );

    render(<HistoryPage />);

    expect(
      await screen.findByText(
        "履歴を取得できませんでした。時間をおいて再度お試しください。",
      ),
    ).toBeInTheDocument();
  });
});
