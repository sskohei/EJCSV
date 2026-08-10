"use client";

import { useState, type FormEvent } from "react";

type WordInputFormProps = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
};

export default function WordInputForm({
  onSubmit,
  disabled,
}: WordInputFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(text);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <label
        htmlFor="word-input"
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        英単語リスト
      </label>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        改行またはカンマ区切りで入力してください（例: run, give up, listen）
      </p>
      <textarea
        id="word-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder={"run\ngive up, listen"}
        rows={6}
        className="mt-3 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900"
      />
      <button
        type="submit"
        disabled={disabled}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
      >
        {disabled ? "変換中…" : "変換"}
      </button>
    </form>
  );
}
