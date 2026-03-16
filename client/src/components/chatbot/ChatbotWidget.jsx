import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, SendHorizontal, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../../services/api';

const initialMessage = {
  role: 'assistant',
  content: 'Hi, I am HelpHive AI. Ask me about volunteers, event resources, or coordination insights.',
};

const fallbackReply = (message) => {
  const lower = String(message || '').toLowerCase();

  if (lower.includes('volunteer')) {
    return 'AI response is temporarily delayed. You can still check live volunteer availability in the Volunteers page and leaderboard widgets.';
  }

  if (lower.includes('resource') || lower.includes('stock')) {
    return 'AI response is temporarily delayed. You can use the Resources page to view current inventory and low-stock items.';
  }

  if (lower.includes('event')) {
    return 'AI response is temporarily delayed. You can create and assign events directly from the Events page.';
  }

  return 'AI response is temporarily delayed. Core HelpHive features remain fully available.';
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([initialMessage]);
  const [sending, setSending] = useState(false);

  const placeholderHints = useMemo(
    () => ['Suggest resources for a health camp', 'Recommend volunteers for Food Distribution Event', 'Show engagement insights'],
    []
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const { data } = await api.post('/ai/chatbot', { message: input.trim() });
      const aiMsg = { role: 'assistant', content: data.reply || data.answer || 'No response generated.' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg = {
        role: 'assistant',
        content: err.response?.data?.message || fallbackReply(input),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }

    setInput('');
    setSending(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[80]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-3 flex h-[430px] w-[340px] flex-col overflow-hidden rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-elevated)]/95 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-muted)] px-4 py-3">
              <div>
                <p className="font-['Outfit'] text-sm font-semibold">HelpHive AI</p>
                <p className="text-xs text-[var(--text-muted)]">Smart Volunteer and Resource Assistant</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--border-muted)] p-1.5"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`max-w-[88%] rounded-xl px-3 py-2 ${
                    msg.role === 'assistant'
                      ? 'bg-cyan-500/15 text-[var(--text-primary)]'
                      : 'ml-auto bg-amber-500/20 text-[var(--text-primary)]'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border-muted)] p-3">
              <div className="mb-2 flex flex-wrap gap-1">
                {placeholderHints.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setInput(hint)}
                      disabled={sending}
                    className="rounded-full border border-[var(--border-muted)] px-2 py-1 text-[10px] text-[var(--text-secondary)]"
                  >
                    {hint}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask HelpHive AI"
                  disabled={sending}
                  className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--card-elevated)] px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-white"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 rounded-full border border-amber-300/35 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30"
      >
        <MessageCircle className="h-4 w-4" />
        <span>AI Chat</span>
        <Sparkles className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
};

export default ChatbotWidget;
