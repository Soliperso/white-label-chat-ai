"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, GraduationCap, BarChart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetNavProps {
  widgetId: string;
}

const navItems = [
  {
    title: "Settings",
    href: "",
    icon: Settings,
  },
  {
    title: "Training",
    href: "/training",
    icon: GraduationCap,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
  },
  {
    title: "Chats",
    href: "/chats",
    icon: MessageSquare,
  },
];

export function WidgetNav({ widgetId }: WidgetNavProps) {
  const pathname = usePathname();
  const basePath = `/widgets/${widgetId}`;

  return (
    <div className="border-b border-border">
      <nav className="flex space-x-1" aria-label="Widget navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
