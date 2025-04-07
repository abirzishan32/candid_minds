"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCcw, ChevronDown, ChevronUp, Award, AlertTriangle, Lightbulb, FileText, CheckCircle, MessageSquare, Download } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SuggestionCard from './SuggestionCard';
import { Badge } from '@/components/ui/badge';

interface ResumeResultsProps {
    results: ResumeAnalysisResult;
    onReset: () => void;
}

export default function ResumeResults({ results, onReset }: ResumeResultsProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
        if (expandedSection === sectionId) {
            setExpandedSection(null);
        } else {
            setExpandedSection(sectionId);
        }
    };

    const downloadRecommendations = () => {
        // Create a text summary of the recommendations
        let content = `# Resume Analysis Report\n\n`;
        content += `Overall Score: ${results.overallScore}/100\n\n`;

        // Add section scores
        content += `## Section Scores\n`;
        Object.entries(results.sectionScores).forEach(([section, score]) => {
            content += `- ${section}: ${score}/100\n`;
        });

        content += `\n## Strengths\n`;
        results.strengths.forEach(strength => {
            content += `- ${strength}\n`;
        });

        content += `\n## Areas for Improvement\n`;
        results.improvements.forEach(item => {
            content += `- ${item.title}\n  ${item.description}\n`;
        });

        content += `\n## Specific Suggestions\n`;
        results.suggestions.forEach(suggestion => {
            content += `### ${suggestion.title}\n`;
            content += `${suggestion.description}\n`;
            if (suggestion.before) content += `Before: ${suggestion.before}\n`;
            if (suggestion.after) content += `After: ${suggestion.after}\n\n`;
        });

        // Create and download the file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume-checker-recommendations.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
            {/* Header section with overall score */}
            <div className="p-6 md:p-8 border-b border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-white mb-1">Resume Analysis Complete</h3>
                    <p className="text-gray-400">
                        Your resume was analyzed across {Object.keys(results.sectionScores).length} key areas.
                        Here's how it scored:
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <ScoreGauge score={results.overallScore} />
                    <div className="mt-2 flex gap-2">
                        <Button
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            onClick={onReset}
                        >
                            <RefreshCcw className="h-4 w-4 mr-2" /> Analyze New Resume
                        </Button>
                        <Button
                            className="bg-primary-100 hover:bg-primary-200 text-black"
                            onClick={downloadRecommendations}
                        >
                            <Download className="h-4 w-4 mr-2" /> Save Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 border-b border-gray-800 rounded-none bg-gray-900">
                    <TabsTrigger value="overview" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-100 data-[state=active]:bg-transparent data-[state=active]:text-primary-100">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-100 data-[state=active]:bg-transparent data-[state=active]:text-primary-100">
                        Section Analysis
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-100 data-[state=active]:bg-transparent data-[state=active]:text-primary-100">
                        Suggestions
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <Award className="h-5 w-5 text-green-400 mr-2" />
                                <h4 className="text-xl font-medium text-white">Strengths</h4>
                            </div>

                            <ul className="space-y-3 text-gray-300">
                                {results.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Areas to Improve */}
                        <div className="bg-black/30 border border-gray-800 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
                                <h4 className="text-xl font-medium text-white">Areas to Improve</h4>
                            </div>

                            <ul className="space-y-4">
                                {results.improvements.map((item, index) => (
                                    <li key={index} className="text-gray-300">
                                        <p className="font-medium text-amber-300">{item.title}</p>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="mt-6 bg-black/30 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
                                <h4 className="text-xl font-medium text-white">Keywords & Skills Analysis</h4>
                            </div>
                            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800/30">
                                ATS Optimization
                            </Badge>
                        </div>

                        <div className="text-gray-300">
                            <p className="mb-3">The following keywords were detected in your resume:</p>
                            <div className="flex flex-wrap gap-2">
                                {results.keywords.map((keyword, index) => (
                                    <Badge key={index} className="bg-gray-800 text-gray-300 border-gray-700">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>

                            {results.missedKeywords && results.missedKeywords.length > 0 && (
                                <>
                                    <p className="mt-4 mb-3">Consider adding these relevant keywords:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {results.missedKeywords.map((keyword, index) => (
                                            <Badge key={index} className="bg-amber-900/30 text-amber-300 border-amber-800/30">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Section Analysis Tab */}
                <TabsContent value="sections" className="p-6 md:p-8">
                    <div className="space-y-4">
                        {Object.entries(results.sectionScores).map(([section, score]) => (
                            <div
                                key={section}
                                className="bg-black/30 border border-gray-800 rounded-lg overflow-hidden"
                            >
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer"
                                    onClick={() => toggleSection(section)}
                                >
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                        <h4 className="font-medium text-white">{section}</h4>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            <div
                                                className="h-2 w-16 bg-gray-800 rounded-full overflow-hidden"
                                                title={`Score: ${score}/100`}
                                            >
                                                <div
                                                    className={`h-full rounded-full ${
                                                        score >= 80 ? 'bg-green-500' :
                                                            score >= 60 ? 'bg-blue-500' :
                                                                score >= 40 ? 'bg-amber-500' :
                                                                    'bg-red-500'
                                                    }`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-2 text-gray-300 text-sm">{score}/100</span>
                                        </div>
                                        {expandedSection === section ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>
                                </div>

                                {expandedSection === section && results.sectionFeedback && results.sectionFeedback[section] && (
                                    <div className="p-4 border-t border-gray-800 bg-black/20">
                                        <p className="text-gray-300">{results.sectionFeedback[section]}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Suggestions Tab */}
                <TabsContent value="suggestions" className="p-6 md:p-8">
                    <div className="flex items-center mb-6">
                        <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
                        <h4 className="text-xl font-medium text-white">Improvement Suggestions</h4>
                    </div>

                    <div className="space-y-6">
                        {results.suggestions.map((suggestion, index) => (
                            <SuggestionCard key={index} suggestion={suggestion} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}