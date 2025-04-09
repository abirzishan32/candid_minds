import React from 'react';

interface ScrollAreaProps {
  className?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  className = '',
  children,
  maxHeight = '400px'
}) => {
  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}; 