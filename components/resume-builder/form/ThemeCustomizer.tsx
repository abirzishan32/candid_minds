"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ThemeCustomizer: React.FC = () => {
  const { theme, updateTheme } = useTheme();

  const handleColorChange = (color: string, type: 'primary' | 'background' | 'text' | 'accent') => {
    updateTheme({ ...theme, colors: { ...theme.colors, [type]: color } });
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Colors</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-400">Primary Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-8 h-8 p-0 border border-gray-700"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker 
                    color={theme.colors.primary} 
                    onChange={(color) => handleColorChange(color, 'primary')} 
                  />
                </PopoverContent>
              </Popover>
              <Input 
                value={theme.colors.primary} 
                onChange={(e) => handleColorChange(e.target.value, 'primary')}
                className="h-8 text-xs bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-gray-400">Accent Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-8 h-8 p-0 border border-gray-700"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker 
                    color={theme.colors.accent} 
                    onChange={(color) => handleColorChange(color, 'accent')} 
                  />
                </PopoverContent>
              </Popover>
              <Input 
                value={theme.colors.accent} 
                onChange={(e) => handleColorChange(e.target.value, 'accent')}
                className="h-8 text-xs bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Typography</h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">Font Size</Label>
            <div className="flex items-center gap-2">
              <Slider 
                value={[theme.typography.fontSize]} 
                min={12}
                max={18}
                step={1}
                onValueChange={(value) => updateTheme({ 
                  ...theme, 
                  typography: { ...theme.typography, fontSize: value[0] } 
                })}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-6">{theme.typography.fontSize}px</span>
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-gray-400">Line Height</Label>
            <div className="flex items-center gap-2">
              <Slider 
                value={[theme.typography.lineHeight]} 
                min={1.0}
                max={2.0}
                step={0.1}
                onValueChange={(value) => updateTheme({ 
                  ...theme, 
                  typography: { ...theme.typography, lineHeight: value[0] } 
                })}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-6">{theme.typography.lineHeight}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Spacing</h3>
        
        <div>
          <Label className="text-xs text-gray-400">Section Spacing</Label>
          <div className="flex items-center gap-2">
            <Slider 
              value={[theme.spacing.sectionGap]} 
              min={8}
              max={32}
              step={2}
              onValueChange={(value) => updateTheme({ 
                ...theme, 
                spacing: { ...theme.spacing, sectionGap: value[0] } 
              })}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-6">{theme.spacing.sectionGap}px</span>
          </div>
        </div>
      </div>

      {/* Other */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Other Options</h3>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400">Show Borders</Label>
          <Switch 
            checked={theme.showBorders}
            onCheckedChange={(checked) => updateTheme({ ...theme, showBorders: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400">Show Shadows</Label>
          <Switch 
            checked={theme.showShadows}
            onCheckedChange={(checked) => updateTheme({ ...theme, showShadows: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 