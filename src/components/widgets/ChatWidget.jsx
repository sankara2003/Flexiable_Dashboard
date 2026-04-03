import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Bot, User, Loader, Sparkles, Trash2 } from 'lucide-react';
import { chatWithAI } from '../../utils/aiInsights';

const SUGGESTIONS = [
  'How is my portfolio doing?',
  'Analyze my health trends',
  'What should I focus on today?',
  'How is the weather today?',
];

const INITIAL_MSG = {
  id: 1, role: 'assistant', timestamp: new Date(),
  content: "Hi! I'm your AI dashboard assistant. Ask me anything about your finances, health, weather, or calendar — I'll answer based on your live dashboard data.",
};

const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatWidget = memo(() => {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg  = { id: Date.now(), role: 'user', content, timestamp: new Date() };
    const updated  = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    const apiMsgs  = updated.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));
    const response = await chatWithAI(apiMsgs);
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: response, timestamp: new Date() }]);
    setLoading(false);
  }, [messages, input, loading]);

  const clearChat = useCallback(() => {
    setMessages([{ id: Date.now(), role: 'assistant', content: 'Chat cleared! Ask me anything about your dashboard data.', timestamp: new Date() }]);
  }, []);

  const handleKeyDown  = useCallback((e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }, [sendMessage]);
  const handleChange   = useCallback((e) => setInput(e.target.value), []);
  const isFirstMessage = messages.length === 1;

  return (
    <div className="flex flex-col h-full p-[14px] gap-[10px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[7px]">
          <Bot size={18} className="text-[var(--accent-violet)] opacity-90" aria-hidden="true" />
          <h3 className="font-display text-[0.9rem] font-bold tracking-[-0.01em] text-[var(--text-primary)]">AI Assistant</h3>
          {/* Pulsing online dot */}
          <span
            className="w-[7px] h-[7px] bg-[var(--accent-emerald)] rounded-full
                       shadow-[0_0_6px_var(--accent-emerald)] animate-pulse-dot"
            aria-label="Online"
            title="Online"
          />
        </div>
        <button
          className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px]
                     text-[var(--text-muted)] transition-all duration-150
                     hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
          onClick={clearChat} aria-label="Clear conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-[10px] pr-1"
        role="log" aria-live="polite" aria-label="Chat conversation">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-2 items-start animate-slide-in ${isAI ? '' : 'flex-row-reverse'}`}
              role="article"
              aria-label={`${isAI ? 'Assistant' : 'You'}: ${msg.content}`}
            >
              {/* Avatar */}
              <div
                className={
                  'w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 border ' +
                  (isAI
                    ? 'bg-[rgba(124,111,255,0.15)] border-[rgba(124,111,255,0.3)] text-[var(--accent-violet)]'
                    : 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.3)] text-[var(--accent-emerald)]')
                }
                aria-hidden="true"
              >
                {isAI ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div
                className={
                  'max-w-[80%] px-[11px] py-2 rounded-xl border ' +
                  (isAI
                    ? 'bg-[var(--surface-raised)] border-[var(--border)]'
                    : 'bg-[rgba(124,111,255,0.12)] border-[rgba(124,111,255,0.25)]')
                }
              >
                <p className="text-[0.78rem] leading-[1.5] text-[var(--text-primary)]">{msg.content}</p>
                <span className="block text-[0.62rem] text-[var(--text-muted)] mt-1 text-right"
                  aria-label={`Sent at ${formatTime(msg.timestamp)}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2 items-start" aria-label="Assistant is typing" aria-live="polite">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 border
                           bg-[rgba(124,111,255,0.15)] border-[rgba(124,111,255,0.3)] text-[var(--accent-violet)]"
              aria-hidden="true">
              <Bot size={14} />
            </div>
            <div className="flex gap-1 items-center px-[14px] py-3 min-w-[52px] rounded-xl
                           bg-[var(--surface-raised)] border border-[var(--border)]"
              aria-label="Typing…">
              {[0, 200, 400].map((delay) => (
                <span
                  key={delay}
                  className="w-[6px] h-[6px] bg-[var(--accent-violet)] rounded-full animate-typing-dot"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Suggestion chips — only when no chat history */}
      {isFirstMessage && (
        <div className="flex flex-wrap gap-[5px] flex-shrink-0" role="group" aria-label="Suggested questions">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className="flex items-center gap-1 px-[10px] py-[5px] rounded-full text-[0.68rem]
                         bg-[var(--surface-raised)] border border-[var(--border)]
                         text-[var(--text-secondary)] transition-all duration-150
                         hover:border-[rgba(124,111,255,0.4)] hover:text-[var(--accent-violet)]
                         hover:bg-[rgba(124,111,255,0.08)]"
              onClick={() => sendMessage(s)}
              aria-label={`Ask: ${s}`}
            >
              <Sparkles size={10} className="text-[var(--accent-violet)]" aria-hidden="true" /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          className="flex-1 px-3 py-[9px] rounded-[10px] text-[0.8rem] outline-none
                     bg-[var(--surface-raised)] border border-[var(--border)]
                     text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                     transition-colors duration-150
                     focus:border-[rgba(124,111,255,0.5)] disabled:opacity-50"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your dashboard data…"
          disabled={loading}
          aria-label="Message input"
        />
        <button
          className={
            'w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ' +
            'border transition-all duration-150 ' +
            (input.trim() && !loading
              ? 'bg-[var(--accent-violet)] border-[var(--accent-violet)] text-white shadow-[0_0_14px_rgba(124,111,255,0.4)]'
              : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-muted)]')
          }
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          {loading
            ? <Loader size={15} className="animate-spin-loader" aria-hidden="true" />
            : <Send   size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
});

ChatWidget.displayName = 'ChatWidget';
export default ChatWidget;
