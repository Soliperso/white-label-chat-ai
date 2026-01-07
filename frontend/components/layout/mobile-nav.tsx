"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Widgets",
    href: "/widgets",
    icon: LayoutGrid,
    disabled: false,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
    disabled: true,
  },
];

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <>
          <SheetHeader className="h-16 border-b px-6 flex items-center justify-start">
            <SheetTitle className="text-xl font-bold">ChatForge</SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : item.disabled
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </>
      </SheetContent>
    </Sheet>
  );
}
