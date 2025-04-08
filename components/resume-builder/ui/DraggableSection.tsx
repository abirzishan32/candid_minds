"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { SectionKey, SectionOrder } from "@/app/(root)/resume-builder/types";

interface DraggableSectionProps {
  section: SectionOrder;
  toggleVisibility: (id: SectionKey) => void;
}

export default function DraggableSection({ section, toggleVisibility }: DraggableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-3 bg-gray-800 dark:bg-gray-800 p-3 rounded-md border border-gray-700 dark:border-gray-700 mb-2"
    >
      <button
        className="cursor-grab text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <span className="flex-1 font-medium text-white">{section.title}</span>
      <button
        onClick={() => toggleVisibility(section.id)}
        className="text-gray-400 hover:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
      >
        {section.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    </div>
  );
} 