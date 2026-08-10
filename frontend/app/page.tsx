"use client";

import { useState } from "react";
import WordInputForm from "@/components/WordInputForm";
import ResultsTable from "@/components/ResultsTable";
import DownloadCsvButton from "@/components/DownloadCsvButton";
import AttributionFooter from "@/components/AttributionFooter";
import { lookupWords, type WordResult } from "@/lib/api";

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<WordResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (inputText: string) => {
    setText(inputText);
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupWords(inputText);
      setResults(response.results);
    } catch {
      setError("検索に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            EJCSV
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            英単語のリストから「英単語・日本語訳・例文」のCSVを生成してダウンロードできます。
          </p>
        </div>

        <WordInputForm onSubmit={handleSubmit} disabled={isLoading} />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <ResultsTable results={results} />

        {results.length > 0 && (
          <div>
            <DownloadCsvButton text={text} disabled={results.length === 0} />
          </div>
        )}
      </main>
      <AttributionFooter />
    </div>
  );
}
