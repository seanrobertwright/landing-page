import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkCard } from "./LinkCard";

describe("LinkCard", () => {
  const defaultProps = {
    id: "test-1",
    title: "Test Link",
    url: "https://example.com",
    onTitleChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title and hostname", () => {
    render(<LinkCard {...defaultProps} />);

    expect(screen.getByText("Test Link")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("should enter edit mode when title is clicked", async () => {
    const user = userEvent.setup();
    render(<LinkCard {...defaultProps} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Test Link");
  });

  it("should save title on Enter key", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<LinkCard {...defaultProps} onTitleChange={onTitleChange} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Title{Enter}");

    expect(onTitleChange).toHaveBeenCalledWith("test-1", "New Title");
  });

  it("should save title on blur", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<LinkCard {...defaultProps} onTitleChange={onTitleChange} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Title");
    fireEvent.blur(input);

    expect(onTitleChange).toHaveBeenCalledWith("test-1", "New Title");
  });

  it("should cancel edit on Escape key", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<LinkCard {...defaultProps} onTitleChange={onTitleChange} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Title{Escape}");

    expect(onTitleChange).not.toHaveBeenCalled();
    expect(screen.getByText("Test Link")).toBeInTheDocument();
  });

  it("should not save if title is unchanged", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<LinkCard {...defaultProps} onTitleChange={onTitleChange} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    await user.type(input, "{Enter}");

    expect(onTitleChange).not.toHaveBeenCalled();
  });

  it("should not save empty title", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<LinkCard {...defaultProps} onTitleChange={onTitleChange} />);

    const title = screen.getByText("Test Link");
    await user.click(title);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "{Enter}");

    expect(onTitleChange).not.toHaveBeenCalled();
  });

  it("should open link in new tab when card is clicked", async () => {
    const user = userEvent.setup();
    const windowOpen = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<LinkCard {...defaultProps} />);

    // Get all buttons and find the card (the outer container, not the title h3)
    const buttons = screen.getAllByRole("button");
    const card = buttons.find((el) => el.tagName === "DIV");

    if (card) {
      await user.click(card);
    }

    expect(windowOpen).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );

    windowOpen.mockRestore();
  });
});
