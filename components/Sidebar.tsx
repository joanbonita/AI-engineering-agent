import React from 'react';
import { MessageSquare, PlusCircle, Trash2, Box, Cpu } from 'lucide-react';
import { ChatSession, EngineeringDomain } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: (domain: EngineeringDomain) => void;
  onClearSessions: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewSession,
  onClearSessions 
}) => {
  return (
    <div className="w-72 border-r border-slate-800 h-[calc(100vh-64px)] bg-slate-900 flex flex-col md:flex hidden">
      {/* New Session Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          New Engineering Chat
        </div>
        <div className="grid grid-cols-2 gap-2">
           {Object.values(EngineeringDomain).map((domain) => (
             <button
               key={domain}
               onClick={() => onNewSession(domain)}
               className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-blue-300 transition-all text-center"
               title={domain}
             >
               {domain.includes('Software') && <Cpu className="w-3 h-3" />}
               {domain.includes('Software') ? 'Software' : domain.split(' ')[0]}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-600 px-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active sessions.</p>
            <p className="text-xs mt-1">Select a domain above to start.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all group relative ${
                activeSessionId === session.id
                  ? 'bg-blue-600/10 border-blue-600/40 text-blue-100'
                  : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-medium text-sm truncate pr-2">{session.title}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                  {session.domain.split(' ')[0]}
                </span>
                <span className="text-[10px] opacity-60">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onClearSessions}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors w-full justify-center p-2 rounded hover:bg-slate-800"
          >
            <Trash2 className="w-3 h-3" /> Clear All Sessions
          </button>
        </div>
      )}
    </div>
  );
};
