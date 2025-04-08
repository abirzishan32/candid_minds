import React from "react";

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 min-h-screen">
      {children}
    </div>
  );
}
