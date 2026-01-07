"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap, BarChart, Users, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Widgets",
    href: "/widgets",
    icon: Bell,
    disabled: false,
  },
  {
    title: "Training",
    href: "/training",
    icon: GraduationCap,
    disabled: false,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
    disabled: false,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    disabled: false,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
    disabled: false,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    disabled: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-800 h-full overflow-y-auto">
      <div className="flex h-full flex-col">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={`${item.href}-${index}`}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors border-l-4 border-transparent",
                  isActive
                    ? "bg-primary border-l-primary text-white"
                    : item.disabled
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
