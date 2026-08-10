export default function AttributionFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 px-4 py-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
      <div className="mx-auto flex max-w-2xl flex-col gap-1">
        <p>Dictionary data from EJDict, licensed under CC0 1.0 Universal.</p>
        <p>
          Example sentences © their respective authors, from the{" "}
          <a
            href="https://tatoeba.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Tatoeba Project
          </a>{" "}
          (tatoeba.org), licensed under CC BY 2.0 FR.
        </p>
      </div>
    </footer>
  );
}
