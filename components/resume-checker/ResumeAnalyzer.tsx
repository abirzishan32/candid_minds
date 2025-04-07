"use client";

import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle2, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeResume } from '@/lib/actions/resume.action';
import ResumeResults from '@/components/resume-checker/ResumeResults'

interface ResumeAnalyzerProps {
    userId: string;
}

export default function ResumeAnalyzer({ userId }: ResumeAnalyzerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ResumeAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Add a ref for the file input

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const droppedFile = e.dataTransfer.files[0];
        handleFileSelection(droppedFile);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        // Check file type
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
            setError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
            return;
        }

        // Check file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit');
            return;
        }

        setFile(selectedFile);
    };

    const processResume = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Convert file to base64
            const base64File = await fileToBase64(file);

            // Call the server action
            const result = await analyzeResume({
                userId,
                fileName: file.name,
                fileType: file.type,
                fileContent: base64File as string,
            });

            // Check 'success' property before accessing either 'analysis' or 'message'
            if (result.success) {
                setResults(result.analysis);
            } else {
                // Now TypeScript knows 'message' exists on this branch
                setError(result.message || 'Failed to analyze resume-checker');
            }
        } catch (err) {
            console.error("Error analyzing resume-checker:", err);
            setError('An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const resetAnalysis = () => {
        setFile(null);
        setResults(null);
        setError(null);
    };

    // If we have results, show the results component
    if (results) {
        return <ResumeResults results={results} onReset={resetAnalysis} />;
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <div
                className={`border-2 border-dashed rounded-lg py-12 px-6 text-center transition-colors ${
                    isDragging
                        ? 'border-primary-100 bg-primary-900/10'
                        : 'border-gray-700 hover:border-gray-600 bg-black/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="mx-auto flex flex-col items-center justify-center">
                    {file ? (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-300 flex items-center gap-3 mb-4 w-full max-w-md">
                            <File className="h-10 w-10 text-primary-100" />
                            <div className="overflow-hidden">
                                <p className="truncate font-medium text-white">{file.name}</p>
                                <p className="text-sm text-gray-400">
                                    {(file.size / 1024 / 1024).toFixed(2)}MB • {file.type.split('/')[1].toUpperCase()}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-800 rounded-full p-4 border border-gray-700 mb-4">
                                <Upload className="h-8 w-8 text-primary-100" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Upload your resume</h3>
                            <p className="text-gray-400 mb-6 max-w-md">
                                Drag and drop your resume, or click to select a file. We accept PDF and Word documents (.pdf, .doc, .docx)
                            </p>
                        </>
                    )}

                    <label className="w-full max-w-xs">
                        <input
                            ref={fileInputRef} // Add the ref here
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                        />
                        <Button
                            className={`w-full ${file ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-primary-100 hover:bg-primary-200 text-black'}`}
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {file ? 'Change File' : 'Select File'}
                        </Button>
                    </label>

                    {error && (
                        <div className="flex items-center text-red-300 mt-4 p-3 bg-red-900/30 border border-red-800/30 rounded-md w-full max-w-md">
                            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {file && (
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={processResume}
                        disabled={isProcessing}
                        className="min-w-[200px] bg-primary-100 hover:bg-primary-200 text-black"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing Resume...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="h-4 w-4 mr-2" /> Analyze Resume
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}