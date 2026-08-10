import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WordInputForm from "./WordInputForm";

describe("WordInputForm", () => {
  it("renders label, textarea, and submit button", () => {
    render(<WordInputForm onSubmit={vi.fn()} />);

    expect(screen.getByText("英単語リスト")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "変換" })).toBeInTheDocument();
  });

  it("reflects typed input in the textarea", async () => {
    const user = userEvent.setup();
    render(<WordInputForm onSubmit={vi.fn()} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "run, listen");

    expect(textarea).toHaveValue("run, listen");
  });

  it("calls onSubmit with the input text when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WordInputForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox"), "run, listen");
    await user.click(screen.getByRole("button", { name: "変換" }));

    expect(onSubmit).toHaveBeenCalledWith("run, listen");
  });

  it("disables the textarea and button, and shows loading label, when disabled", () => {
    render(<WordInputForm onSubmit={vi.fn()} disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "変換中…" })).toBeDisabled();
  });
});
