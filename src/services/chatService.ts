import { ChatMessage, ChatSession } from '../types';

const STORAGE_KEY = 'javirus_ai_sessions_v1';
const ACTIVE_SESSION_KEY = 'javirus_ai_active_session_id';
const THEME_KEY = 'javirus_ai_theme';

export function loadSavedSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    return Array.isArray(sessions) ? sessions : [];
  } catch (err) {
    console.error('Failed to load saved sessions from localStorage:', err);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to persist sessions to localStorage:', err);
  }
}

export function getSavedActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function setSavedActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

export function getSavedTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'light' ? 'light' : 'dark';
}

export function setSavedTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_KEY, theme);
}

export const INITIAL_AI_WELCOME_CONTENT = `Greetings. I am **JAVIRUS AI**, your personal strategic intelligence assistant developed under the vision of **HORIX.AI**.

My mission is to help you think smarter, work faster, solve problems, and turn ideas into reality.

I am fully operational across:
- **Coding & Architecture**: System design, React/TypeScript, API orchestration, and debugging.
- **Venture & Business Strategy**: Business models, unit economics, and competitive advantage.
- **AI Automation Workflows**: Designing agentic pipelines and tool integrations.
- **Research & Deep Learning**: Distilling complex concepts into practical execution.

Select one of the executive capabilities below, or submit any custom directive to begin.`;

export function createNewSession(focusDomain?: string): ChatSession {
  const now = Date.now();
  const initialMessage: ChatMessage = {
    id: `asst_welcome_${now}`,
    role: 'assistant',
    content: INITIAL_AI_WELCOME_CONTENT,
    timestamp: now,
  };

  return {
    id: `javirus_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'New Strategy Session',
    createdAt: now,
    updatedAt: now,
    messages: [initialMessage],
    focusDomain,
  };
}

export async function streamChatCompletion({
  messages,
  focusDomain,
  onChunk,
  onError,
  onFinish,
}: {
  messages: ChatMessage[];
  focusDomain?: string;
  onChunk: (text: string) => void;
  onError: (errorMsg: string) => void;
  onFinish: () => void;
}): Promise<() => void> {
  const controller = new AbortController();

  try {
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formattedMessages,
        focusDomain,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available in response.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.slice(5).trim();

        if (dataStr === '[DONE]') {
          onFinish();
          return () => controller.abort();
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError(parsed.error);
          } else if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          // Plain text fallback
          if (dataStr) onChunk(dataStr);
        }
      }
    }

    onFinish();
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('Chat stream error:', err);
      onError(err?.message || 'Connection interrupted.');
    }
    onFinish();
  }

  return () => controller.abort();
}

// Speak message using server TTS or Web Speech fallback
export async function speakMessage(text: string, onStart?: () => void, onEnd?: () => void): Promise<() => void> {
  let isCancelled = false;
  let currentAudio: HTMLAudioElement | null = null;

  // Clean text of markdown syntax before speaking
  const plainText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~]/g, '')
    .trim();

  try {
    onStart?.();
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: plainText.slice(0, 450) }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio && !isCancelled) {
        currentAudio = new Audio(`data:audio/wav;base64,${data.audio}`);
        currentAudio.onended = () => onEnd?.();
        currentAudio.onerror = () => onEnd?.();
        await currentAudio.play();
        return () => {
          isCancelled = true;
          currentAudio?.pause();
          onEnd?.();
        };
      }
    }
  } catch (e) {
    // Silently fall through to browser speech synthesis
  }

  // Browser SpeechSynthesis fallback
  if ('speechSynthesis' in window && !isCancelled) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 400));
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // Slightly lower, authoritative tone for JAVIRUS
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
    return () => {
      isCancelled = true;
      window.speechSynthesis.cancel();
      onEnd?.();
    };
  }

  onEnd?.();
  return () => {};
}
