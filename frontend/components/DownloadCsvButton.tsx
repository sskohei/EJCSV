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
      className="cursor-pointer font-heading inline-flex items-center gap-2 rounded-full border-2 border-[#34313d] bg-[#ffd84d] px-5 py-3 text-sm font-bold text-[#34313d] shadow-[4px_4px_0_#34313d] transition-all hover:-translate-y-0.5 hover:bg-[#ffe477] focus:ring-4 focus:ring-[#ffd84d]/40 focus:outline-none active:translate-y-0 active:shadow-[2px_2px_0_#34313d] disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none dark:border-stone-100 dark:bg-[#ffd84d] dark:text-[#34313d] dark:shadow-[4px_4px_0_#1c1917]"
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
