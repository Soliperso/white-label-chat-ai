"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WidgetForm, type WidgetFormData } from "@/components/widgets/widget-form";
import { useCreateWidget } from "@/hooks/use-widgets";
import type { CreateWidgetDto } from "@/types";

export default function CreateWidgetPage() {
  const router = useRouter();
  const { mutateAsync: createWidget, isPending } = useCreateWidget();

  const handleSubmit = async (data: WidgetFormData) => {
    try {
      const dto: CreateWidgetDto = {
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

      const widget = await createWidget(dto);
      toast.success("Widget created successfully!");
      router.push(`/widgets/${widget.id}`);
    } catch (error) {
      toast.error("Failed to create widget");
      console.error("Error creating widget:", error);
    }
  };

  const handleCancel = () => {
    router.push("/widgets");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Widget</h1>
        <p className="text-muted-foreground mt-2">
          Configure your new chat widget with custom branding and settings.
        </p>
      </div>

      <WidgetForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isPending}
        mode="create"
      />
    </div>
  );
}
