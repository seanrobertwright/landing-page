import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  it('should render dialog when open', () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(
      <ConfirmDeleteDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('should call onConfirm and onOpenChange when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
      />
    );

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should have destructive styling on Delete button', () => {
    render(
      <ConfirmDeleteDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />
    );

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('bg-destructive');
  });
});
