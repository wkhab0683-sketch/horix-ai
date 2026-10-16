import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ThreeStageHUD } from './components/ThreeStageHUD';
import { ChatSession, ChatMessage, VisualizerMode } from './types';
import {
  loadSavedSessions,
  saveSessions,
  getSavedActiveSessionId,
  setSavedActiveSessionId,
  getSavedTheme,
  setSavedTheme,
  createNewSession,
  streamChatCompletion,
} from './services/chatService';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [show3DStage, setShow3DStage] = useState(true);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('chrono_orb');
  const [speedIntensity, setSpeedIntensity] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeDomain, setActiveDomain] = useState('all');

  const abortControllerRef = useRef<(() => void) | null>(null);

  // Initialize theme and saved sessions
  useEffect(() => {
    const savedTheme = getSavedTheme();
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const loaded = loadSavedSessions();
    if (loaded.length > 0) {
      const sanitized = loaded.map((s) => {
        if (!s.messages || s.messages.length === 0) {
          return {
            ...s,
            messages: [
              {
                id: `asst_welcome_${s.createdAt}`,
                role: 'assistant' as const,
                content: `Greetings. I am **JAVIRUS AI**, your personal strategic intelligence assistant developed under the vision of **HORIX.AI**.

My mission is to help you think smarter, work faster, solve problems, and turn ideas into reality.

I am fully operational across:
- **Coding & Architecture**: High-performance system design, TypeScript/React, API orchestration, and debugging.
- **Venture & Business Strategy**: Business models, unit economics, and competitive advantage.
- **AI Automation Workflows**: Designing agentic pipelines and tool integrations.
- **Research & Deep Learning**: Distilling complex concepts into practical execution.

Select one of the executive capabilities below, or submit any custom directive to begin.`,
                timestamp: s.createdAt,
              },
            ],
          };
        }
        return s;
      });
      setSessions(sanitized);
      const savedActiveId = getSavedActiveSessionId();
      const matched = sanitized.find((s) => s.id === savedActiveId);
      setActiveSessionId(matched ? matched.id : sanitized[0].id);
    } else {
      const initial = createNewSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
      saveSessions([initial]);
      setSavedActiveSessionId(initial.id);
    }
  }, []);

  // Sync sessions changes to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    if (activeSessionId) {
      setSavedActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setSavedTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const handleNewSession = (domain?: string) => {
    const fresh = createNewSession(domain);
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const handleClearAllSessions = () => {
    const fresh = createNewSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    saveSessions([fresh]);
  };

  const handleSelectDomain = (domainId: string) => {
    setActiveDomain(domainId);
    if (currentSession && currentSession.messages.length === 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSession.id ? { ...s, focusDomain: domainId } : s
        )
      );
    }
  };

  // Send message and stream reply from server
  const handleSendMessage = async (userPrompt: string) => {
    if (!currentSession || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `asst_${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Auto generate title from first prompt if new
    let sessionTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      sessionTitle = userPrompt.slice(0, 42).trim() + (userPrompt.length > 42 ? '...' : '');
    }

    const updatedMessages = [...currentSession.messages, userMessage, assistantMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              title: sessionTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsGenerating(true);

    const cancelStream = await streamChatCompletion({
      messages: [...currentSession.messages, userMessage],
      focusDomain: currentSession.focusDomain || (activeDomain !== 'all' ? activeDomain : undefined),
      onChunk: (chunk: string) => {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== currentSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            };
          })
        );
      },
      onError: (errMsg: string) => {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== currentSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      content:
                        m.content ||
                        `An error occurred while communicating with JAVIRUS neural engine: ${errMsg}`,
                      isStreaming: false,
                    }
                  : m
              ),
            };
          })
        );
      },
      onFinish: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== currentSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, isStreaming: false }
                  : m
              ),
            };
          })
        );
      },
    });

    abortControllerRef.current = cancelStream;
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleRegenerateLast = () => {
    if (!currentSession || isGenerating || currentSession.messages.length === 0) return;
    const msgs = currentSession.messages;
    const lastUserIndex = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;
    const actualIndex = msgs.length - 1 - lastUserIndex;
    const promptToRetry = msgs[actualIndex].content;

    // Prune subsequent messages
    const trimmed = msgs.slice(0, actualIndex);
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSession.id ? { ...s, messages: trimmed } : s))
    );

    handleSendMessage(promptToRetry);
  };

  const isDark = theme === 'dark';
  const hasMessages = currentSession && currentSession.messages.length > 0;

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark
          ? 'bg-[#090b0e] text-slate-100 selection:bg-amber-400/30 selection:text-amber-100'
          : 'bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-slate-900'
      }`}
    >
      {/* Top Bar Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        show3DStage={show3DStage}
        onToggle3DStage={() => setShow3DStage(!show3DStage)}
        visualizerMode={visualizerMode}
        onChangeVisualizerMode={setVisualizerMode}
        onNewChat={() => handleNewSession()}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        activeDomain={activeDomain}
        onSelectDomain={handleSelectDomain}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Desktop Sidebar */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={() => handleNewSession()}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearAllSessions={handleClearAllSessions}
          theme={theme}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={false}
        />

        {/* Mobile Slide-Over Sidebar Drawer */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={() => handleNewSession()}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onClearAllSessions={handleClearAllSessions}
          theme={theme}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isMobile={true}
        />

        {/* Primary Content View: Dual Layout */}
        <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
          {/* Left / Center Chat Column */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            {currentSession && (
              <ChatInterface
                messages={currentSession.messages}
                isGenerating={isGenerating}
                onSendMessage={handleSendMessage}
                onStopGeneration={handleStopGeneration}
                onRegenerateLast={handleRegenerateLast}
                theme={theme}
                soundEnabled={soundEnabled}
                focusDomain={currentSession.focusDomain}
              />
            )}
          </div>

          {/* Right / Secondary 3D Stage Column (Desktop & Toggleable) */}
          {show3DStage && (
            <div
              className={`relative hidden lg:flex flex-col border-l transition-all duration-300 ${
                hasMessages ? 'w-[420px] xl:w-[480px]' : 'w-[480px] xl:w-[560px]'
              } ${isDark ? 'border-white/10 bg-[#080a0e]' : 'border-slate-200 bg-slate-100/50'}`}
            >
              {/* Top Viewport Header */}
              <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs select-none pointer-events-none">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 pointer-events-auto">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-semibold tracking-wide text-amber-200">
                    HORIX CHRONO CORE
                  </span>
                </div>
                <div className="text-[11px] font-mono tabular-nums text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {visualizerMode.toUpperCase()}
                </div>
              </div>

              {/* 3D WebGL Canvas */}
              <div className="flex-1 w-full h-full relative">
                <ThreeCanvas
                  isGenerating={isGenerating}
                  visualizerMode={visualizerMode}
                  theme={theme}
                  intensity={speedIntensity}
                />
              </div>

              {/* Collapsible Unified Bottom Control Dock */}
              <ThreeStageHUD
                visualizerMode={visualizerMode}
                onChangeMode={setVisualizerMode}
                speedIntensity={speedIntensity}
                onChangeIntensity={setSpeedIntensity}
                isGenerating={isGenerating}
                theme={theme}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
