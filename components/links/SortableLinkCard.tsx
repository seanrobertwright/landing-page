"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LinkCard } from './LinkCard';
import { LinkContextMenu } from '@/components/context-menus/LinkContextMenu';

interface SortableLinkCardProps {
  id: string;
  title: string;
  url: string;
  onTitleChange?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export const SortableLinkCard = ({ id, title, url, onTitleChange, onDelete }: SortableLinkCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <LinkContextMenu
      linkId={id}
      linkUrl={url}
      onDelete={() => onDelete?.(id)}
    >
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <LinkCard id={id} title={title} url={url} onTitleChange={onTitleChange} />
      </div>
    </LinkContextMenu>
  );
};
