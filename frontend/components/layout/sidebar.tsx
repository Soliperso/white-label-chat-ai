"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap, BarChart, Users, CreditCard, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_ORG } from "@/types";

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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { companyName } = MOCK_ORG.branding;

  // Load logo from localStorage on mount and listen for changes
  useEffect(() => {
    const loadLogo = () => {
      const storedLogo = localStorage.getItem('organizationLogo');
      setLogoUrl(storedLogo);
    };

    loadLogo();

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', loadLogo);

    // Listen for custom event for same-tab updates
    window.addEventListener('logoUpdated', loadLogo);

    return () => {
      window.removeEventListener('storage', loadLogo);
      window.removeEventListener('logoUpdated', loadLogo);
    };
  }, []);

  return (
    <aside className="w-64 border-r bg-gray-800 h-full overflow-y-auto">
      <div className="flex h-full flex-col">
        {/* Organization Logo */}
        <Link href="/widgets" className="px-6 py-6 border-b border-gray-700 flex flex-col items-center justify-center hover:bg-gray-700/50 transition-colors group">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-20 w-auto max-w-[200px] object-contain mb-3 rounded-lg" />
          ) : (
            <div className="h-20 w-20 bg-gray-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-600 transition-colors">
              <Building2 className="h-12 w-12 text-gray-300" />
            </div>
          )}
          <span className="text-white font-semibold text-center text-sm">{companyName}</span>
        </Link>

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
