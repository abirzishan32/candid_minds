"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Copy, X } from "lucide-react";
import { toast } from "sonner";

// Import the Monaco Editor dynamically to avoid SSR issues
const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then(mod => mod.default),
    { ssr: false }
);

// List of supported programming languages
const LANGUAGES = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "sql", label: "SQL" },
    { value: "shell", label: "Shell/Bash" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" }
];

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (code: string) => void;
    onLanguageChange: (language: string) => void;
    readOnly?: boolean;
    onSave?: (e?: React.FormEvent) => void; // Updated to accept an optional event parameter
}

export default function CodeEditor({
    code,
    language,
    onChange,
    onLanguageChange,
    readOnly = false,
    onSave
}: CodeEditorProps) {
    const [mounted, setMounted] = useState(false);

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy code to clipboard");
        }
    };

    // Create a handler for the save button
    const handleSave = () => {
        if (onSave) {
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        }
    };

    // Set mounted state after component mounts to prevent SSR issues
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-[400px] border rounded-md flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                Loading editor...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2 gap-2">
                <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        title="Copy code"
                    >
                        <Copy size={16} className="mr-1" />
                        Copy
                    </Button>

                    {onSave && !readOnly && (
                        <Button
                            size="sm"
                            onClick={handleSave} // Use the new handler
                            title="Save changes"
                        >
                            <Save size={16} className="mr-1" />
                            Save
                        </Button>
                    )}
                </div>
            </div>

            <div className="h-[400px] border rounded-md overflow-hidden">
                <MonacoEditor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => onChange(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        readOnly,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                    theme="vs-dark"
                />
            </div>
        </div>
    );
}