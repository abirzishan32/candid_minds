'use client';

import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants";

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

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }

                setMessages((prev) => [...prev, newMessage]);
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

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
            vapi.off('error', onError)
        }
    }, [])

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
        const { success, id } = {
            success: true,
            id: 'feedback-id'
        }

        if (success && id){
            router.push(`/interview-main/${interviewId}/feedback`)
        }
        else{
            console.log("Error saving feedback")
            router.push('/interview-home')
        }
    }

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED){
            if (type === 'generate'){
                router.push('/interview-home')
            }
            else{
                handleGenerateFeedback(messages)
            }
        }
    }, [messages, callStatus, type, userId, interviewId, router]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        setElapsedTime(0);

        if (type === 'generate'){
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            })
        }
        else{
            let formattedQues = ''
            if (questions){
                formattedQues = questions.map((question) => ` - ${question}`).join('\n')
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQues
                }
            })
        }
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className="interview-panel">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-primary-100 font-semibold">Interview Session</div>
                    <div className="timer-display">
                        <span className="text-primary-100 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <div className="avatar-container">
                            <div className={`waveform-container ${isSpeaking ? 'speaking' : ''}`}>
                                <div className="wave-bar"></div>
                                <div className="wave-bar"></div>
                                <div className="wave-bar"></div>
                                <div className="wave-bar"></div>
                                <div className="wave-bar"></div>
                            </div>
                            <div className="avatar-badge"></div>
                        </div>
                        <h4 className="text-primary-100 text-sm mt-2">AI Interviewer</h4>
                    </div>

                    <div className="interview-divider"></div>

                    <div className="flex flex-col items-center">
                        <div className="avatar-container">
                            <Image
                                src="/me.jpeg"
                                alt="user avatar"
                                width={80}
                                height={80}
                                className="rounded-full object-cover border-2 border-gray-700 shadow-lg"
                            />
                            <div className="avatar-badge"></div>
                        </div>
                        <h4 className="text-primary-100 text-sm mt-2">{userName}</h4>
                    </div>
                </div>
            </div>

            <div className={`transcript-border transition-all ${messages.length > 0 ? 'opacity-100' : 'opacity-80'}`}>
                <div className="transcript min-h-[100px]">
                    {messages.length > 0 ? (
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    ) : (
                        <p className="text-gray-400 italic text-center">Your conversation will appear here</p>
                    )}
                </div>
            </div>

            <div className="w-full flex justify-center mt-4">
                {callStatus !== 'ACTIVE' ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !=='CONNECTING' && 'hidden')} />
                        <span>
                            {isCallInactiveOrFinished ? 'Start Interview' : 'Connecting...'}
                        </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End Interview
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent