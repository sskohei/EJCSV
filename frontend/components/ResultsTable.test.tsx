import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResultsTable from "./ResultsTable";
import type { WordResult } from "@/lib/api";

const foundResult: WordResult = {
  word: "run",
  translation: "走る",
  example: "I run every morning.",
  sentence_id: 25447,
  translation_found: true,
  example_found: true,
};

const notFoundResult: WordResult = {
  word: "xenodochial",
  translation: null,
  example: null,
  sentence_id: null,
  translation_found: false,
  example_found: false,
};

const foundWithoutSentenceId: WordResult = {
  word: "listen",
  translation: "聞く",
  example: "Listen carefully.",
  sentence_id: null,
  translation_found: true,
  example_found: true,
};

describe("ResultsTable", () => {
  it("renders nothing when results is empty", () => {
    const { container } = render(<ResultsTable results={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders word, translation, and example for found results", () => {
    render(<ResultsTable results={[foundResult]} />);

    expect(screen.getByText("run")).toBeInTheDocument();
    expect(screen.getByText("走る")).toBeInTheDocument();
    expect(screen.getByText(/I run every morning\./)).toBeInTheDocument();
  });

  it("shows a not-found badge for translation and example that were not found", () => {
    render(<ResultsTable results={[notFoundResult]} />);

    expect(screen.getAllByText("未収録")).toHaveLength(2);
  });

  it("shows a Tatoeba link pointing at the correct sentence_id when an example is found", () => {
    render(<ResultsTable results={[foundResult]} />);

    const link = screen.getByRole("link", { name: /Tatoebaで見る/ });
    expect(link).toHaveAttribute(
      "href",
      "https://tatoeba.org/en/sentences/show/25447",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not show a Tatoeba link when sentence_id is null", () => {
    render(<ResultsTable results={[foundWithoutSentenceId]} />);

    expect(
      screen.queryByRole("link", { name: /Tatoebaで見る/ }),
    ).not.toBeInTheDocument();
  });
});
