import React from "react";

export default function SkillAssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="skill-assessment-layout relative min-h-screen">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_theme(colors.primary/5),_transparent_70%)] -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,_theme(colors.secondary/5),_transparent_70%)] -z-10"></div>
      

      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] -z-10"></div>
      

      {children}
    </div>
  );
}