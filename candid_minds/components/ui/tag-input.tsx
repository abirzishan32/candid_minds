"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  className,
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      
      const newTag = inputValue.trim();
      if (!value.includes(newTag) && value.length < maxTags) {
        onChange([...value, newTag]);
      }
      
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-950 border rounded-md items-center min-h-10 focus-within:ring-1 focus-within:ring-ring",
        className
      )}
      onClick={handleContainerClick}
    >
      {value.map(tag => (
        <div 
          key={tag}
          className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
        >
          <span className="mr-1">{tag}</span>
          <button 
            type="button" 
            onClick={() => removeTag(tag)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-w-20 h-6"
      />
    </div>
  );
}