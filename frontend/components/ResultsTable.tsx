import type { WordResult } from "@/lib/api";

type ResultsTableProps = {
  results: WordResult[];
};

function NotFoundBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      未収録
    </span>
  );
}

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-orange-100 bg-white shadow-lg shadow-red-500/5 dark:border-stone-800 dark:bg-stone-900">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="font-heading border-b-2 border-orange-100 text-xs font-semibold tracking-wide text-red-500 uppercase dark:border-stone-800 dark:text-red-400">
            <th className="px-4 py-3">単語</th>
            <th className="px-4 py-3">訳語</th>
            <th className="px-4 py-3">例文</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-orange-50 dark:divide-stone-800">
          {results.map((result, index) => (
            <tr
              key={`${result.word}-${index}`}
              className="hover:bg-orange-50/60 dark:hover:bg-stone-800/60"
            >
              <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                {result.word}
              </td>
              <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                {result.translation_found ? (
                  result.translation
                ) : (
                  <NotFoundBadge />
                )}
              </td>
              <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
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
                          className="whitespace-nowrap text-red-500 hover:underline dark:text-red-400"
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
