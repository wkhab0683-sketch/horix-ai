import React from 'react';
import { Box, Sun, Moon, Plus, Menu, Volume2, VolumeX } from 'lucide-react';
import { VisualizerMode } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  show3DStage: boolean;
  onToggle3DStage: () => void;
  visualizerMode: VisualizerMode;
  onChangeVisualizerMode: (mode: VisualizerMode) => void;
  onNewChat: () => void;
  onOpenMobileMenu: () => void;
  activeDomain: string;
  onSelectDomain: (domain: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const DOMAINS = [
  { id: 'all', label: 'General' },
  { id: 'code', label: 'Architecture' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'automation', label: 'Automation' },
  { id: 'research', label: 'Research' },
];

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  show3DStage,
  onToggle3DStage,
  visualizerMode,
  onChangeVisualizerMode,
  onNewChat,
  onOpenMobileMenu,
  activeDomain,
  onSelectDomain,
  soundEnabled,
  onToggleSound,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-16 px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8 border-b shrink-0 z-30 transition-colors ${
        isDark ? 'bg-[#0b0d11]/90 border-white/10 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
    >
      {/* Zone 1: Brand Wordmark with Mobile Menu Button */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Open conversation history"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNewChat();
          }}
          className="flex items-center gap-2 group cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
            <span className="text-black font-extrabold text-xs tracking-wider">J</span>
          </div>
          <span className="text-lg font-bold tracking-tight gold-gradient-text">
            JAVIRUS AI
          </span>
        </a>
      </div>

      {/* Zone 2: Domain Focus Links (Single line, quiet typography) */}
      <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
        {DOMAINS.map((domain) => {
          const isActive = activeDomain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'bg-amber-500/15 text-amber-900 border border-amber-500/30 font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {domain.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Luxury Controls & Primary Action */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Visualizer Mode Dropdown (When 3D is active) */}
        {show3DStage && (
          <div className="hidden sm:flex items-center border rounded-lg text-xs p-0.5 border-white/10 bg-black/20">
            <button
              onClick={() => onChangeVisualizerMode('chrono_orb')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                visualizerMode === 'chrono_orb'
                  ? 'bg-amber-400/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chrono-Orb Mode"
            >
              Chrono Orb
            </button>
            <button
              onClick={() => onChangeVisualizerMode('singularity')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                visualizerMode === 'singularity'
                  ? 'bg-amber-400/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Singularity Matrix"
            >
              Matrix
            </button>
            <button
              onClick={() => onChangeVisualizerMode('aura_wave')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                visualizerMode === 'aura_wave'
                  ? 'bg-amber-400/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aura Wave"
            >
              Wave
            </button>
          </div>
        )}

        {/* 3D Stage Toggle Button */}
        <button
          onClick={onToggle3DStage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
            show3DStage
              ? isDark
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800'
              : isDark
              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title={show3DStage ? 'Collapse 3D Core' : 'Show 3D Core'}
        >
          <Box className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">{show3DStage ? '3D Active' : '3D Core'}</span>
        </button>

        {/* Sound Narration Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? isDark
                ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-800'
              : isDark
              ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title={soundEnabled ? 'Speech Narration Enabled' : 'Mute Speech Narration'}
          aria-label="Toggle speech narration"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-white/5 border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-amber-600 hover:bg-slate-200'
          }`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Luxury'}
          aria-label="Toggle visual theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Primary Action: New Session */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-lg shadow-sm hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
          title="Start a new conversation"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Session</span>
        </button>
      </div>
    </header>
  );
};
