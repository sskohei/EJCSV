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
