'use client';

import Image from "next/image";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import { vapi } from '@/lib/vapi.sdk';
import {interviewer} from "@/constants";
import {createFeedback} from "@/lib/actions/general.action";

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
        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages

        })

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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg mb-5">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-white font-semibold tracking-wide">Interview Session</div>
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
                                    src="/me.jpeg"
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
                        <p className="text-gray-500 italic text-center">Your conversation will appear here</p>
                    )}
                </div>
            </div>

            <div className="w-full flex justify-center mt-6">
                {callStatus !== 'ACTIVE' ? (
                    <button
                        className="relative px-8 py-3 bg-gradient-to-r from-primary-100 to-primary-200 text-black font-bold rounded-lg shadow-lg hover:shadow-primary-100/30 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleCall}
                    >
                        <span className={cn('absolute inset-0 rounded-lg bg-primary-100/50 animate-ping opacity-75', callStatus !=='CONNECTING' && 'hidden')} />
                        <span>
                            {isCallInactiveOrFinished ? 'Start Interview' : 'Connecting...'}
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
        </>
    )
}

export default Agent