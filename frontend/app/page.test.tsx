import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { lookupWords } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  lookupWords: vi.fn(),
  exportCsv: vi.fn(),
}));

const lookupWordsMock = vi.mocked(lookupWords);

beforeEach(() => {
  lookupWordsMock.mockReset();
});

describe("Home page", () => {
  it("renders the results table and download button on a successful lookup", async () => {
    const user = userEvent.setup();
    lookupWordsMock.mockResolvedValue({
      count: 1,
      results: [
        {
          word: "run",
          translation: "走る",
          example: "I run every morning.",
          sentence_id: 25447,
          translation_found: true,
          example_found: true,
        },
      ],
    });

    render(<Home />);
    await user.type(screen.getByRole("textbox"), "run");
    await user.click(screen.getByRole("button", { name: "変換" }));

    await waitFor(() => {
      expect(screen.getByText("走る")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /CSVダウンロード/ }),
    ).toBeInTheDocument();
  });

  it("shows an error message when the lookup fails", async () => {
    const user = userEvent.setup();
    lookupWordsMock.mockRejectedValue(new Error("Lookup request failed"));

    render(<Home />);
    await user.type(screen.getByRole("textbox"), "run");
    await user.click(screen.getByRole("button", { name: "変換" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "検索に失敗しました。時間をおいて再度お試しください。",
    );
  });

  it("always renders the attribution footer", () => {
    render(<Home />);

    expect(screen.getByText(/Dictionary data from EJDict/)).toBeInTheDocument();
  });
});
