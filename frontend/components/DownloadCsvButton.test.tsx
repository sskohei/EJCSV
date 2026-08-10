import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadCsvButton from "./DownloadCsvButton";
import { exportCsv } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  exportCsv: vi.fn(),
}));

const exportCsvMock = vi.mocked(exportCsv);

beforeEach(() => {
  exportCsvMock.mockReset();
  exportCsvMock.mockResolvedValue(new Blob(["word,translation,example"]));
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });
  // jsdom attempts to navigate the document when a real <a href> is clicked.
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

describe("DownloadCsvButton", () => {
  it("calls exportCsv with the given text when clicked", async () => {
    const user = userEvent.setup();
    render(<DownloadCsvButton text="run, listen" />);

    await user.click(screen.getByRole("button", { name: /CSVダウンロード/ }));

    expect(exportCsvMock).toHaveBeenCalledWith("run, listen");
  });

  it("does not call exportCsv when disabled", async () => {
    const user = userEvent.setup();
    render(<DownloadCsvButton text="run, listen" disabled />);

    const button = screen.getByRole("button", { name: /CSVダウンロード/ });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(exportCsvMock).not.toHaveBeenCalled();
  });
});
