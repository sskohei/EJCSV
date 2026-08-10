import type { WordResult } from "@/lib/api";

type ResultsTableProps = {
  results: WordResult[];
};

export default function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>単語</th>
          <th>訳語</th>
          <th>例文</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={`${result.word}-${index}`}>
            <td>{result.word}</td>
            <td data-found={result.translation_found}>
              {result.translation ?? "該当なし"}
            </td>
            <td data-found={result.example_found}>
              {result.example ?? "該当なし"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
