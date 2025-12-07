import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { Copy, Check, Terminal } from 'lucide-react';

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'JetBrains Mono',
});

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(false);
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        setError(true);
      }
    };
    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-900/50 bg-red-900/20 rounded-lg text-red-200 text-sm font-mono">
        Failed to render diagram. Syntax might be incomplete.
      </div>
    );
  }

  return (
    <div 
      className="overflow-x-auto p-4 flex justify-center bg-slate-900 rounded-lg my-4 border border-slate-800"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

const CodeBlock = ({ language, children }: { language: string | undefined, children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (language === 'mermaid') {
    return <MermaidDiagram chart={text} />;
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-slate-300">
          {children}
        </code>
      </div>
    </div>
  );
};

export const MessageContent: React.FC<MessageContentProps> = ({ content, isStreaming }) => {
  return (
    <div className={`prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 ${isStreaming ? 'animate-pulse-subtle' : ''}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = !!match;
            
            if (isBlock) {
              return <CodeBlock language={match[1]}>{children}</CodeBlock>;
            }

            return (
              <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-sm text-blue-200 font-mono border border-slate-700/50" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 border border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-700 bg-slate-900/50">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-3 bg-slate-800/80 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 border-t border-slate-800">{children}</td>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-4 space-y-1 my-2 text-slate-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-4 space-y-1 my-2 text-slate-300">{children}</ol>;
          },
          a({ children, href }) {
            return <a href={href} className="text-blue-400 hover:text-blue-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer">{children}</a>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
