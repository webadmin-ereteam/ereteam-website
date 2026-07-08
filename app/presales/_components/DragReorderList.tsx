"use client";

import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";

export function DragReorderList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  // Only the *order* (a list of ids) is ever kept in local state, and only to
  // give drag-drop instant visual feedback while `onReorder` persists it
  // (sometimes a network round trip, e.g. a server action) — the actual item
  // *content* rendered every time is looked up fresh from the `items` prop.
  // The previous version kept a full local copy of `items`, synced via a
  // `useEffect`, which put it one render behind the parent on every content
  // edit (typing, toggling a checkbox, etc.), not just on reorders — a
  // classic "copying props into state" bug, not just a reordering one.
  const [order, setOrder] = useState<string[] | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const byId = new Map(items.map((item) => [item.id, item]));
  const itemIds = items.map((item) => item.id);
  const orderIsStale = !order || order.length !== itemIds.length || !itemIds.every((id) => order.includes(id));
  const list = orderIsStale ? items : order!.map((id) => byId.get(id)!);

  function handleDrop(targetIndex: number) {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from === null || from === targetIndex) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setOrder(next.map((item) => item.id));
    onReorder(next.map((item) => item.id));
  }

  return (
    <div className="space-y-3">
      {list.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => (dragIndexRef.current = index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className="flex items-start gap-2"
        >
          <span className="mt-4 shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing">
            <GripVertical size={18} />
          </span>
          <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  );
}
