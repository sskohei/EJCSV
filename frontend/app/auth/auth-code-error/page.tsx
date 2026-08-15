import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="text-5xl" aria-hidden="true">
        🫠
      </p>
      <h1 className="font-heading text-3xl font-bold text-[#ff5c5c]">
        ログインできませんでした
      </h1>
      <p className="text-sm leading-6 text-stone-600 dark:text-stone-400">
        認証の有効期限が切れているか、Supabaseの設定に問題がある可能性があります。
        もう一度お試しください。
      </p>
      <Link
        href="/"
        className="rounded-full border-2 border-[#34313d] bg-[#ffd84d] px-5 py-2 font-bold shadow-[3px_3px_0_#34313d] hover:-translate-y-0.5"
      >
        EJCSVに戻る
      </Link>
    </main>
  );
}
