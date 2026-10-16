export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
  model?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  focusDomain?: string;
}

export type VisualizerMode = 'chrono_orb' | 'singularity' | 'aura_wave';

export type LuxuryTheme = 'dark' | 'light';

export interface JAVIRUSCapability {
  id: string;
  title: string;
  description: string;
  iconName: string;
  prompt: string;
}
