import type { WordResult } from "@/lib/api";

type ResultsTableProps = {
  results: WordResult[];
};

function NotFoundBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      未収録
    </span>
  );
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
            <th className="px-4 py-3">単語</th>
            <th className="px-4 py-3">訳語</th>
            <th className="px-4 py-3">例文</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {results.map((result, index) => (
            <tr key={`${result.word}-${index}`}>
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                {result.word}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {result.translation_found ? (
                  result.translation
                ) : (
                  <NotFoundBadge />
                )}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {result.example_found ? (
                  <span>
                    {result.example}
                    {result.sentence_id !== null && (
                      <>
                        {" "}
                        <a
                          href={`https://tatoeba.org/en/sentences/show/${result.sentence_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whitespace-nowrap text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Tatoebaで見る →
                        </a>
                      </>
                    )}
                  </span>
                ) : (
                  <NotFoundBadge />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
