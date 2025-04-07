"use client";

import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
    score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate the score from 0 to the actual score
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);

        return () => clearTimeout(timer);
    }, [score]);

    // Calculate the gradient color based on the score
    const getColor = (score: number) => {
        if (score >= 90) return '#10b981'; // green-500
        if (score >= 70) return '#3b82f6'; // blue-500
        if (score >= 50) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    const color = getColor(score);
    const percentageToRadians = (percentage: number) => {
        // Convert percentage to radians (0-100 to 0-π)
        return (percentage / 100) * Math.PI;
    };

    // Calculate the arc path for the gauge
    const gaugeRadius = 70;
    const gaugeThickness = 12;
    const gaugeStartAngle = Math.PI;
    const gaugeEndAngle = 2 * Math.PI;

    const scoreAngle = gaugeStartAngle + percentageToRadians(animatedScore);
    const centerX = gaugeRadius;
    const centerY = gaugeRadius;

    // Calculate the points for the arc
    const startX = centerX + gaugeRadius * Math.cos(gaugeStartAngle);
    const startY = centerY + gaugeRadius * Math.sin(gaugeStartAngle);
    const scoreX = centerX + gaugeRadius * Math.cos(scoreAngle);
    const scoreY = centerY + gaugeRadius * Math.sin(scoreAngle);

    // Create the arc path
    const largeArcFlag = animatedScore > 50 ? 1 : 0;
    const scorePath = `
    M ${startX} ${startY}
    A ${gaugeRadius} ${gaugeRadius} 0 ${largeArcFlag} 1 ${scoreX} ${scoreY}
  `;

    return (
        <div className="relative">
            <svg width={gaugeRadius * 2} height={gaugeRadius * 2} className="transform rotate-180">
                {/* Background arc */}
                <path
                    d={`
            M ${startX} ${startY}
            A ${gaugeRadius} ${gaugeRadius} 0 1 1 ${centerX + gaugeRadius * Math.cos(gaugeEndAngle)} ${centerY + gaugeRadius * Math.sin(gaugeEndAngle)}
          `}
                    stroke="#334155" // slate-700
                    strokeWidth={gaugeThickness}
                    fill="none"
                />

                {/* Score arc */}
                <path
                    d={scorePath}
                    stroke={color}
                    strokeWidth={gaugeThickness}
                    fill="none"
                    strokeLinecap="round"
                    style={{ transition: 'all 1s ease-out' }}
                />

                {/* Center point for reference */}
                <circle cx={centerX} cy={centerY} r={gaugeRadius - gaugeThickness - 4} fill="transparent" />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-180">
                <div className="transform rotate-180">
                    <div className="text-3xl font-bold text-white">{animatedScore}</div>
                    <div className="text-xs text-gray-400 text-center">Resume Score</div>
                </div>
            </div>
        </div>
    );
}