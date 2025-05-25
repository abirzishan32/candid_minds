"use client";

import React from "react";
import CodeEditor from "./CodeEditor";

interface CodeViewerClientProps {
  code: string;
  language: string;
}

export default function CodeViewerClient({ code, language }: CodeViewerClientProps) {
  return (
    <CodeEditor
      code={code}
      language={language}
      onChange={() => {}}
      onLanguageChange={() => {}}
      readOnly={true}
    />
  );
}