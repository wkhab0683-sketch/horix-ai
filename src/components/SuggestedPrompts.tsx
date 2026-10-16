import React from 'react';
import { Code2, Compass, Briefcase, Zap, Sparkles, Cpu } from 'lucide-react';
import { JAVIRUSCapability } from '../types';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string, domain?: string) => void;
  theme: 'dark' | 'light';
}

const CAPABILITIES: JAVIRUSCapability[] = [
  {
    id: 'coding',
    title: 'Code & Architecture',
    description: 'System design, React/TypeScript patterns, API orchestration, and clean debugging.',
    iconName: 'Code2',
    prompt: 'Can you help me architect a high-performance web service with clean modular boundaries and robust state management? Break it down step by step.',
  },
  {
    id: 'business',
    title: 'Venture & Strategy',
    description: 'Business model blueprints, competitive edge analysis, and unit economics.',
    iconName: 'Briefcase',
    prompt: 'Brainstorm 3 high-leverage business opportunities using AI automation for premium service businesses. Include key risks and first milestone.',
  },
  {
    id: 'automation',
    title: 'AI Automation Workflows',
    description: 'Designing autonomous agent systems, API integrations, and productivity pipelines.',
    iconName: 'Cpu',
    prompt: 'Design an end-to-end automation workflow that connects inbound leads, qualification via AI, and automated scheduling with human oversight.',
  },
  {
    id: 'research',
    title: 'Deep Research & Learning',
    description: 'Synthesizing complex concepts into actionable mental models and study roadmaps.',
    iconName: 'Compass',
    prompt: 'Explain how modern large language models handle attention mechanisms and memory context windows, in simple intuitive steps with concrete examples.',
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt, theme }) => {
  const isDark = theme === 'dark';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Code2':
        return <Code2 className="w-4 h-4 text-amber-300" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-amber-300" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-amber-300" />;
      default:
        return <Compass className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-amber-300/80 mb-2 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JAVIRUS Neural Core — Ready for Deployment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          Think Smarter. Work Faster. Build the Future.
        </h2>
        <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select an executive capability or enter an open directive to begin thinking with JAVIRUS AI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {CAPABILITIES.map((cap) => (
          <button
            key={cap.id}
            onClick={() => onSelectPrompt(cap.prompt, cap.title)}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
              isDark
                ? 'bg-[#12161f]/80 border-white/10 hover:border-amber-400/40 hover:bg-[#181e2b] shadow-sm'
                : 'bg-white border-slate-200 hover:border-amber-500/40 hover:bg-amber-50/20 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`p-1.5 rounded-lg border ${
                    isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100/60 border-amber-200'
                  }`}
                >
                  {getIcon(cap.iconName)}
                </div>
                <h3 className="text-sm font-semibold tracking-tight group-hover:text-amber-300 transition-colors">
                  {cap.title}
                </h3>
              </div>
              <p
                className={`text-xs line-clamp-2 leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {cap.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-amber-300/80 group-hover:text-amber-300">
              <span className="font-medium">Launch Directive</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
