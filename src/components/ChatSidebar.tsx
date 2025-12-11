import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  scan: ScanAnalysis | null;
  onSendMessage: (message: string) => void;
}

export function ChatSidebar({ scan, onSendMessage }: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [scan?.chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  if (!scan) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center px-4">
        <p>Upload a scan to start analyzing and chatting with the AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sidebar-foreground">AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions about {scan.name}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {scan.chatHistory.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-slide-in",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sidebar-accent text-primary"
              )}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={cn(
                "rounded-xl px-4 py-2.5 max-w-[85%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-sidebar-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the scan..."
            className="flex-1 bg-sidebar-accent text-sidebar-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" size="icon" variant="glow" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
