"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, MessageCircle } from "lucide-react";
import type { WidgetFormData } from "./widget-form";

interface WidgetPreviewProps {
  config: Partial<WidgetFormData>;
}

export function WidgetPreview({ config }: WidgetPreviewProps) {
  const {
    name = "Chat Widget",
    welcomeMessage = "Hi! How can I help you today?",
    primaryColor = "#3B82F6",
    secondaryColor = "#1E40AF",
    mode = "light",
    showBranding = true,
  } = config;

  const isDark = mode === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const mutedTextColor = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <span className="text-sm text-muted-foreground">
          Updates in real-time
        </span>
      </div>

      <Card className="p-6 bg-muted/50">
        <div className="flex items-center justify-center min-h-[600px]">
          {/* Chat Widget Container */}
          <div
            className={`
              w-full max-w-sm h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden
              ${bgColor} ${borderColor} border-2
            `}
          >
            {/* Header */}
            <div
              className="px-4 py-4 flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{name}</h4>
                  <p className="text-white/80 text-xs">Online</p>
                </div>
              </div>
              <button className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Assistant Welcome Message */}
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div
                    className={`
                      rounded-lg rounded-tl-none px-4 py-2 inline-block max-w-[85%]
                      ${isDark ? "bg-gray-800" : "bg-gray-100"}
                    `}
                  >
                    <p className={`text-sm ${textColor}`}>{welcomeMessage}</p>
                  </div>
                  <p className={`text-xs mt-1 ${mutedTextColor}`}>Just now</p>
                </div>
              </div>

              {/* Sample User Message */}
              <div className="flex gap-2 justify-end">
                <div className="flex-1 flex justify-end">
                  <div
                    className="rounded-lg rounded-tr-none px-4 py-2 inline-block max-w-[85%]"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <p className="text-sm text-white">
                      What are your business hours?
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Assistant Response */}
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div
                    className={`
                      rounded-lg rounded-tl-none px-4 py-2 inline-block max-w-[85%]
                      ${isDark ? "bg-gray-800" : "bg-gray-100"}
                    `}
                  >
                    <p className={`text-sm ${textColor}`}>
                      We're open Monday through Friday, 9 AM to 6 PM EST. How else can I help you?
                    </p>
                  </div>
                  <p className={`text-xs mt-1 ${mutedTextColor}`}>Just now</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${borderColor}`}>
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  disabled
                  className={`
                    flex-1
                    ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : ""}
                  `}
                />
                <Button
                  size="icon"
                  disabled
                  style={{ backgroundColor: primaryColor }}
                  className="text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Branding */}
              {showBranding && (
                <div className="mt-3 text-center">
                  <p className={`text-xs ${mutedTextColor}`}>
                    Powered by <span className="font-semibold">ChatForge</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
