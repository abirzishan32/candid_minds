'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ZodNullableType } from 'zod';

interface AIRobotCanvasProps {
    isSpeaking: boolean;
    isListening: boolean;
    callStatus: string;
}

const AIRobotCanvas: React.FC<AIRobotCanvasProps> = ({ isSpeaking, isListening, callStatus }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);
    const [eyeBlinkTimer, setEyeBlinkTimer] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawRobot = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const time = Date.now() * 0.005;

            // Robot head (main circle)
            const headRadius = 80;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, headRadius);
            
            if (callStatus === 'ACTIVE') {
                gradient.addColorStop(0, isSpeaking ? '#8B5CF6' : isListening ? '#3B82F6' : '#6366F1');
                gradient.addColorStop(0.7, isSpeaking ? '#7C3AED' : isListening ? '#2563EB' : '#4F46E5');
                gradient.addColorStop(1, '#1E1B4B');
            } else {
                gradient.addColorStop(0, '#4B5563');
                gradient.addColorStop(0.7, '#374151');
                gradient.addColorStop(1, '#1F2937');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, headRadius, 0, Math.PI * 2);
            ctx.fill();

            // Outer glow effect when active
            if (callStatus === 'ACTIVE') {
                ctx.shadowColor = isSpeaking ? '#8B5CF6' : isListening ? '#3B82F6' : '#6366F1';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(centerX, centerY, headRadius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = isSpeaking ? 'rgba(139, 92, 246, 0.3)' : isListening ? 'rgba(59, 130, 246, 0.3)' : 'rgba(99, 102, 241, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Eyes
            const eyeY = centerY - 15;
            const eyeRadius = eyeBlinkTimer > 0 ? 2 : 8;
            
            // Left eye
            ctx.fillStyle = callStatus === 'ACTIVE' ? '#FFFFFF' : '#9CA3AF';
            ctx.beginPath();
            ctx.arc(centerX - 25, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Right eye
            ctx.beginPath();
            ctx.arc(centerX + 25, eyeY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Eye pupils (only when eyes are open)
            if (eyeBlinkTimer <= 0) {
                ctx.fillStyle = '#1F2937';
                ctx.beginPath();
                ctx.arc(centerX - 25, eyeY, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(centerX + 25, eyeY, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Mouth/Speaker area
            const mouthY = centerY + 20;
            if (isSpeaking) {
                // Animated speaking mouth
                const mouthWidth = 30 + Math.sin(time * 8) * 10;
                const mouthHeight = 8 + Math.sin(time * 12) * 4;
                
                ctx.fillStyle = '#1F2937';
                ctx.beginPath();
                ctx.ellipse(centerX, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                // Sound waves
                for (let i = 1; i <= 3; i++) {
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.6 - i * 0.15})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(centerX, mouthY, 20 + i * 15 + Math.sin(time * 6) * 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else if (isListening) {
                // Listening indicator (microphone-like)
                ctx.fillStyle = '#3B82F6';
                ctx.beginPath();
                ctx.roundRect(centerX - 8, mouthY - 8, 16, 16, 4);
                ctx.fill();

                // Audio input visualization
                for (let i = 0; i < 5; i++) {
                    const barHeight = 4 + Math.sin(time * 4 + i) * 3;
                    ctx.fillStyle = `rgba(59, 130, 246, ${0.8 - i * 0.1})`;
                    ctx.fillRect(centerX - 10 + i * 5, mouthY + 12, 2, barHeight);
                }
            } else {
                // Neutral mouth
                ctx.strokeStyle = callStatus === 'ACTIVE' ? '#8B5CF6' : '#6B7280';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(centerX, mouthY, 12, 0, Math.PI);
                ctx.stroke();
            }

            // Antenna/Neural connections
            const antennaTop = centerY - headRadius - 20;
            ctx.strokeStyle = callStatus === 'ACTIVE' ? '#8B5CF6' : '#6B7280';
            ctx.lineWidth = 3;
            
            // Left antenna
            ctx.beginPath();
            ctx.moveTo(centerX - 30, centerY - headRadius + 10);
            ctx.quadraticCurveTo(centerX - 40, antennaTop, centerX - 35, antennaTop - 10);
            ctx.stroke();

            // Right antenna
            ctx.beginPath();
            ctx.moveTo(centerX + 30, centerY - headRadius + 10);
            ctx.quadraticCurveTo(centerX + 40, antennaTop, centerX + 35, antennaTop - 10);
            ctx.stroke();

            // Antenna tips (glowing when active)
            if (callStatus === 'ACTIVE') {
                ctx.fillStyle = isSpeaking ? '#F59E0B' : isListening ? '#10B981' : '#8B5CF6';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10;
                
                ctx.beginPath();
                ctx.arc(centerX - 35, antennaTop - 10, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(centerX + 35, antennaTop - 10, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
            }

            // Circuit pattern on head
            if (callStatus === 'ACTIVE') {
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
                ctx.lineWidth = 1;
                
                // Horizontal lines
                for (let i = 0; i < 3; i++) {
                    const y = centerY - 30 + i * 20;
                    ctx.beginPath();
                    ctx.moveTo(centerX - 50, y);
                    ctx.lineTo(centerX + 50, y);
                    ctx.stroke();
                }

                // Vertical lines
                for (let i = 0; i < 3; i++) {
                    const x = centerX - 30 + i * 30;
                    ctx.beginPath();
                    ctx.moveTo(x, centerY - 40);
                    ctx.lineTo(x, centerY + 40);
                    ctx.stroke();
                }
            }

            // Update blink timer
            setEyeBlinkTimer(prev => Math.max(0, prev - 1));
        };

        const animate = () => {
            drawRobot();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Blink every 3-5 seconds
        const blinkInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                setEyeBlinkTimer(10); // Blink for 10 frames
            }
        }, 100);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            clearInterval(blinkInterval);
        };
    }, [isSpeaking, isListening, callStatus, eyeBlinkTimer]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={250}
                height={250}
                className="w-full h-auto max-w-[250px] mx-auto"
            />
            
            {/* Status overlay */}
            <div className="absolute bottom-0 left-0 right-0 text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    isSpeaking ? 'bg-purple-500/20 text-purple-300' :
                    isListening ? 'bg-blue-500/20 text-blue-300' :
                    callStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                        isSpeaking ? 'bg-purple-400 animate-pulse' :
                        isListening ? 'bg-blue-400 animate-pulse' :
                        callStatus === 'ACTIVE' ? 'bg-green-400' :
                        'bg-gray-400'
                    }`} />
                    {isSpeaking ? 'Neural Processing' : 
                     isListening ? 'Audio Reception' : 
                     callStatus === 'ACTIVE' ? 'Online' : 'Standby'}
                </div>
            </div>
        </div>
    );
};

export default AIRobotCanvas;