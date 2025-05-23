'use client';

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { difficultyColors } from "@/constants/leetcode";
import SpeechToText from "speech-to-text";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface Message {
    role: 'user' | 'assistant';
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
    const [isListening, setIsListening] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<Message[]>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userResponse, setUserResponse] = useState('');
    const [feedback, setFeedback] = useState('');
    const [interimText, setInterimText] = useState('');
    const [finalisedTexts, setFinalisedTexts] = useState<string[]>([]);

    // Speech synthesis and recognition
    const synth = useRef<SpeechSynthesis | null>(null);
    const speechToTextRef = useRef<any>(null);

    // Get difficulty styling from constants
    const difficultyStyle = difficultyColors[problemDifficulty as keyof typeof difficultyColors] ||
        { bg: "bg-gray-700", text: "text-gray-100" };

    // Setup Web Speech API for speech synthesis
    useEffect(() => {
        // Initialize speech synthesis
        if (typeof window !== 'undefined') {
            synth.current = window.speechSynthesis;

            // Define the callbacks for speech-to-text
            const onAnythingSaid = (text: string) => {
                setInterimText(text);
            };

            const onEndEvent = () => {
                setIsListening(false);
                // Auto restart if we were in listening mode
                if (isListening) {
                    setTimeout(() => {
                        try {
                            speechToTextRef.current?.startListening();
                            setIsListening(true);
                        } catch (err) {
                            console.error("Error restarting speech recognition:", err);
                        }
                    }, 300);
                }
            };

            const onFinalised = (text: string) => {
                console.log("Finalised text:", text);
                setFinalisedTexts(prev => [text, ...prev]);
                setInterimText('');
                addUserMessage(text);
            };

            try {
                // Create the speech recognition listener with the correct callbacks
                speechToTextRef.current = new SpeechToText(
                    onFinalised,
                    onEndEvent,
                    onAnythingSaid,
                    'en-US' // Language
                );
            } catch (err) {
                console.error('Error initializing speech-to-text:', err);
                setError(typeof err === 'object' && err !== null ?
                    (err as Error).message :
                    'Speech recognition could not be initialized. Please check your browser compatibility.');
            }
        }

        return () => {
            // Cleanup
            if (speechToTextRef.current) {
                try {
                    if (isListening) {
                        speechToTextRef.current.stopListening();
                    }
                } catch (e) {
                    console.log('Error stopping speech to text:', e);
                }
            }

            if (synth.current) {
                synth.current.cancel();
            }
        };
    }, []);


    // Fetch questions from Firestore
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/vapi/leetcode?slug=${problemSlug}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        setQuestions(data.data.questions);
                        console.log("Found existing questions for", problemSlug);
                        setError(null);
                    } else {
                        throw new Error(data.error || 'Failed to fetch questions');
                    }
                } else {
                    if (response.status === 404) {
                        // Generate questions if none exist
                        await generateQuestions();
                    } else {
                        throw new Error(`API returned ${response.status}: ${response.statusText}`);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching questions:', err);
                setError('Failed to load interview questions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [problemSlug, language, userId]);

    // Generate questions if not found
    const generateQuestions = async () => {
        try {
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
                throw new Error(`Failed to generate questions: ${genResponse.status}`);
            }

            const genData = await genResponse.json();

            if (genData.success) {
                const interviewQuestions = genData.interview?.questions || [];
                setQuestions(interviewQuestions);
                console.log("Generated new questions for", problemSlug);
            } else {
                throw new Error(genData.error || 'Failed to generate questions');
            }
        } catch (err: any) {
            console.error('Error generating questions:', err);
            throw err; // Re-throw to be caught by the caller
        }
    };

    // Timer effect
    useEffect(() => {
        if (callStatus === CallStatus.ACTIVE) {
            const intervalId = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
            setTimerId(intervalId);
        } else {
            if (timerId) {
                clearInterval(timerId);
                setTimerId(null);
            }

            if (callStatus === CallStatus.INACTIVE) {
                setElapsedTime(0);
            }
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [callStatus]);

    // Format time display
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Redirect after interview finished
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            router.push(`/leetcode-qna?completed=true`);
        }
    }, [callStatus, router]);

    // Speak text using Web Speech API
    const speakText = (text: string) => {
        if (synth.current) {
            // Make sure we're not listening while speaking
            stopListening();

            // Cancel any ongoing speech
            synth.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Find a good voice (preferably female)
            const voices = synth.current.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.name.includes('Samantha') || // macOS female voice
                voice.name.includes('Google UK English Female') ||
                voice.name.includes('Microsoft Zira')
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            // Events
            setIsSpeaking(true);

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
            };

            synth.current.speak(utterance);
        } else {
            console.error('Speech synthesis not available');
        }
    };

    // Start listening for user response
    const startListening = () => {
        if (speechToTextRef.current) {
            try {
                // Clear any existing interim text
                setInterimText('');

                // Start listening
                speechToTextRef.current.startListening();
                setIsListening(true);
            } catch (err) {
                console.error('Error starting speech recognition:', err);
                setError('Failed to start speech recognition. Please try again.');
            }
        } else {
            setError('Speech recognition is not available in this browser.');
        }
    };


    // Stop listening
    const stopListening = () => {
        if (speechToTextRef.current && isListening) {
            try {
                speechToTextRef.current.stopListening();
                setIsListening(false);
            } catch (err) {
                console.error('Error stopping speech recognition:', err);
            }
        }
    };

    // Handle the "Speak" button click
    const handleSpeakButtonClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Add assistant message to the conversation
    const addAssistantMessage = (text: string) => {
        const newMessage: Message = { role: 'assistant', content: text };
        setMessages(prev => [...prev, newMessage]);
        speakText(text);
    };

    // Add user message to the conversation
    const addUserMessage = (text: string) => {
        if (!text.trim()) return; // Don't add empty messages

        const newMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, newMessage]);
        setUserResponse(text);

        // Stop listening after capturing response
        stopListening();

        // Generate simple feedback
        setTimeout(() => {
            const feedback = generateSimpleFeedback();
            setFeedback(feedback);
            addAssistantMessage(feedback);

            // Proceed to next question after feedback
            setTimeout(() => {
                proceedToNextQuestion();
            }, 3000);
        }, 1000);
    };

    // Generate a simple feedback response
    const generateSimpleFeedback = () => {
        const feedbackOptions = [
            "Thanks for your answer. That's an interesting approach.",
            "Good thinking. Let's move on to the next question.",
            "I see your point. That's a valid approach to consider.",
            "Thanks for explaining your thought process.",
            "That's helpful information. Let's continue with the next question."
        ];

        return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
    };

    // Proceed to next question
    const proceedToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Move to next question
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);

            // Reset user response
            setUserResponse('');
            setFeedback('');

            // Ask the next question with a slight delay
            setTimeout(() => {
                addAssistantMessage(questions[nextIndex]);
            }, 1000);
        } else {
            // All questions have been asked
            setTimeout(() => {
                addAssistantMessage("That concludes our interview. Thank you for your responses. You did well overall.");

                // End interview after final message
                setTimeout(() => {
                    handleEndInterview();
                }, 5000);
            }, 2000);
        }
    };

    // Start interview
    const handleStartInterview = () => {
        setCallStatus(CallStatus.ACTIVE);
        setMessages([]);
        setCurrentQuestionIndex(0);
        setUserResponse('');
        setFeedback('');

        // Introduction message
        const intro = `Hello ${userName}, I'll be conducting your LeetCode interview on the "${problemTitle}" problem today. Let's start with some questions to evaluate your approach to solving this ${problemDifficulty} level problem in ${language}.`;

        addAssistantMessage(intro);

        // First question after intro (with delay)
        setTimeout(() => {
            if (questions.length > 0) {
                addAssistantMessage(questions[0]);
            }
        }, 5000);
    };

    // End interview
    const handleEndInterview = () => {
        stopListening();
        if (synth.current) synth.current.cancel();
        setCallStatus(CallStatus.FINISHED);
    };

    // Get the latest message for display
    const latestMessage = messages[messages.length - 1]?.content || '';

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-100"></div>
                <p className="ml-3 text-white">Preparing your LeetCode interview...</p>
            </div>
        );
    }

    if (error) {
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
                            <div className={`absolute -inset-1 ${isListening ? 'bg-blue-500/30 animate-pulse' : 'bg-primary-100/20'} rounded-full blur-md transition-all duration-300`}></div>
                            <div className="relative size-20 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
                                <Image
                                    src="/avatar-placeholder.png"
                                    alt="user avatar"
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-4 h-4 ${isListening ? 'bg-blue-500' : 'bg-green-500'} rounded-full border-2 border-gray-900`}></div>
                        </div>
                        <h4 className="text-white text-sm mt-3 font-medium">{userName}</h4>
                    </div>
                </div>
            </div>

            <div className="bg-black bg-opacity-60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 shadow-lg min-h-[200px] transition-all duration-500 hover:border-gray-700">
                <div className="transcript min-h-[100px] mb-4">
                    {messages.length > 0 ? (
                        <div className="space-y-4">
                            {/* Show the latest message */}
                            <div className={`${messages[messages.length - 1].role === 'assistant' ? 'bg-gray-800/50' : 'bg-blue-900/30'} p-3 rounded-lg`}>
                                <p className="text-sm text-gray-400 mb-1">
                                    {messages[messages.length - 1].role === 'assistant' ? 'AI Interviewer' : userName}:
                                </p>
                                <p className="text-white">{messages[messages.length - 1].content}</p>
                            </div>

                            {/* Show interim text while user is speaking */}
                            {isListening && interimText && (
                                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                                    <p className="text-sm text-gray-400 mb-1">{userName} (speaking):</p>
                                    <p className="text-blue-200 italic">{interimText}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center">
                            {callStatus === CallStatus.ACTIVE
                                ? "Your conversation will appear here"
                                : "The AI interviewer will ask you questions about the LeetCode problem and evaluate your approach"}
                        </p>
                    )}
                </div>

                {/* Microphone status and "Speak Now" button */}
                {callStatus === CallStatus.ACTIVE && (
                    <div className="flex items-center justify-center flex-col space-y-4">
                        <div className={`text-center text-sm ${isListening ? 'text-blue-400' : 'text-gray-500'}`}>
                            {isListening ? (
                                <div className="flex items-center justify-center">
                                    <span className="animate-pulse mr-2">●</span> Listening...
                                </div>
                            ) : isSpeaking ? (
                                <div>AI is speaking...</div>
                            ) : (
                                <div>Click "Speak" to answer</div>
                            )}
                        </div>

                        {/* Speak Now button - only show when AI isn't speaking */}
                        {!isSpeaking && (
                            <Button
                                className={`rounded-full px-6 py-2 shadow-lg transition-all duration-300 ${isListening
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                onClick={handleSpeakButtonClick}
                            >
                                {isListening ? 'Stop' : 'Speak Now'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full flex justify-center mt-6">
                {callStatus !== CallStatus.ACTIVE ? (
                    <Button
                        className="relative px-8 py-3 bg-gradient-to-r from-primary-100 to-primary-200 text-black font-bold rounded-lg shadow-lg hover:shadow-primary-100/30 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleStartInterview}
                        disabled={loading || questions.length === 0}
                    >
                        Start LeetCode Interview
                    </Button>
                ) : (
                    <Button
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleEndInterview}
                    >
                        End Interview
                    </Button>
                )}
            </div>

            {questions.length > 0 && (
                <div className="mt-8 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-medium">Interview Progress</h3>
                        <p className="text-gray-400 text-sm">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 py-3">
                        {questions.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                                    index === currentQuestionIndex && callStatus === CallStatus.ACTIVE
                                        ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900"
                                        : index < currentQuestionIndex
                                            ? "bg-green-700/70 text-white"
                                            : "bg-gray-700/50 text-gray-400"
                                )}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>

                    {callStatus === CallStatus.ACTIVE && (
                        <div className="mt-4 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400 mb-1">Current Question:</p>
                            <p className="text-blue-300">{questions[currentQuestionIndex]}</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default LeetCodeVoiceAgent;