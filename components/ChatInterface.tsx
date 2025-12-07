import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, StopCircle } from 'lucide-react';
import { Message } from '../types';
import { MessageContent } from './OutputViewer';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isStreaming }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-0 animate-in fade-in duration-700">
            <Bot className="w-16 h-16 mb-4 text-slate-700" />
            <p className="text-lg font-medium">Start collaborating with your Engineering Agent</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-4xl mx-auto ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div
                className={`flex-1 min-w-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600/10 border border-blue-600/20 rounded-2xl rounded-tr-sm p-4'
                    : 'bg-slate-900/50 border border-slate-800 rounded-2xl rounded-tl-sm p-6 shadow-sm'
                }`}
              >
                 <MessageContent content={msg.content} isStreaming={msg.isStreaming} />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you need engineered..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 px-3 py-2.5 max-h-[200px] outline-none resize-none overflow-y-auto text-sm md:text-base"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={`p-2.5 rounded-lg transition-all flex-shrink-0 mb-0.5 ${
                !input.trim() || isStreaming
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95'
              }`}
            >
              {isStreaming ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-500">
              EngiGen can make mistakes. Review generated templates and code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
