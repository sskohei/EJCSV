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
      className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg shadow-red-500/5 dark:border-stone-800 dark:bg-stone-900"
    >
      <label
        htmlFor="word-input"
        className="font-heading block text-sm font-semibold text-stone-700 dark:text-stone-200"
      >
        英単語リスト
      </label>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        改行またはカンマ区切りで入力してください（例: run, give up, listen）
      </p>
      <textarea
        id="word-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder={"run\ngive up, listen"}
        rows={6}
        className="mt-3 w-full resize-y rounded-2xl border-2 border-orange-100 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:disabled:bg-stone-900"
      />
      <button
        type="submit"
        disabled={disabled}
        className="font-heading mt-4 inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition-all hover:-translate-y-0.5 hover:bg-red-400 hover:shadow-lg hover:shadow-red-500/40 focus:ring-4 focus:ring-red-400/30 focus:outline-none active:translate-y-0 active:scale-95 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none disabled:hover:translate-y-0 dark:disabled:bg-stone-700"
      >
        {disabled ? "変換中…" : "変換"}
      </button>
    </form>
  );
}
