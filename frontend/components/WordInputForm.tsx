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
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder="英単語を改行またはカンマ区切りで入力"
      />
      <button type="submit" disabled={disabled}>
        変換
      </button>
    </form>
  );
}
