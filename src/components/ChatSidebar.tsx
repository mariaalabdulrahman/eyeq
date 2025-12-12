import { useState, useRef, useEffect } from "react";
import { ChatMessage, ScanAnalysis } from "@/types/scan";
import { Maximize2, Minimize2, X, ChevronDown, Check } from "lucide-react";
import Logo from "@/components/Logo";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const selectAllScans = () => {
    setSelectedScans(scans.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedScans([]);
  };

  // Dropdown component for image selection
  const ImageDropdown = ({ compact = false }: { compact?: boolean }) => (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: compact ? '8px 12px' : '10px 14px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: compact ? '13px' : '14px',
          color: '#374151',
          minWidth: compact ? '180px' : '220px',
          width: '100%',
        }}
      >
        <span>
          {selectedScans.length === 0 
            ? 'Select images...' 
            : selectedScans.length === scans.length 
              ? 'All images selected' 
              : `${selectedScans.length} image(s) selected`}
        </span>
        <ChevronDown size={16} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto',
        }}>
          {/* Select All / Clear */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={selectAllScans}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #0891b2',
                backgroundColor: '#ecfeff',
                color: '#0891b2',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearSelection}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>

          {/* Image list */}
          {scans.map((scan) => (
            <button
              key={scan.id}
              type="button"
              onClick={() => toggleScanSelection(scan.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                backgroundColor: selectedScans.includes(scan.id) ? '#ecfeff' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: selectedScans.includes(scan.id) ? '2px solid #0891b2' : '2px solid #d1d5db',
                backgroundColor: selectedScans.includes(scan.id) ? '#0891b2' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selectedScans.includes(scan.id) && <Check size={12} color="white" />}
              </div>
              <span style={{ fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scan.name}
              </span>
            </button>
          ))}

          {scans.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
              No images available
            </div>
          )}
        </div>
      )}
    </div>
  );

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Logo size={32} />
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

          {/* Image Selection Dropdown */}
          {scans.length > 0 && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select Images for Context
              </p>
              <ImageDropdown />
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
                  }}
                >
                  {message.role === 'user' ? '👤' : <Logo size={24} />}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo size={28} />
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

      {/* Image Selection Dropdown */}
      {scans.length > 0 && (
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Select Images for Context
          </p>
          <ImageDropdown compact />
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
              {message.role === 'user' ? '👤' : <Logo size={20} />}
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