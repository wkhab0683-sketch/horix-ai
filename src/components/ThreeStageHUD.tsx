import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, Sparkles, Orbit, Compass, Sliders } from 'lucide-react';
import { VisualizerMode } from '../types';

interface ThreeStageHUDProps {
  visualizerMode: VisualizerMode;
  onChangeMode: (mode: VisualizerMode) => void;
  speedIntensity: number;
  onChangeIntensity: (val: number) => void;
  isGenerating: boolean;
  theme: 'dark' | 'light';
  onClose?: () => void;
}

export const ThreeStageHUD: React.FC<ThreeStageHUDProps> = ({
  visualizerMode,
  onChangeMode,
  speedIntensity,
  onChangeIntensity,
  isGenerating,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-xl transition-all duration-300">
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-t-lg border text-[11px] font-medium backdrop-blur-md cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#0e1117]/85 border-white/10 text-slate-400 hover:text-white'
              : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
          title={isCollapsed ? 'Show 3D HUD Controls' : 'Hide Controls for Full 3D View'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Expand 3D Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Zen Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Control Dock */}
      {!isCollapsed && (
        <div
          className={`p-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
            isDark
              ? 'bg-[#0c0f14]/90 border-white/10 text-slate-200'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Visualizer Mode Selection Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/5 w-full sm:w-auto justify-center">
              <button
                onClick={() => onChangeMode('chrono_orb')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  visualizerMode === 'chrono_orb'
                    ? 'bg-amber-400/20 text-amber-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>Chrono Orb</span>
              </button>

              <button
                onClick={() => onChangeMode('singularity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  visualizerMode === 'singularity'
                    ? 'bg-amber-400/20 text-amber-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>

              <button
                onClick={() => onChangeMode('aura_wave')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  visualizerMode === 'aura_wave'
                    ? 'bg-amber-400/20 text-amber-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aura Wave</span>
              </button>
            </div>

            {/* Neural Energy / Rotation Velocity Slider */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start px-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Sliders className="w-3 h-3 text-amber-300" />
                <span>Harmonic Rate:</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={speedIntensity}
                onChange={(e) => onChangeIntensity(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
                title={`Speed multiplier: ${speedIntensity}x`}
              />
              <span className="text-[11px] font-mono tabular-nums text-amber-300 w-8 text-right">
                {speedIntensity.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Drag inside 3D viewport to inspect quantum geometry</span>
            <span className="text-amber-300 font-medium">
              {isGenerating ? 'Active Neural Flux' : 'Synchronized Ambient Mode'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
