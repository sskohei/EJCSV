"use client";

import { exportCsv } from "@/lib/api";

type DownloadCsvButtonProps = {
  text: string;
  disabled?: boolean;
};

export default function DownloadCsvButton({
  text,
  disabled,
}: DownloadCsvButtonProps) {
  const handleClick = async () => {
    const blob = await exportCsv(text);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ejcsv.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="font-heading inline-flex items-center gap-2 rounded-full border-2 border-red-400 bg-white px-5 py-2 text-sm font-semibold text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md hover:shadow-red-500/20 focus:ring-4 focus:ring-red-400/30 focus:outline-none active:translate-y-0 active:scale-95 disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:shadow-none disabled:hover:bg-white dark:bg-stone-900 dark:hover:bg-stone-800 dark:disabled:border-stone-700 dark:disabled:bg-stone-900 dark:disabled:text-stone-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M10 12.5a.75.75 0 0 0 .75-.75V4a.75.75 0 0 0-1.5 0v7.75c0 .414.336.75.75.75Z" />
        <path d="M5.72 8.47a.75.75 0 0 1 1.06 0L10 11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.53a.75.75 0 0 1 0-1.06Z" />
        <path d="M3.5 13.25a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h10a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A2.25 2.25 0 0 1 15 18H5a2.25 2.25 0 0 1-2.25-2.25v-1.5a.75.75 0 0 1 .75-.75Z" />
      </svg>
      CSVダウンロード
    </button>
  );
}
