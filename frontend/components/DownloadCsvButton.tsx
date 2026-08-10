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
    <button type="button" onClick={handleClick} disabled={disabled}>
      CSVダウンロード
    </button>
  );
}
