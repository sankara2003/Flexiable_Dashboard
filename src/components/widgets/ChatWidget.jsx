import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader, Sparkles, Trash2 } from 'lucide-react';
import { chatWithAI } from '../../utils/aiInsights';

// Suggestions stay — but they'll now get real data-driven answers
const SUGGESTIONS = [
  'How is my portfolio doing?',
  'Analyze my health trends',
  'What should I focus on today?',
  'How is the weather today?',
];

const ChatWidget = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your AI dashboard assistant. Ask me anything about your finances, health, weather, or calendar — I'll answer based on your live dashboard data.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content, timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Build API message history — exclude system messages, keep roles clean
    const apiMessages = updatedMessages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    // chatWithAI now builds the system prompt internally with live data injected
    const response = await chatWithAI(apiMessages);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      },
    ]);
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Chat cleared! Ask me anything about your dashboard data.",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="widget-inner chat-widget">
      <div className="widget-header">
        <div className="widget-title-group">
          <Bot size={18} className="widget-icon chat-icon" />
          <h3>AI Assistant</h3>
          <span className="online-dot" />
        </div>
        <button className="icon-btn" onClick={clearChat} title="Clear chat">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="message-bubble">
              <p>{msg.content}</p>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <Bot size={14} />
            </div>
            <div className="message-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
              <Sparkles size={10} /> {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about your dashboard data..."
          disabled={loading}
        />
        <button
          className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {loading ? <Loader size={15} className="spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;