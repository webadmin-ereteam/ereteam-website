"use client";

import { useEffect, useRef, useState } from "react";
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
  const [list, setList] = useState(items);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setList(items);
  }, [items]);

  function handleDrop(targetIndex: number) {
    const from = dragIndexRef.current;
    dragIndexRef.current = null;
    if (from === null || from === targetIndex) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setList(next);
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
