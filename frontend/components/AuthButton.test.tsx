import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthButton from "./AuthButton";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AuthButton", () => {
  it("disables Google login until Supabase is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    render(<AuthButton />);

    expect(screen.getByRole("button", { name: "Googleでログイン" })).toBeDisabled();
  });
});
