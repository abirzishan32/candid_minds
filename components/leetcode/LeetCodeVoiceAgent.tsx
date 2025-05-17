'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from '@/lib/vapi.sdk';
import { Button } from "../ui/button";
import { difficultyColors, leetcodeInterviewer } from "@/constants/leetcode";

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

interface LeetCodeVoiceAgentProps {
    userName: string;
    userId: string;
    problemSlug: string;
    problemTitle: string;
    problemDifficulty: string;
    language?: string;
}

const LeetCodeVoiceAgent = ({
    userName,
    userId,
    problemSlug,
    problemTitle,
    problemDifficulty,
    language = 'C++'
}: LeetCodeVoiceAgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get difficulty styling from constants
    const difficultyStyle = difficultyColors[problemDifficulty as keyof typeof difficultyColors] || 
        { bg: "bg-gray-700", text: "text-gray-100" };

    // Fetch questions for this leetcode problem
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);

                // First, try to get existing questions
                const response = await fetch(`/api/vapi/leetcode?slug=${problemSlug}`);

                // Check if response is OK before trying to parse JSON
                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        // Found existing questions
                        setQuestions(data.data.questions);
                        console.log("Found existing questions for", problemSlug);
                        setError(null);
                    } else {
                        // This shouldn't happen if response is OK, but just in case
                        throw new Error(data.error || 'Failed to fetch questions');
                    }
                } else {
                    // If not found (404), this is expected - we'll generate new ones in handleCall
                    if (response.status === 404) {
                        console.log("No existing questions found - will generate on interview start");
                        setError(null);
                    } else {
                        // For other error status codes, throw an error
                        throw new Error(`API returned ${response.status}: ${response.statusText}`);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching questions:', err);
                // Don't show an error to the user here - we'll generate questions when they click Start Interview
                console.log('Will attempt to generate questions on interview start');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [problemSlug, language, userId]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = {
                    role: message.role as 'user' | 'system' | 'assistant',
                    content: message.transcript
                };
                setMessages((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            console.log('Error', error);
            setError(error.message || 'An error occurred during the interview');
        };

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
        }
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

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            router.push(`/leetcode-qna?completed=true`);
        }
    }, [callStatus, router]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        setElapsedTime(0);
        setError(null);

        try {
            // Always try to generate or fetch questions before starting the interview
            const genResponse = await fetch('/api/vapi/leetcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemSlug,
                    language,
                    userid: userId
                }),
            });

            if (!genResponse.ok) {
                throw new Error(`Failed to prepare interview: ${genResponse.status}`);
            }

            const genData = await genResponse.json();

            if (!genData.success) {
                throw new Error(genData.error || 'Failed to prepare interview');
            }

            // Now we have questions, either from DB or newly generated
            const interviewQuestions = genData.interview?.questions || [];
            setQuestions(interviewQuestions);

            if (interviewQuestions.length === 0) {
                throw new Error('No questions were generated for the interview');
            }

            // Format questions for the interviewer
            const formattedQuestions = interviewQuestions.map((q: string, i: number) => `${i+1}. ${q}`).join('\n');

// Create a system prompt with interview details
const systemPrompt = `You are a technical interviewer specializing in LeetCode problems. You're conducting an interview about the problem "${problemTitle}" (${problemDifficulty} difficulty).
                
Your goal is to evaluate the candidate's:
- Understanding of the problem
- Solution approach and algorithm design
- Time and space complexity analysis
- Edge case handling
- Code implementation knowledge in ${language}

Ask these questions one by one, listening carefully to the candidate's responses:
${formattedQuestions}

Guidelines:
- Start by introducing yourself and mentioning the problem.
- Ask one question at a time and wait for a response.
- Provide specific, constructive feedback after each answer.
- Be technically precise but encouraging.
- If the candidate is struggling, offer hints without giving full solutions.
- At the end, provide a summary of their performance with specific strengths and areas for improvement.`;

            // Start conversation with direct assistant message
           await vapi.start({
    // Voice configuration
    voice: {
        provider: "11labs", 
        voiceId: "echo", // Professional voice
    },
    // Model configuration
    model: {
        provider: "openai",
        model: "gpt-4", // Good for technical content
        messages: [
            {
                role: "system",
                content: systemPrompt
            }
        ]
    },
    // Transcription configuration
    transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
    },
    // First message to say
    firstMessage: `Hello ${userName}, I'll be conducting your LeetCode interview on the "${problemTitle}" problem today. Let's start with some questions to evaluate your approach to solving this ${problemDifficulty} level problem in ${language}. Are you ready?`
});
            
        } catch (err: any) {
            console.error("Error starting LeetCode interview:", err);
            setError(err.message || "Failed to start interview");
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-100"></div>
                <p className="ml-3 text-white">Preparing your LeetCode interview...</p>
            </div>
        );
    }

    if (error && callStatus === CallStatus.INACTIVE) {
        return (
            <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold text-white mb-3">Error</h3>
                <p className="text-red-200 mb-4">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg mb-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-white font-semibold tracking-wide">
                        LeetCode Interview: {problemTitle}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                            {problemDifficulty}
                        </span>
                    </div>
                    <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full">
                        <span className="text-primary-100 text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center my-6">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className={`absolute -inset-1 ${isSpeaking ? 'bg-primary-100/30 animate-pulse' : 'bg-gray-800/50'} rounded-full blur-md transition-all duration-300`}></div>
                            <div className={`relative waveform-container ${isSpeaking ? 'speaking' : ''} size-20 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 shadow-inner`}>
                                <div className="wave-bar bg-primary-100"></div>
                                <div className="wave-bar bg-primary-100"></div>
                                <div className="wave-bar bg-primary-100"></div>
                                <div className="wave-bar bg-primary-100"></div>
                                <div className="wave-bar bg-primary-100"></div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <h4 className="text-white text-sm mt-3 font-medium">AI Interviewer</h4>
                    </div>

                    <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-primary-100/20 rounded-full blur-md"></div>
                            <div className="relative size-20 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
                                <Image
                                    src="/avatar-placeholder.png" // Fixed image path to use default avatar 
                                    alt="user avatar"
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <h4 className="text-white text-sm mt-3 font-medium">{userName}</h4>
                    </div>
                </div>
            </div>

            <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg min-h-[120px] transition-all duration-500 hover:border-gray-700">
                <div className="transcript min-h-[100px]">
                    {messages.length > 0 ? (
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0 text-white', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    ) : (
                        <p className="text-gray-500 italic text-center">
                            {callStatus === CallStatus.ACTIVE
                                ? "Your conversation will appear here"
                                : "The AI interviewer will ask you questions about the LeetCode problem and evaluate your approach"}
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full flex justify-center mt-6">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className="relative px-8 py-3 bg-gradient-to-r from-primary-100 to-primary-200 text-black font-bold rounded-lg shadow-lg hover:shadow-primary-100/30 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleCall}
                        disabled={loading}
                    >
                        <span className={cn('absolute inset-0 rounded-lg bg-primary-100/50 animate-ping opacity-75', callStatus !== CallStatus.CONNECTING && 'hidden')} />
                        <span>
                            {isCallInactiveOrFinished ? 'Start LeetCode Interview' : 'Connecting...'}
                        </span>
                    </button>
                ) : (
                    <button
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleDisconnect}
                    >
                        End Interview
                    </button>
                )}
            </div>

            {questions.length > 0 && (
                <div className="mt-8 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-white font-medium mb-3">Questions for this Interview:</h3>
                    <ul className="space-y-2 text-gray-300">
                        {questions.map((q, index) => (
                            <li key={index} className="flex">
                                <span className="text-primary-100 mr-2">{index + 1}.</span>
                                <span>{q}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default LeetCodeVoiceAgent;