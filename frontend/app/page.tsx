"use client";

import { useState } from "react";
import WordInputForm from "@/components/WordInputForm";
import ResultsTable from "@/components/ResultsTable";
import DownloadCsvButton from "@/components/DownloadCsvButton";
import AboutSection from "@/components/AboutSection";
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
      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7 px-4 py-8 sm:py-12">
        <span
          className="floaty absolute right-5 top-8 text-3xl sm:right-10"
          aria-hidden="true"
        >
          ✦
        </span>
        <span
          className="absolute left-1 top-28 text-xl text-[#8ccbff] sm:left-5"
          aria-hidden="true"
        >
          ●
        </span>

        <header className="relative max-w-xl">
          <div className="mb-4 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-[#34313d] bg-[#ffd84d] px-3 py-1 text-xs font-bold tracking-wide shadow-[3px_3px_0_#34313d]">
            ENGLISH → JAPANESE
          </div>
          <h1 className="font-heading text-5xl font-bold leading-none tracking-tight text-[#ff5c5c] sm:text-7xl">
            EJCSV
          </h1>
          <p className="font-heading mt-3 text-2xl font-semibold leading-tight text-[#34313d] sm:text-3xl">
            英単語を、ぽんっと単語帳に。
          </p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600 dark:text-stone-400 sm:text-base">
            入力するだけで、訳語と例文つきのCSVを作れます。単語帳づくりを、もっと軽やかに。
          </p>
        </header>

        <WordInputForm onSubmit={handleSubmit} disabled={isLoading} />

        {error && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {results.length > 0 && (
          <div className="flex items-center gap-3 px-1">
            <span className="text-2xl" aria-hidden="true">
              ✨
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-[#34313d] dark:text-stone-100">
                {results.length}語の単語帳ができました！
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                内容を確認してCSVに保存できます。
              </p>
            </div>
          </div>
        )}

        <ResultsTable results={results} />

        {results.length > 0 && (
          <div className="flex justify-center sm:justify-end">
            <DownloadCsvButton text={text} disabled={results.length === 0} />
          </div>
        )}

        <AboutSection />
      </main>
      <AttributionFooter />
    </div>
  );
}
