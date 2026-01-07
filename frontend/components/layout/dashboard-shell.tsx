import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { FloatingChatBubble } from "@/components/chat-widget/floating-chat-bubble";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <TopNav />
      </div>

      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 z-10">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-0 md:ml-64 mt-14">
        <main className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#FAFAFA]">
          <div className="mx-auto max-w-content px-4 py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Floating chat widget */}
      <FloatingChatBubble />
    </div>
  );
}
