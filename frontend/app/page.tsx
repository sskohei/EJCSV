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
      setError("検索に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>EJCSV</h1>
      <WordInputForm onSubmit={handleSubmit} disabled={isLoading} />
      {error && <p role="alert">{error}</p>}
      <ResultsTable results={results} />
      <DownloadCsvButton text={text} disabled={results.length === 0} />
      <AttributionFooter />
    </main>
  );
}
