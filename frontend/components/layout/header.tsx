"use client";

import { Menu, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <MobileNav>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </MobileNav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info with dropdown */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="John Smith" />
            <AvatarFallback className="bg-white border border-gray-300">
              <User className="h-4 w-4 text-gray-600" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
              John Smith
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white ml-2">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
