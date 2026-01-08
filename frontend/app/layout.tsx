import type { Metadata } from "next";
import "./globals.css";
import { MSWProvider } from "@/components/msw-provider";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { AuthProvider } from "@/lib/auth-context";
import { DevAuthHelper } from "@/components/auth/dev-auth-helper";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "White-Label AI Chat Widget Platform",
  description: "Build and deploy AI-powered chat widgets for your clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MSWProvider>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
              <DevAuthHelper />
            </AuthProvider>
          </ReactQueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
