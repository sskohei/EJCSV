import type { WordResult } from "./api";

export type SearchHistorySummary = {
  id: string;
  input_text: string;
  result_count: number;
  created_at: string;
};

export type SearchHistory = SearchHistorySummary & {
  normalized_words: string[];
  results: WordResult[];
};

export type SearchHistoryListResponse = {
  histories: SearchHistorySummary[];
  count: number;
};

export class HistoryApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HistoryApiError";
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new HistoryApiError(
      `History request failed: ${response.status}`,
      response.status,
    );
  }

  return response.json();
}

export function fetchSearchHistories() {
  return request<SearchHistoryListResponse>("/api/history");
}

export function fetchSearchHistory(id: string) {
  return request<SearchHistory>(`/api/history/${encodeURIComponent(id)}`);
}

export async function deleteSearchHistory(id: string): Promise<void> {
  const response = await fetch(`/api/history/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new HistoryApiError(
      `History deletion failed: ${response.status}`,
      response.status,
    );
  }
}
