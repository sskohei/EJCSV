export type WordResult = {
  word: string;
  translation: string | null;
  example: string | null;
  translation_found: boolean;
  example_found: boolean;
};

export type LookupResponse = {
  results: WordResult[];
  count: number;
};

export async function lookupWords(text: string): Promise<LookupResponse> {
  const response = await fetch("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Lookup request failed: ${response.status}`);
  }

  return response.json();
}

export async function exportCsv(text: string): Promise<Blob> {
  const response = await fetch("/api/export/csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Export request failed: ${response.status}`);
  }

  return response.blob();
}
