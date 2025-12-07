import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateLinkDialog } from "./CreateLinkDialog";
import { useFolderStore } from "@/store/folderStore";

vi.mock("@/store/folderStore", () => ({
  useFolderStore: vi.fn(),
}));

describe("CreateLinkDialog", () => {
  const mockCreateLink = vi.fn();
  const mockOnLinkCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFolderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      createLink: mockCreateLink,
    });
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    folderId: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID
    folderName: "Bookmarks",
    onLinkCreated: mockOnLinkCreated,
  };

  it("should not render when closed", () => {
    render(<CreateLinkDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId("create-link-dialog")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(<CreateLinkDialog {...defaultProps} />);

    expect(screen.getByTestId("create-link-dialog")).toBeInTheDocument();
    expect(screen.getByText("Add New Link to Bookmarks")).toBeInTheDocument();
  });

  it("should have link title and URL input fields", () => {
    render(<CreateLinkDialog {...defaultProps} />);

    expect(screen.getByTestId("link-title-input")).toBeInTheDocument();
    expect(screen.getByTestId("link-url-input")).toBeInTheDocument();
  });

  it("should display target folder as read-only", () => {
    render(<CreateLinkDialog {...defaultProps} />);

    const folderDisplay = screen.getByTestId("target-folder-display");
    expect(folderDisplay).toHaveValue("Bookmarks");
    expect(folderDisplay).toBeDisabled();
  });

  it("should show validation error for empty title", async () => {
    const user = userEvent.setup();
    render(<CreateLinkDialog {...defaultProps} />);

    const urlInput = screen.getByTestId("link-url-input");
    await user.type(urlInput, "https://example.com");

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });

  it("should show validation error for empty URL", async () => {
    const user = userEvent.setup();
    render(<CreateLinkDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("link-title-input")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("link-title-input");
    await user.type(titleInput, "Example");

    // Leave URL empty to trigger validation error
    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });

  it("should call createLink with correct parameters", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockCreateLink.mockResolvedValue(undefined);

    render(
      <CreateLinkDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("link-title-input")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("link-title-input");
    await user.type(titleInput, "Example Site");

    const urlInput = screen.getByTestId("link-url-input");
    await user.type(urlInput, "https://example.com");

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateLink).toHaveBeenCalledWith(
        "Example Site",
        "https://example.com",
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnLinkCreated).toHaveBeenCalled();
    });
  });

  it("should close dialog on cancel", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CreateLinkDialog {...defaultProps} onOpenChange={onOpenChange} />);

    const cancelButton = screen.getByTestId("cancel-button");
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should display error message on create failure", async () => {
    const user = userEvent.setup();
    mockCreateLink.mockRejectedValue(new Error("Failed to create link"));

    render(<CreateLinkDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("link-title-input")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("link-title-input");
    await user.type(titleInput, "Example Site");

    const urlInput = screen.getByTestId("link-url-input");
    await user.type(urlInput, "https://example.com");

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to create link"
      );
    });
  });

  it("should disable buttons while submitting", async () => {
    const user = userEvent.setup();
    mockCreateLink.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<CreateLinkDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("link-title-input")).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("link-title-input");
    await user.type(titleInput, "Example Site");

    const urlInput = screen.getByTestId("link-url-input");
    await user.type(urlInput, "https://example.com");

    const createButton = screen.getByTestId("create-button");
    const cancelButton = screen.getByTestId("cancel-button");

    await user.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
