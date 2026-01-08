"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chrome, Github } from "lucide-react";

export function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled
          className="relative h-11"
          aria-label="Sign in with Google (Coming Soon)"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
          >
            Soon
          </Badge>
        </Button>

        <Button
          variant="outline"
          disabled
          className="relative h-11"
          aria-label="Sign in with GitHub (Coming Soon)"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5"
          >
            Soon
          </Badge>
        </Button>
      </div>
    </div>
  );
}
