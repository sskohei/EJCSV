"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthButton from "@/components/AuthButton";
import AttributionFooter from "@/components/AttributionFooter";
import ResultsTable from "@/components/ResultsTable";
import DownloadCsvButton from "@/components/DownloadCsvButton";
import {
  deleteSearchHistory,
  fetchSearchHistories,
  fetchSearchHistory,
  HistoryApiError,
  type SearchHistory,
  type SearchHistorySummary,
} from "@/lib/history";

type ListState = "loading" | "ready" | "unauthenticated" | "error";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<SearchHistorySummary[]>([]);
  const [listState, setListState] = useState<ListState>("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<SearchHistory | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void fetchSearchHistories()
      .then((response) => {
        if (!isMounted) return;
        setHistories(response.histories);
        setListState("ready");
      })
      .catch((requestError: unknown) => {
        if (!isMounted) return;
        if (
          requestError instanceof HistoryApiError &&
          requestError.status === 401
        ) {
          setListState("unauthenticated");
          return;
        }
        setError(
          "履歴を取得できませんでした。時間をおいて再度お試しください。",
        );
        setListState("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setSelectedHistory(null);
    setError(null);
    setIsDetailLoading(true);

    try {
      setSelectedHistory(await fetchSearchHistory(id));
    } catch (requestError: unknown) {
      if (
        requestError instanceof HistoryApiError &&
        requestError.status === 401
      ) {
        setListState("unauthenticated");
        setSelectedId(null);
      } else {
        setError("履歴の詳細を取得できませんでした。");
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      await deleteSearchHistory(id);
      setHistories((current) => current.filter((history) => history.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedHistory(null);
      }
    } catch (requestError: unknown) {
      if (
        requestError instanceof HistoryApiError &&
        requestError.status === 401
      ) {
        setListState("unauthenticated");
      } else {
        setError(
          "履歴を削除できませんでした。時間をおいて再度お試しください。",
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-7 px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-heading text-xs font-bold tracking-wide text-red-500 hover:underline dark:text-red-400 cursor-pointer"
            >
              ← 検索画面へ戻る
            </Link>
            <h1 className="font-heading mt-4 text-4xl font-bold text-[#ff5c5c] sm:text-5xl">
              検索履歴
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              過去に作った単語帳を、いつでも見返せます。
            </p>
          </div>
          <AuthButton />
        </header>

        {listState === "loading" && (
          <p className="rounded-2xl border-2 border-[#ffd84d] bg-white px-5 py-4 text-sm dark:bg-stone-900">
            履歴を読み込み中…
          </p>
        )}

        {listState === "unauthenticated" && (
          <section className="rounded-[2rem] border-2 border-[#34313d] bg-white p-7 text-center shadow-[5px_5px_0_#ffd84d] dark:border-stone-700 dark:bg-stone-900">
            <p className="font-heading text-xl font-bold">
              ログインすると履歴を見られます
            </p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Googleでログインして、過去の単語帳を確認しましょう。
            </p>
          </section>
        )}

        {listState === "error" && error && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {listState === "ready" && histories.length === 0 && (
          <section className="rounded-[2rem] border-2 border-[#34313d] bg-white p-7 text-center shadow-[5px_5px_0_#8ccbff] dark:border-stone-700 dark:bg-stone-900">
            <p className="font-heading text-xl font-bold">
              まだ検索履歴がありません
            </p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              検索すると、ここに単語帳が保存されます。
            </p>
            <Link
              href="/"
              className="font-heading mt-5 inline-flex rounded-full border-2 border-[#34313d] bg-[#ff5c5c] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_#34313d]"
            >
              検索をはじめる
            </Link>
          </section>
        )}

        {listState === "ready" && histories.length > 0 && (
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
            <section aria-label="検索履歴一覧" className="space-y-3">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className={`flex items-center gap-2 rounded-2xl border-2 border-[#34313d] bg-white p-3 shadow-[3px_3px_0_#8fe3cf] dark:border-stone-700 dark:bg-stone-900 ${selectedId === history.id ? "ring-4 ring-[#ffd84d]/60" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => void handleSelect(history.id)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                    aria-pressed={selectedId === history.id}
                  >
                    <span className="block truncate font-medium text-stone-900 dark:text-stone-100">
                      {history.input_text}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                      {history.result_count}語 ·{" "}
                      {formatDate(history.created_at)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(history.id)}
                    disabled={deletingId === history.id}
                    className="shrink-0 cursor-pointer rounded-full px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950"
                    aria-label={`${history.input_text}を削除`}
                  >
                    {deletingId === history.id ? "削除中…" : "削除"}
                  </button>
                </div>
              ))}
            </section>

            <section aria-label="検索履歴の詳細">
              {isDetailLoading && (
                <p className="rounded-2xl border-2 border-[#ffd84d] bg-white px-5 py-4 text-sm dark:bg-stone-900">
                  結果を読み込み中…
                </p>
              )}
              {!isDetailLoading && selectedHistory && (
                <div className="space-y-4">
                  <div>
                    <p className="font-heading text-xl font-bold">
                      {selectedHistory.input_text}
                    </p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {selectedHistory.result_count}語 ·{" "}
                      {formatDate(selectedHistory.created_at)}
                    </p>
                  </div>
                  <ResultsTable results={selectedHistory.results} />
                  <div className="flex justify-end">
                    <DownloadCsvButton text={selectedHistory.input_text} />
                  </div>
                </div>
              )}
              {!isDetailLoading && !selectedHistory && !error && (
                <p className="rounded-2xl border-2 border-dashed border-stone-300 px-5 py-8 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  履歴を選択すると、保存した結果を表示します。
                </p>
              )}
            </section>
          </div>
        )}

        {error && listState === "ready" && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </main>
      <AttributionFooter />
    </div>
  );
}
