import React from 'react';
import { Cpu, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            EngiGen
          </h1>
          <p className="text-xs text-slate-400 font-mono">AI Engineering Architect</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <a href="#" className="text-slate-400 hover:text-white transition-colors">
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
};
