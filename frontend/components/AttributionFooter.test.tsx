import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AttributionFooter from "./AttributionFooter";

describe("AttributionFooter", () => {
  it("shows the EJDict CC0 credit", () => {
    render(<AttributionFooter />);

    expect(
      screen.getByText(
        /Dictionary data from EJDict, licensed under CC0 1\.0 Universal\./,
      ),
    ).toBeInTheDocument();
  });

  it("shows the Tatoeba CC BY 2.0 FR credit with a link to tatoeba.org", () => {
    render(<AttributionFooter />);

    expect(
      screen.getByText(/licensed under CC BY 2\.0 FR\./),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Tatoeba Project" });
    expect(link).toHaveAttribute("href", "https://tatoeba.org/");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
