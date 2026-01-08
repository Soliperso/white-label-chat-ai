"use client";

import { Sparkles, Palette, Zap, MessageSquare } from "lucide-react";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface AuthBrandPanelProps {
  features?: FeatureItem[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: Sparkles,
    title: "AI-Powered Responses",
    description: "Leverage RAG technology to answer questions from your content",
  },
  {
    icon: Palette,
    title: "White-Label Ready",
    description: "Fully customizable to match your brand identity",
  },
  {
    icon: Zap,
    title: "Deploy in Minutes",
    description: "Simple JavaScript snippet works on any website",
  },
];

const defaultTestimonial = {
  quote: "ChatForge helped us reduce support tickets by 60% in the first month.",
  author: "Sarah Chen",
  role: "CEO at TechFlow",
};

function FeatureItemComponent({ icon: Icon, title, description }: FeatureItem) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/80">{description}</p>
      </div>
    </div>
  );
}

export function AuthBrandPanel({
  features = defaultFeatures,
  testimonial = defaultTestimonial
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-dark text-white p-12 flex-col justify-between overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header: Logo + Tagline */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              ChatForge
            </h1>
          </div>
          <p className="mt-4 text-lg text-white/90">
            AI-Powered Chat Widgets for Modern Businesses
          </p>
        </div>

        {/* Value Proposition - Mid section */}
        <div className="mt-16 space-y-6">
          {features.map((feature, index) => (
            <FeatureItemComponent key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Footer: Testimonial */}
      <div className="relative z-10">
        <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/90">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <p className="mt-2 text-sm text-white/70">
          &mdash; {testimonial.author}, {testimonial.role}
        </p>
      </div>
    </div>
  );
}
