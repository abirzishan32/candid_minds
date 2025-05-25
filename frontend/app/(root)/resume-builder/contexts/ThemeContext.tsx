"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    fontSize: number;
    lineHeight: number;
  };
  spacing: {
    sectionGap: number;
  };
  showBorders: boolean;
  showShadows: boolean;
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (theme: Partial<Theme>) => void;
  getFontSizeClass: () => string;
  getLineHeightClass: () => string;
}

const defaultTheme: Theme = {
  colors: {
    primary: "#3b82f6",
    background: "#ffffff",
    text: "#333333",
    accent: "#8b5cf6",
  },
  typography: {
    fontSize: 14,
    lineHeight: 1.5,
  },
  spacing: {
    sectionGap: 16,
  },
  showBorders: true,
  showShadows: true,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  getFontSizeClass: () => "",
  getLineHeightClass: () => "",
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const updateTheme = (newThemeValues: Partial<Theme>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newThemeValues,
      colors: {
        ...prevTheme.colors,
        ...(newThemeValues.colors || {})
      },
      typography: {
        ...prevTheme.typography,
        ...(newThemeValues.typography || {})
      },
      spacing: {
        ...prevTheme.spacing,
        ...(newThemeValues.spacing || {})
      }
    }));
  };

  const getFontSizeClass = (): string => {
    const fontSize = theme.typography.fontSize;
    
    if (fontSize <= 12) return "text-xs";
    if (fontSize <= 14) return "text-sm";
    if (fontSize <= 16) return "text-base";
    if (fontSize <= 18) return "text-lg";
    return "text-xl";
  };

  const getLineHeightClass = (): string => {
    const lineHeight = theme.typography.lineHeight;
    
    if (lineHeight <= 1.2) return "leading-tight";
    if (lineHeight <= 1.5) return "leading-normal";
    if (lineHeight <= 1.8) return "leading-relaxed";
    return "leading-loose";
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, getFontSizeClass, getLineHeightClass }}>
      {children}
    </ThemeContext.Provider>
  );
}; 