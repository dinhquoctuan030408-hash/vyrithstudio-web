'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFeedbackThreads, sendUserFeedback } from '@/data/projectManager';
import { FeedbackMessage } from '@/data/config';
import { MessageSquare, X, Send, Lock, Sparkles, Terminal } from 'lucide-react';

export default function FloatingFeedbackButton() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const threads = getFeedbackThreads();
      const currentThread = threads.find(t => t.userId === user.id);
      setMessages(currentThread ? currentThread.messages : []);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !user) return;

    const newMsg = sendUserFeedback(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      inputVal
    );

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
  };

  const handleRequireLogin = () => {
    setIsOpen(false);
    router.push('/login?redirect=/dashboard');
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex flex-col items-end">
      
      {/* Chatbox Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[480px] mb-3.5 rounded-3xl border border-white/15 bg-[#090D16]/95 backdrop-blur-2xl shadow-[0_0_35px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/10 bg-[#121826]/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-glow">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider">Studio Feedback Terminal</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Hub
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin">
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Authentication Required</h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Please sign in with your Vyrith account to send feedback and questions directly to the founder.
                  </p>
                </div>
                <button
                  onClick={handleRequireLogin}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all"
                >
                  Sign In to Feedback
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-[#94A3B8]">
                <Sparkles className="w-8 h-8 text-blue-400/60" />
                <p className="text-xs">Have any suggestions, bugs, or questions for Vyrith Studio? Send us a message!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[10px] text-[#94A3B8] font-mono px-1">
                      {isMe ? 'You' : 'Vyrith Founder'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]'
                          : 'bg-[#182234] border border-white/10 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          {isAuthenticated && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#121826]/60 flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-glow transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all group"
      >
        <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-mono">Feedback Hub</span>
      </button>

    </div>
  );
}