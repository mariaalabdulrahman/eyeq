import { useState, useRef, useEffect } from "react";
import { ChatMessage, ScanAnalysis } from "@/types/scan";
import { Maximize2, Minimize2, X } from "lucide-react";

interface ChatSidebarProps {
  scans: ScanAnalysis[];
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, selectedScanIds: string[]) => void;
}

export function ChatSidebar({ scans, chatHistory, onSendMessage }: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && selectedScans.length > 0) {
      onSendMessage(input.trim(), selectedScans);
      setInput("");
    }
  };

  const toggleScanSelection = (scanId: string) => {
    setSelectedScans(prev => 
      prev.includes(scanId) 
        ? prev.filter(id => id !== scanId)
        : [...prev, scanId]
    );
  };

  // Fullscreen modal
  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '90vw',
          height: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🤖</span>
              <h3 style={{ fontWeight: 600, color: '#111', fontSize: '18px' }}>AI Assistant</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsFullscreen(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minimize2 size={18} color="#6b7280" />
              </button>
              <button
                onClick={() => { setIsFullscreen(false); setIsExpanded(false); }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color="#6b7280" />
              </button>
            </div>
          </div>

          {/* Image Selection */}
          {scans.length > 0 && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select Images for Context
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {scans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => toggleScanSelection(scan.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: selectedScans.includes(scan.id) ? '2px solid #0891b2' : '1px solid #e5e7eb',
                      backgroundColor: selectedScans.includes(scan.id) ? '#ecfeff' : 'white',
                      color: selectedScans.includes(scan.id) ? '#0891b2' : '#374151',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedScans.includes(scan.id) && '✓ '}
                    {scan.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {chatHistory.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  maxWidth: '800px',
                  margin: message.role === 'user' ? '0 0 20px auto' : '0 auto 20px 0',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                    flexShrink: 0,
                    fontSize: '18px',
                  }}
                >
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div
                  style={{
                    borderRadius: '16px',
                    padding: '14px 18px',
                    maxWidth: '600px',
                    backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                    color: message.role === 'user' ? 'white' : '#111',
                  }}
                >
                  <p style={{ fontSize: '15px', lineHeight: 1.6 }}>{message.content}</p>
                  {message.selectedScanIds.length > 0 && (
                    <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                      📎 {message.selectedScanIds.length} image(s) referenced
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
            {selectedScans.length === 0 && scans.length > 0 && (
              <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px' }}>
                ⚠️ Select at least one image above to ask questions
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={scans.length === 0 ? "Upload scans to start..." : "Ask about the selected scans..."}
                disabled={scans.length === 0}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '1px solid #e5e7eb',
                  outline: 'none',
                }}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || selectedScans.length === 0}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: input.trim() && selectedScans.length > 0 ? '#0891b2' : '#9ca3af',
                  color: 'white',
                  cursor: input.trim() && selectedScans.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '18px',
                }}
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <h3 style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>AI Assistant</h3>
            <p style={{ fontSize: '11px', color: '#6b7280' }}>
              Select images, then ask questions
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Expand to fullscreen"
        >
          <Maximize2 size={16} color="#6b7280" />
        </button>
      </div>

      {/* Image Selection */}
      {scans.length > 0 && (
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Select Images for Context
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => toggleScanSelection(scan.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: selectedScans.includes(scan.id) ? '2px solid #0891b2' : '1px solid #e5e7eb',
                  backgroundColor: selectedScans.includes(scan.id) ? '#ecfeff' : 'white',
                  color: selectedScans.includes(scan.id) ? '#0891b2' : '#374151',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {selectedScans.includes(scan.id) && '✓ '}
                {scan.name.slice(0, 15)}{scan.name.length > 15 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {chatHistory.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                flexShrink: 0,
              }}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div
              style={{
                borderRadius: '12px',
                padding: '10px 14px',
                maxWidth: '85%',
                backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                color: message.role === 'user' ? 'white' : '#111',
              }}
            >
              <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{message.content}</p>
              {message.selectedScanIds.length > 0 && (
                <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  📎 {message.selectedScanIds.length} image(s) referenced
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        {selectedScans.length === 0 && scans.length > 0 && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>
            ⚠️ Select at least one image above to ask questions
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={scans.length === 0 ? "Upload scans to start..." : "Ask about the selected scans..."}
            disabled={scans.length === 0}
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              outline: 'none',
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || selectedScans.length === 0}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: input.trim() && selectedScans.length > 0 ? '#0891b2' : '#9ca3af',
              color: 'white',
              cursor: input.trim() && selectedScans.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
            }}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
