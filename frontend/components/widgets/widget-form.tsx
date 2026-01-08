"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ColorPicker } from "@/components/widgets/color-picker";
import type { Widget } from "@/types";
import { Loader2 } from "lucide-react";

// Validation schema
const widgetFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  welcomeMessage: z
    .string()
    .max(200, "Welcome message must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  mode: z.enum(["light", "dark", "auto"]),
  position: z.enum(["bottom-right", "bottom-left", "inline"]),
  showBranding: z.boolean(),
});

export type WidgetFormData = z.infer<typeof widgetFormSchema>;

interface WidgetFormProps {
  widget?: Widget;
  defaultValues?: Partial<WidgetFormData>;
  onSubmit: (data: WidgetFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onAutoSave?: (data: WidgetFormData) => Promise<void>;
  onChange?: (data: Partial<WidgetFormData>) => void;
}

const DEFAULT_VALUES: WidgetFormData = {
  name: "",
  welcomeMessage: "Hi! How can I help you today?",
  primaryColor: "#3B82F6",
  secondaryColor: "#1E40AF",
  mode: "light",
  position: "bottom-right",
  showBranding: true,
};

export function WidgetForm({
  widget,
  defaultValues = DEFAULT_VALUES,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "create",
  onAutoSave,
  onChange,
}: WidgetFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Convert widget to form data if provided
  const initialValues = React.useMemo(() => {
    if (widget) {
      return {
        name: widget.name,
        welcomeMessage: widget.config.welcomeMessage || "",
        primaryColor: widget.theme.primaryColor,
        secondaryColor: widget.theme.secondaryColor,
        mode: widget.theme.mode,
        position: widget.config.position,
        showBranding: widget.config.showBranding,
      };
    }
    return {
      ...DEFAULT_VALUES,
      ...defaultValues,
    };
  }, [widget, defaultValues]);

  const form = useForm<WidgetFormData>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = async (data: WidgetFormData) => {
    await onSubmit(data);
    if (mode === "edit") {
      setLastSaved(new Date());
    }
  };

  // Watch form values for auto-save and onChange
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      // Call onChange immediately for preview updates
      if (onChange) {
        onChange(values as Partial<WidgetFormData>);
      }

      // Auto-save in edit mode
      if (mode === "edit" && onAutoSave && form.formState.isDirty) {
        // Clear existing timer
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for auto-save
        autoSaveTimerRef.current = setTimeout(async () => {
          const currentValues = form.getValues();
          try {
            setIsSaving(true);
            await onAutoSave(currentValues);
            setLastSaved(new Date());
            form.reset(currentValues); // Reset dirty state
          } catch (error) {
            console.error("Auto-save failed:", error);
          } finally {
            setIsSaving(false);
          }
        }, 500);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [form, mode, onAutoSave, onChange]);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <Card className="max-w-2xl p-6">
      {mode === "edit" && (
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isSaving && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {!isSaving && lastSaved && (
              <span className="text-muted-foreground">{formatLastSaved()}</span>
            )}
          </div>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Chat Widget"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  A friendly name to identify this widget in your dashboard
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Welcome Message Field */}
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Hi! How can I help you today?"
                    rows={3}
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The first message users see when they open the chat widget
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Pickers - Two Column Layout */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium leading-none mb-1">Widget Colors</h4>
              <p className="text-sm text-muted-foreground">
                Customize the appearance to match your brand
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Primary Color"
                      error={form.formState.errors.primaryColor?.message}
                    />
                    <FormDescription>Header and main elements</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Secondary Color"
                      error={form.formState.errors.secondaryColor?.message}
                    />
                    <FormDescription>Accents and highlights</FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Theme Mode Field */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme Mode</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Auto mode adapts to user&apos;s system preferences
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position Field */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Where the widget appears on your website
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Show Branding Field */}
          <FormField
            control={form.control}
            name="showBranding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Show Branding</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Display "Powered by ChatForge" in the widget
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="text-white">
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Widget"
                : "Save Changes"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
}
