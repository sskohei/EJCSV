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
      className="pop-shadow rounded-[2rem] border-2 border-[#34313d] bg-white p-5 sm:p-7 dark:border-stone-700 dark:bg-stone-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-heading text-xs font-bold tracking-widest text-[#ff5c5c] uppercase">
            STEP 1
          </p>
          <label
            htmlFor="word-input"
            className="font-heading block text-xl font-bold text-[#34313d] dark:text-stone-100"
          >
            英単語リスト
          </label>
        </div>
        <span className="rounded-full bg-[#8fe3cf] px-3 py-1 text-xs font-bold text-[#20554d]">
          最大200語
        </span>
      </div>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        改行またはカンマ区切りで入力してください（例: run, give up, listen）
      </p>
      <textarea
        id="word-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder={"run\ngive up, listen"}
        rows={6}
        className="mt-4 w-full resize-y rounded-2xl border-2 border-[#ffd84d] bg-[#fffdf7] px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 shadow-inner focus:border-[#ff5c5c] focus:ring-4 focus:ring-[#ff5c5c]/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:disabled:bg-stone-900"
      />
      <button
        type="submit"
        disabled={disabled}
        className="font-heading mt-4 inline-flex items-center justify-center rounded-full border-2 border-[#34313d] bg-[#ff5c5c] px-7 py-3 text-base font-bold text-white shadow-[4px_4px_0_#34313d] transition-all hover:-translate-y-0.5 hover:bg-[#ff7474] focus:ring-4 focus:ring-[#ff5c5c]/30 focus:outline-none active:translate-y-0 active:shadow-[2px_2px_0_#34313d] disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300 disabled:shadow-none dark:border-stone-100 dark:bg-[#ff5c5c] dark:shadow-[4px_4px_0_#1c1917]"
      >
        {disabled ? "変換中…" : "変換"}
      </button>
    </form>
  );
}
