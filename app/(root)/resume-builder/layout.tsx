import React from "react";

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">AI Resume Builder</h1>
      {children}
    </div>
  );
}
