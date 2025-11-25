import { Plus, Menu, LogOut } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [conversations] = useState([
    { id: 1, name: "New Conversation", active: true },
  ]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-50`}
      >
        {/* Header - Minimal */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background text-sm font-bold">
              N
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Nothing
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/50 truncate pl-10">
            nothing@example.com
          </p>
        </div>

        {/* New Conversation Button */}
        <div className="px-4 py-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors text-sm font-medium rounded">
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  conv.active
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {conv.name}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-foreground/60 hover:text-foreground transition-colors text-sm">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
