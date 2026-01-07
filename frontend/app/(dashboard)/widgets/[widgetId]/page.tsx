"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetForm, type WidgetFormData } from "@/components/widgets/widget-form";
import { WidgetPreview } from "@/components/widgets/widget-preview";
import { WidgetNav } from "@/components/widgets/widget-nav";
import { useWidget, useUpdateWidget } from "@/hooks/use-widgets";
import type { UpdateWidgetDto } from "@/types";

export default function WidgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const widgetId = params.widgetId as string;

  const { data: widget, isLoading, isError } = useWidget(widgetId);
  const { mutateAsync: updateWidget, isPending } = useUpdateWidget();

  const [previewConfig, setPreviewConfig] = React.useState<Partial<WidgetFormData>>({});

  const handleUpdate = async (data: WidgetFormData) => {
    try {
      const dto: UpdateWidgetDto = {
        name: data.name,
        theme: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          mode: data.mode,
        },
        config: {
          welcomeMessage: data.welcomeMessage || "Hi! How can I help you today?",
          placeholderText: "Type your message...",
          position: data.position,
          autoOpenDelay: null,
          showBranding: data.showBranding,
        },
      };

      await updateWidget({ id: widgetId, dto });
      toast.success("Widget updated successfully!");
    } catch (error) {
      toast.error("Failed to update widget");
      console.error("Error updating widget:", error);
    }
  };

  const handleAutoSave = async (data: WidgetFormData) => {
    const dto: UpdateWidgetDto = {
      name: data.name,
      theme: {
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        mode: data.mode,
      },
      config: {
        welcomeMessage: data.welcomeMessage || "Hi! How can I help you today?",
        placeholderText: "Type your message...",
        position: data.position,
        autoOpenDelay: null,
        showBranding: data.showBranding,
      },
    };

    await updateWidget({ id: widgetId, dto });
  };

  const handleFormChange = (data: Partial<WidgetFormData>) => {
    setPreviewConfig(data);
  };

  const handleBack = () => {
    router.push("/widgets");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (isError || !widget) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold">Widget Not Found</h2>
          <p className="text-muted-foreground">
            The widget you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Widgets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{widget.name}</h1>
          <p className="text-muted-foreground mt-2">
            Configure your widget settings and see a live preview.
          </p>
        </div>
      </div>

      {/* Widget Navigation */}
      <WidgetNav widgetId={widgetId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div>
          <WidgetForm
            widget={widget}
            mode="edit"
            onSubmit={handleUpdate}
            isSubmitting={isPending}
            onAutoSave={handleAutoSave}
            onChange={handleFormChange}
          />
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <WidgetPreview
            config={Object.keys(previewConfig).length > 0 ? previewConfig : {
              name: widget.name,
              welcomeMessage: widget.config.welcomeMessage,
              primaryColor: widget.theme.primaryColor,
              secondaryColor: widget.theme.secondaryColor,
              mode: widget.theme.mode,
              showBranding: widget.config.showBranding,
            }}
          />
        </div>
      </div>
    </div>
  );
}
