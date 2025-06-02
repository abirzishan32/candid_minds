'use client';

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import AIRobotCanvas from "./AIRobotCanvas";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
    saveResult?: boolean;
}

const VoiceAgent = ({ userName, userId, type, interviewId, questions, saveResult = true }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [isListening, setIsListening] = useState(false);

    // Typewriter effect for messages
    const [displayedMessage, setDisplayedMessage] = useState("");
    const [typewriterIndex, setTypewriterIndex] = useState(0);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1]?.content || "";
        if (latestMessage !== currentMessage) {
            setCurrentMessage(latestMessage);
            setTypewriterIndex(0);
            setDisplayedMessage("");
        }
    }, [messages]);

    // Typewriter effect
    useEffect(() => {
        if (typewriterIndex < currentMessage.length) {
            const timer = setTimeout(() => {
                setDisplayedMessage(prev => prev + currentMessage[typewriterIndex]);
                setTypewriterIndex(prev => prev + 1);
            }, 30);
            return () => clearTimeout(timer);
        }
    }, [typewriterIndex, currentMessage]);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
            setIsListening(true);
        };
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            setIsListening(false);
        };

        const onMessage = (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
                
                if (message.role === 'assistant') {
                    setIsSpeaking(true);
                    setTimeout(() => setIsSpeaking(false), 2000);
                }
            }
        };

        const onSpeechStart = () => {
            setIsSpeaking(true);
            setIsListening(false);
        };
        const onSpeechEnd = () => {
            setIsSpeaking(false);
            setIsListening(true);
        };

        const onError = (error: Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    useEffect(() => {
        if (callStatus === CallStatus.ACTIVE) {
            const intervalId = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
            setTimerId(intervalId);
        } else if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
            if (timerId) {
                clearInterval(timerId);
                setTimerId(null);
            }
            if (callStatus === CallStatus.INACTIVE) {
                setElapsedTime(0);
            }
        }

        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [callStatus]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        if (saveResult && interviewId && userId) {
            const { success, feedbackId: id } = await createFeedback({
                interviewId: interviewId,
                userId: userId,
                transcript: messages
            });

            if (success && id) {
                router.push(`/interview-main/${interviewId}/feedback`);
            } else {
                console.log("Error saving feedback");
                router.push('/interview-home');
            }
        } else {
            console.log("Mock interview completed - not saving feedback");
            router.push('/interview-home?mock=completed');
        }
    };

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === 'generate') {
                router.push('/interview-home');
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, interviewId, router, saveResult]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        setElapsedTime(0);

        if (type === 'generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            });
        } else {
            let formattedQues = '';
            if (questions) {
                formattedQues = questions.map((question) => ` - ${question}`).join('\n');
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQues
                }
            });
        }
    };

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <div className="min-h bg-black relative overflow-hidden">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            
            {/* Scanning Lines Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-scan-line" />
                <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-10 animate-scan-line-slow" />
                <div className="absolute top-2/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-15 animate-scan-line-reverse" />
            </div>

            {/* Corner Frame Elements */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-white opacity-60" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-white opacity-60" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-white opacity-60" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-white opacity-60" />

            {/* Main Container */}
            <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-none shadow-2xl relative overflow-hidden">
                        {/* Header accent line */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent" />
                        
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-12 bg-white rounded-none animate-pulse" />
                                    <div>
                                        <h1 className="text-3xl font-bold text-white tracking-wider font-mono">
                                            AI Interview System
                                        </h1>
                                        
                                    </div>
                                </div>
                                
                                {/* Status Indicators */}
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className={cn(
                                            "w-3 h-3 rounded-none animate-pulse",
                                            callStatus === 'ACTIVE' ? 'bg-green-400' : 
                                            callStatus === 'CONNECTING' ? 'bg-yellow-400' : 'bg-red-400'
                                        )} />
                                        <span className="text-white text-sm font-mono uppercase tracking-wider">
                                            [{callStatus}]
                                        </span>
                                    </div>
                                    
                                    <div className="bg-black/80 backdrop-blur-sm px-4 py-2 border border-gray-600 rounded-none">
                                        <div className="flex items-center space-x-2 text-white">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                            </svg>
                                            <span className="font-mono text-lg tracking-wider">{formatTime(elapsedTime)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Interview Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* AI Robot Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-none shadow-2xl h-full relative overflow-hidden">
                            {/* Side accent lines */}
                            <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-60" />
                            <div className="absolute right-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-30" />
                            
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white tracking-wider font-mono mb-2">
                                        AI Interviewer
                                    </h3>
                                    
                                </div>
                                
                                {/* AI Robot Canvas */}
                                <div className="relative mb-6">
                                    <AIRobotCanvas 
                                        isSpeaking={isSpeaking} 
                                        isListening={isListening}
                                        callStatus={callStatus}
                                    />
                                </div>

                                {/* AI Status */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-mono tracking-wide">Process State:</span>
                                        <span className={cn(
                                            "px-3 py-1 border text-xs font-mono uppercase tracking-wider",
                                            isSpeaking ? "bg-white/10 text-white border-white animate-pulse" :
                                            isListening ? "bg-green-500/10 text-green-400 border-green-400" :
                                            "bg-gray-700/50 text-gray-400 border-gray-600"
                                        )}>
                                            {isSpeaking ? "[SPEAKING]" : isListening ? "[LISTENING]" : "[IDLE]"}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm font-mono tracking-wide">Neural Activity:</span>
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "w-2 h-6 border",
                                                        (isSpeaking || isListening) ? "bg-white border-white animate-pulse" : "bg-gray-700 border-gray-600"
                                                    )}
                                                    style={{
                                                        animationDelay: `${i * 0.1}s`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Communication Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-none shadow-2xl h-full relative overflow-hidden">
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
                            
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white tracking-wider font-mono">
                                        Interview Interface
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 animate-pulse" />
                                        <span className="text-green-400 text-sm font-mono tracking-wide">LIVE_TRANSMISSION</span>
                                    </div>
                                </div>

                                {/* Message Display */}
                                <div className="mb-6">
                                    <div className="bg-black/80 border border-gray-600 p-6 min-h-[320px] relative overflow-hidden">
                                        {/* Terminal-style header */}
                                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-700">
                                            <div className="w-3 h-3 bg-red-500"></div>
                                            <div className="w-3 h-3 bg-yellow-500"></div>
                                            <div className="w-3 h-3 bg-green-500"></div>
                                            <span className="text-gray-400 text-xs font-mono ml-4">Terminal</span>
                                        </div>

                                        {/* Message Content */}
                                        <div className="relative z-10">
                                            {displayedMessage ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-8 h-8 bg-white border border-gray-600 flex items-center justify-center flex-shrink-0">
                                                            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-gray-800/80 border border-gray-600 p-4">
                                                                <p className="text-white leading-relaxed font-mono text-sm">
                                                                    {displayedMessage}
                                                                    {typewriterIndex < currentMessage.length && (
                                                                        <span className="animate-pulse text-white">█</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 bg-gray-800 border border-gray-600 flex items-center justify-center mx-auto mb-4">
                                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-lg font-mono text-white">Interface Ready</p>
                                                        <p className="text-sm font-mono text-gray-400">Communication Channel Established</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Terminal-style cursor in bottom corner */}
                                        <div className="absolute bottom-2 right-2 text-gray-500 font-mono text-xs">
                                            {displayedMessage ? ">" : "_"}
                                        </div>
                                    </div>
                                </div>

                                {/* Control Panel */}
                                <div className="flex justify-center">
                                    {callStatus !== 'ACTIVE' ? (
                                        <button
                                            className="group relative px-12 py-4 bg-white hover:bg-gray-200 text-black font-bold font-mono tracking-wider border-2 border-white shadow-2xl transform transition-all duration-300 hover:scale-105 uppercase"
                                            onClick={handleCall}
                                            disabled={callStatus === 'CONNECTING'}
                                        >
                                            {/* Button glow effect */}
                                            <div className="absolute -inset-1 bg-white opacity-20 group-hover:opacity-40 transition duration-300" />
                                            
                                            <div className="relative flex items-center space-x-3">
                                                {callStatus === 'CONNECTING' ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin" />
                                                        <span>INITIALIZING_NEURAL_LINK</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                                        </svg>
                                                        <span>Start Interview</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            className="group relative px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-bold font-mono tracking-wider border-2 border-red-600 shadow-2xl transform transition-all duration-300 hover:scale-105 uppercase"
                                            onClick={handleDisconnect}
                                        >
                                            <div className="absolute -inset-1 bg-red-600 opacity-20 group-hover:opacity-40 transition duration-300" />
                                            
                                            <div className="relative flex items-center space-x-3">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v6a1 1 0 11-2 0V7z" />
                                                </svg>
                                                <span>TERMINATE_SESSION</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default VoiceAgent;