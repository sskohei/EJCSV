export default function AttributionFooter() {
  return (
    <footer className="mt-auto border-t-2 border-orange-100 px-4 py-6 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-500">
      <div className="mx-auto flex max-w-2xl flex-col gap-1">
        <p>Dictionary data from EJDict, licensed under CC0 1.0 Universal.</p>
        <p>
          Example sentences © their respective authors, from the{" "}
          <a
            href="https://tatoeba.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:underline dark:text-red-400"
          >
            Tatoeba Project
          </a>{" "}
          (tatoeba.org), licensed under CC BY 2.0 FR.
        </p>
      </div>
    </footer>
  );
}
