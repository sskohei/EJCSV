export default function AboutSection() {
  return (
    <section className="rounded-3xl border-2 border-orange-100 bg-white p-6 shadow-lg shadow-red-500/5 dark:border-stone-800 dark:bg-stone-900">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-red-500 dark:text-red-400">
            このサイトについて
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            EJCSVは、英単語のリストを入力すると「英単語・日本語訳・例文」の3列からなるCSVファイルを生成し、ダウンロードできる無料のWebアプリです。単語帳作りや学習教材の作成にお使いください。
          </p>
          <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
            使い方
          </p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-stone-600 dark:text-stone-400">
            <li>
              調べたい英単語を改行またはカンマ区切りで入力欄に入力します。
            </li>
            <li>「変換」ボタンを押すと、訳語と例文が検索されます。</li>
            <li>
              結果を確認し、「CSVダウンロード」ボタンでファイルを保存します。
            </li>
          </ol>
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-red-500 dark:text-red-400">
            About this site
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            EJCSV is a free web app that turns a list of English words into a
            downloadable CSV file with three columns: the English word, its
            Japanese translation, and an example sentence. Use it to build
            vocabulary lists or study materials.
          </p>
          <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
            How to use
          </p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-stone-600 dark:text-stone-400">
            <li>
              Enter the English words you want to look up, separated by line
              breaks or commas.
            </li>
            <li>
              Click the &quot;変換&quot; (Convert) button to look up
              translations and example sentences.
            </li>
            <li>
              Review the results, then click &quot;CSVダウンロード&quot; to save
              the file.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
