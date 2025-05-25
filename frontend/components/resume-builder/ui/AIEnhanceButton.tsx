"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface AiEnhanceButtonProps {
  onEnhance: () => Promise<void>;
  isDisabled?: boolean;
}

const AiEnhanceButton = ({ onEnhance, isDisabled = false }: AiEnhanceButtonProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleClick = async () => {
    try {
      setIsEnhancing(true);
      await onEnhance();
    } catch (error) {
      console.error('Error enhancing content:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClick}
            disabled={isDisabled || isEnhancing}
            className={`text-primary-100 hover:text-primary-200 hover:bg-primary-100/10 relative ${
              isEnhancing ? 'opacity-70' : ''
            }`}
          >
            {isEnhancing ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : (
              <Sparkles size={16} className="mr-1" />
            )}
            <span>Enhance</span>
            {!isEnhancing && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-100 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-100"></span>
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enhance with AI for better ATS score</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AiEnhanceButton;