"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    void supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!isMounted) return;
      if (userError) setError("ログイン状態を確認できませんでした。");
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });

      if (signInError) setError("Googleログインを開始できませんでした。");
    } catch {
      setError("Supabaseが設定されていません。管理者に設定を確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError("ログアウトに失敗しました。");
      } else {
        setUser(null);
      }
    } catch {
      setError("ログアウトに失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="h-10" aria-label="ログイン状態を確認中" />;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {user ? (
        <div className="flex items-center gap-3">
          <span className="max-w-48 truncate text-xs text-stone-600 dark:text-stone-400">
            {user.user_metadata?.full_name ?? user.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSubmitting}
            className="rounded-full border-2 border-[#34313d] bg-white px-4 py-2 text-xs font-bold shadow-[2px_2px_0_#34313d] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-100 dark:bg-stone-900 dark:shadow-[2px_2px_0_#1c1917]"
          >
            {isSubmitting ? "処理中…" : "ログアウト"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSubmitting || !isSupabaseConfigured()}
          title={
            isSupabaseConfigured()
              ? undefined
              : "Supabaseの環境変数を設定すると利用できます"
          }
          className="rounded-full border-2 border-[#34313d] bg-white px-4 py-2 text-xs font-bold shadow-[3px_3px_0_#34313d] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-100 dark:bg-stone-900 dark:shadow-[3px_3px_0_#1c1917]"
        >
          {isSubmitting ? "Googleへ移動中…" : "Googleでログイン"}
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
