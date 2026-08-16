import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);
const exchangeCodeForSessionMock = vi.fn();

beforeEach(() => {
  createClientMock.mockReset();
  exchangeCodeForSessionMock.mockReset();
});

function setupClient() {
  exchangeCodeForSessionMock.mockResolvedValue({ error: null });
  createClientMock.mockResolvedValue({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  } as never);
}

function request(path: string) {
  return new Request(`https://app.example.com${path}`);
}

describe("GET /auth/callback", () => {
  it("exchanges the OAuth code and redirects to the requested local path", async () => {
    setupClient();

    const response = await GET(
      request("/auth/callback?code=oauth-code&next=/history"),
    );

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("oauth-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.example.com/history",
    );
  });

  it("does not allow an external redirect target", async () => {
    setupClient();

    const response = await GET(
      request("/auth/callback?code=oauth-code&next=https://evil.example.com"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.example.com/");
  });

  it("redirects to the error page when exchanging the code fails", async () => {
    setupClient();
    exchangeCodeForSessionMock.mockResolvedValue({
      error: new Error("invalid oauth code"),
    });

    const response = await GET(request("/auth/callback?code=invalid"));

    expect(response.headers.get("location")).toBe(
      "https://app.example.com/auth/auth-code-error",
    );
  });

  it("redirects to the error page when no code is provided", async () => {
    const response = await GET(request("/auth/callback"));

    expect(response.headers.get("location")).toBe(
      "https://app.example.com/auth/auth-code-error",
    );
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
