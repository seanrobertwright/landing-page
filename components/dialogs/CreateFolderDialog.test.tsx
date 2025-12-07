import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { useFolderStore } from "@/store/folderStore";

vi.mock("@/store/folderStore", () => ({
  useFolderStore: vi.fn(),
}));

describe("CreateFolderDialog", () => {
  const mockCreateFolder = vi.fn();
  const mockTree = [
    {
      id: "folder-1",
      type: "folder" as const,
      name: "Bookmarks",
      children: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useFolderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      tree: mockTree,
      createFolder: mockCreateFolder,
    });
  });

  it("should not render when closed", () => {
    render(<CreateFolderDialog open={false} onOpenChange={vi.fn()} />);

    expect(screen.queryByTestId("create-folder-dialog")).not.toBeInTheDocument();
  });

  it("should render when open", async () => {
    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("create-folder-dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Folder")).toBeInTheDocument();
  });

  it("should have folder name input field", async () => {
    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-name-input")).toBeInTheDocument();
    });
  });

  it("should have parent folder select", async () => {
    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("parent-folder-select")).toBeInTheDocument();
    });
  });

  it("should show validation error for empty name", async () => {
    const user = userEvent.setup();
    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("create-button")).toBeInTheDocument();
    });

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });

  it("should call createFolder with correct parameters", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    mockCreateFolder.mockResolvedValue(undefined);

    render(<CreateFolderDialog open={true} onOpenChange={onOpenChange} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-name-input")).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId("folder-name-input");
    await user.type(nameInput, "New Folder");

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith("New Folder", undefined);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("should close dialog on cancel", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<CreateFolderDialog open={true} onOpenChange={onOpenChange} />);

    await waitFor(() => {
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
    });

    const cancelButton = screen.getByTestId("cancel-button");
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should display error message on create failure", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockRejectedValue(new Error("Failed to create folder"));

    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-name-input")).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId("folder-name-input");
    await user.type(nameInput, "New Folder");

    const createButton = screen.getByTestId("create-button");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to create folder"
      );
    });
  });

  it("should disable buttons while submitting", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<CreateFolderDialog open={true} onOpenChange={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId("folder-name-input")).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId("folder-name-input");
    await user.type(nameInput, "New Folder");

    const createButton = screen.getByTestId("create-button");
    const cancelButton = screen.getByTestId("cancel-button");

    await user.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });
});
