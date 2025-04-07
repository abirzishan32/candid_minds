import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resume Checker | Candid Minds',
    description: 'Get your resume-checker analyzed by AI and receive professional feedback to improve your job applications',
};

export default function ResumeCheckerLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    return (
        <section className="w-full">
            <div className="gradient-overlay"></div>
            {children}
        </section>
    );
}