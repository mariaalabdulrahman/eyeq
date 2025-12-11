import { useState, useRef, useEffect } from "react";
export function ChatSidebar({ scans, chatHistory, onSendMessage }) {
    const [input, setInput] = useState("");
    const [selectedScans, setSelectedScans] = useState([]);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && selectedScans.length > 0) {
            onSendMessage(input.trim(), selectedScans);
            setInput("");
        }
    };
    const toggleScanSelection = (scanId) => {
        setSelectedScans(prev => prev.includes(scanId)
            ? prev.filter(id => id !== scanId)
            : [...prev, scanId]);
    };
    return (<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <h3 style={{ fontWeight: 600, color: '#111' }}>AI Assistant</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          Select images below, then ask questions
        </p>
      </div>

      {/* Image Selection */}
      {scans.length > 0 && (<div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Select Images for Context
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {scans.map((scan) => (<button key={scan.id} onClick={() => toggleScanSelection(scan.id)} style={{
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
                }}>
                {selectedScans.includes(scan.id) && '✓ '}
                {scan.name.slice(0, 15)}{scan.name.length > 15 ? '...' : ''}
              </button>))}
          </div>
        </div>)}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {chatHistory.map((message) => (<div key={message.id} style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            }}>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                flexShrink: 0,
            }}>
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
                borderRadius: '12px',
                padding: '10px 14px',
                maxWidth: '85%',
                backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                color: message.role === 'user' ? 'white' : '#111',
            }}>
              <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{message.content}</p>
              {message.selectedScanIds.length > 0 && (<p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                  📎 {message.selectedScanIds.length} image(s) referenced
                </p>)}
            </div>
          </div>))}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        {selectedScans.length === 0 && scans.length > 0 && (<p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>
            ⚠️ Select at least one image above to ask questions
          </p>)}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={scans.length === 0 ? "Upload scans to start..." : "Ask about the selected scans..."} disabled={scans.length === 0} style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
            border: '1px solid #e5e7eb',
            outline: 'none',
        }}/>
          <button type="submit" disabled={!input.trim() || selectedScans.length === 0} style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: input.trim() && selectedScans.length > 0 ? '#0891b2' : '#9ca3af',
            color: 'white',
            cursor: input.trim() && selectedScans.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '16px',
        }}>
            ➤
          </button>
        </div>
      </form>
    </div>);
}
