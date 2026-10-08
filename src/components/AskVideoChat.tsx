import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AskVideoChatProps {
  transcriptText: string;
}

export const AskVideoChat: React.FC<AskVideoChatProps> = ({ transcriptText }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! I have analyzed this video transcript. Ask me anything about the topics, specific advice, speaker arguments, or request an explanation in Hindi or English!',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestedQuestions = [
    'मुख्य 3 पॉइंट्स क्या हैं? (Main 3 points)',
    'What did the speaker say about investing/strategy?',
    'Explain the video conclusion in simple Hindi',
    'List all tools and tips mentioned',
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/transcribe/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText,
          question: q,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer generated.',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, error generating response: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Ask Video AI (Q&A)</h3>
            <p className="text-[11px] text-slate-400">Grounded strictly in this video's transcript</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[380px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 text-xs border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed group relative ${
                m.role === 'user'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
              {m.role === 'assistant' && (
                <button
                  onClick={() => copyMessage(m)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded bg-slate-800/80 cursor-pointer"
                  title="Copy answer"
                >
                  {copiedId === m.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 text-xs border border-slate-700">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-rose-400 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing transcript dialogue...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts chips */}
      <div className="p-2.5 border-t border-slate-800/60 bg-slate-950/20 flex items-center flex-wrap gap-1.5">
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuestion);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask about this video (English or हिन्दी)..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700/80 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
