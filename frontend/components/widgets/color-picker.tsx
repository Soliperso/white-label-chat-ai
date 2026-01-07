"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}

export function ColorPicker({ value, onChange, label, error }: ColorPickerProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  // Sync local value with prop value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleTextBlur = () => {
    // Validate hex format on blur
    if (/^#[0-9A-F]{6}$/i.test(localValue)) {
      onChange(localValue);
    } else {
      // Revert to last valid value
      setLocalValue(value);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleSwatchClick = () => {
    colorInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className={cn(error && "text-destructive")}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={localValue}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            placeholder="#000000"
            className={cn(
              "font-mono uppercase pr-12",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            maxLength={7}
          />
          <button
            type="button"
            onClick={handleSwatchClick}
            className="absolute right-1 top-1 h-8 w-8 rounded border border-input shadow-sm hover:opacity-80 transition-opacity"
            style={{ backgroundColor: /^#[0-9A-F]{6}$/i.test(localValue) ? localValue : "#000000" }}
            aria-label="Pick color"
          />
          <input
            ref={colorInputRef}
            type="color"
            value={/^#[0-9A-F]{6}$/i.test(localValue) ? localValue : "#000000"}
            onChange={handleColorPickerChange}
            className="sr-only"
            aria-hidden="true"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
