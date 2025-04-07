import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SuggestionCardProps {
    suggestion: {
        title: string;
        description: string;
        before?: string;
        after?: string;
        priority?: 'high' | 'medium' | 'low';
    };
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
    const [expanded, setExpanded] = useState(suggestion.priority === 'high');

    const priorityColors = {
        high: 'border-red-800/50 bg-red-900/20',
        medium: 'border-amber-800/50 bg-amber-900/20',
        low: 'border-blue-800/50 bg-blue-900/20'
    };

    const priorityTextColors = {
        high: 'text-red-400',
        medium: 'text-amber-400',
        low: 'text-blue-400'
    };

    const priorityBadgeColors = {
        high: 'bg-red-900/40 text-red-300 border-red-800/30',
        medium: 'bg-amber-900/40 text-amber-300 border-amber-800/30',
        low: 'bg-blue-900/40 text-blue-300 border-blue-800/30'
    };

    return (
        <div className={`border rounded-lg overflow-hidden ${
            suggestion.priority
                ? priorityColors[suggestion.priority]
                : 'border-gray-800 bg-black/30'
        }`}>
            <div
                className="p-4 flex justify-between items-start cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-white">{suggestion.title}</h5>
                        {suggestion.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadgeColors[suggestion.priority]}`}>
                {suggestion.priority === 'high' ? 'Critical' :
                    suggestion.priority === 'medium' ? 'Important' : 'Suggested'}
              </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm">{suggestion.description}</p>
                </div>
                <div className="ml-3 flex-shrink-0">
                    {expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>

            {expanded && suggestion.before && suggestion.after && (
                <div className="p-4 border-t border-gray-800 bg-black/40">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 p-3 bg-black/50 border border-gray-800 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Before</div>
                            <p className="text-gray-400 text-sm whitespace-pre-line">{suggestion.before}</p>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="hidden md:flex items-center justify-center bg-gray-900 rounded-full p-1 text-primary-100">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                            <div className="md:hidden flex items-center justify-center w-full">
                                <div className="border-t border-gray-800 flex-grow"></div>
                                <div className="mx-2 text-gray-500">↓</div>
                                <div className="border-t border-gray-800 flex-grow"></div>
                            </div>
                        </div>

                        <div className="flex-1 p-3 bg-black/50 border border-primary-900/50 rounded-lg">
                            <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-primary-100" />
                                <div className="text-xs text-primary-200 mb-1">After (Suggested)</div>
                            </div>
                            <p className="text-white text-sm whitespace-pre-line">{suggestion.after}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}