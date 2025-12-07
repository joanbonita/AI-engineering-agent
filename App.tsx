import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ChatSession, EngineeringDomain, Message } from './types';
import { getOrCreateAgent } from './services/geminiService';
import { Menu, X, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('engigen_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('engigen_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleNewSession = (domain: EngineeringDomain) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `New ${domain} Chat`,
      domain,
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Optimistic update
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMessage], title: s.messages.length === 0 ? content.slice(0, 30) + '...' : s.title } 
        : s
    ));

    setIsStreaming(true);

    try {
      const activeDomain = activeSession?.domain || EngineeringDomain.SOFTWARE;
      const agent = getOrCreateAgent(activeSessionId, activeDomain);
      
      const stream = await agent.sendMessageStream(content);
      
      // Placeholder for bot message
      const botMsgId = (Date.now() + 1).toString();
      let accumulatedContent = "";

      // Add initial bot message
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: [...s.messages, { id: botMsgId, role: 'model', content: '', timestamp: Date.now(), isStreaming: true }] 
            } 
          : s
      ));

      for await (const chunk of stream) {
        accumulatedContent += chunk;
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m => m.id === botMsgId ? { ...m, content: accumulatedContent } : m)
              }
            : s
        ));
      }

      // Finish streaming
       setSessions(prev => prev.map(s => 
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m => m.id === botMsgId ? { ...m, isStreaming: false } : m)
              }
            : s
        ));

    } catch (error) {
      console.error(error);
      // Add error message
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "**System Error**: Failed to receive response from the agent. Please check your connection or API Key.",
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearSessions = () => {
    if (confirm("Delete all chat history?")) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-40 flex items-center gap-2">
            <button 
              className="p-2 bg-slate-800 rounded-md border border-slate-700 shadow-lg text-slate-300"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-semibold text-slate-300 bg-slate-900/80 px-2 py-1 rounded backdrop-blur-md">
                {activeSession ? activeSession.title : 'EngiGen'}
            </span>
        </div>

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 md:z-auto bg-slate-900 md:bg-transparent h-full shadow-2xl md:shadow-none`}>
          <Sidebar 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => { setActiveSessionId(id); setSidebarOpen(false); }}
            onNewSession={handleNewSession}
            onClearSessions={handleClearSessions}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden w-full relative">
          {activeSession ? (
            <ChatInterface 
              messages={activeSession.messages} 
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
               <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="relative w-20 h-20 mx-auto">
                     <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                     <div className="relative bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
                        <Sparkles className="w-full h-full text-blue-400" />
                     </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Welcome to EngiGen</h2>
                    <p className="text-slate-400">
                      Your intelligent engineering companion. Select a domain from the sidebar (or menu on mobile) to start collaborating.
                    </p>
                  </div>
                  
                  {/* Quick start for mobile mainly */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {Object.values(EngineeringDomain).slice(0, 3).map((domain) => (
                      <button
                        key={domain}
                        onClick={() => handleNewSession(domain)}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:border-blue-500/50 hover:text-white transition-all"
                      >
                        Start {domain} Chat
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
