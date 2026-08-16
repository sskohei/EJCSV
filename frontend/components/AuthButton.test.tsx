import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthButton from "./AuthButton";
import { createClient } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const getUserMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signInWithOAuthMock = vi.fn();
const signOutMock = vi.fn();

function setupSupabase(user: { id: string; email: string } | null = null) {
  getUserMock.mockResolvedValue({ data: { user }, error: null });
  onAuthStateChangeMock.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  signInWithOAuthMock.mockResolvedValue({ error: null });
  signOutMock.mockResolvedValue({ error: null });
  createClientMock.mockReturnValue({
    auth: {
      getUser: getUserMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
    },
  } as never);
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  createClientMock.mockReset();
  getUserMock.mockReset();
  onAuthStateChangeMock.mockReset();
  signInWithOAuthMock.mockReset();
  signOutMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthButton", () => {
  it("disables Google login until Supabase is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    render(<AuthButton />);

    expect(
      screen.getByRole("button", { name: "Googleでログイン" }),
    ).toBeDisabled();
  });

  it("starts Google login with the current origin callback", async () => {
    const user = userEvent.setup();
    setupSupabase();

    render(<AuthButton />);
    await user.click(
      await screen.findByRole("button", { name: "Googleでログイン" }),
    );

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
  });

  it("logs out the authenticated user", async () => {
    const user = userEvent.setup();
    setupSupabase({ id: "user-a", email: "user@example.com" });

    render(<AuthButton />);
    const logoutButton = await screen.findByRole("button", {
      name: "ログアウト",
    });
    await user.click(logoutButton);

    expect(signOutMock).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Googleでログイン" }),
      ).toBeInTheDocument();
    });
  });

  it("shows an authentication error when the session cannot be read", async () => {
    setupSupabase();
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error("session expired"),
    });

    render(<AuthButton />);

    expect(
      await screen.findByText("ログイン状態を確認できませんでした。"),
    ).toBeInTheDocument();
  });
});
