import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SuggestedPrompts } from './SuggestedPrompts';
import { speakMessage } from '../services/chatService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (content: string) => void;
  onStopGeneration: () => void;
  onRegenerateLast: () => void;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  focusDomain?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isGenerating,
  onSendMessage,
  onStopGeneration,
  onRegenerateLast,
  theme,
  soundEnabled,
  focusDomain,
}) => {
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll down during streaming
  useEffect(() => {
    if (messagesEndRef.current && !showScrollBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, showScrollBottom]);

  // Read the latest message with voice if soundEnabled is true and assistant just finished
  useEffect(() => {
    if (!soundEnabled) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.isStreaming && !isGenerating) {
      handleSpeak(lastMsg.id, lastMsg.content);
    }
  }, [messages.length, isGenerating]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 160);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Audio Speech Narration
  const handleSpeak = async (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeechRef.current?.();
      setSpeakingId(null);
      return;
    }

    stopSpeechRef.current?.();
    setSpeakingId(id);

    const cancelFn = await speakMessage(
      text,
      () => setSpeakingId(id),
      () => setSpeakingId(null)
    );
    stopSpeechRef.current = cancelFn;
  };

  // Voice Dictation (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden select-text">
      {/* Scrollable Dialogue Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isSpeaking = speakingId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3.5 transition-all ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span className="text-black font-extrabold text-xs">J</span>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 shadow-sm text-sm transition-all ${
                    isUser
                      ? isDark
                        ? 'bg-amber-400/15 border border-amber-400/30 text-white rounded-tr-xs'
                        : 'bg-amber-100 border border-amber-300/60 text-slate-900 rounded-tr-xs'
                      : isDark
                      ? 'bg-[#12161f]/90 border border-white/10 text-slate-100 rounded-tl-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Sender Metadata Bar */}
                  <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-80 select-none">
                    <span className="font-semibold tracking-wide">
                      {isUser ? 'Direct Executive Order' : 'JAVIRUS AI'}
                    </span>
                    <span className="tabular-nums text-[10px]">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="leading-relaxed">
                    <MarkdownRenderer content={message.content} theme={theme} />
                  </div>

                  {/* Assistant Footer Action Strip */}
                  {!isUser && !message.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] tracking-wide uppercase text-amber-300/80 font-medium">
                          Gemini 3.8 Flash
                        </span>
                        <span>·</span>
                        <span className="text-[10px]">Neural Verified</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Audio Speak */}
                        <button
                          onClick={() => handleSpeak(message.id, message.content)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isSpeaking
                              ? 'text-amber-300 bg-amber-400/20'
                              : 'hover:text-amber-300 hover:bg-white/5'
                          }`}
                          title={isSpeaking ? 'Stop speech' : 'Listen to response'}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy Content */}
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="p-1 rounded hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border mt-1 shadow-sm ${
                      isDark
                        ? 'bg-slate-800 border-white/10 text-slate-200'
                        : 'bg-slate-200 border-slate-300 text-slate-700'
                    }`}
                  >
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {/* Initial Capability Cards below welcome response */}
          {messages.length <= 1 && !isGenerating && (
            <div className="pt-2 animate-fade-in">
              <SuggestedPrompts
                onSelectPrompt={(prompt) => onSendMessage(prompt)}
                theme={theme}
              />
            </div>
          )}

          {/* Typing Indicator when Generating */}
          {isGenerating && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <span className="text-black font-extrabold text-xs">J</span>
              </div>
              <div
                className={`p-4 rounded-2xl rounded-tl-xs border text-xs flex items-center gap-2.5 ${
                  isDark
                    ? 'bg-[#12161f]/90 border-white/10 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                </div>
                <span className="text-slate-400 tracking-wide font-medium">
                  Synthesizing neural response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-24 right-6 p-2 rounded-full border shadow-lg transition-transform hover:scale-105 cursor-pointer z-20 ${
            isDark
              ? 'bg-[#181e2b] border-white/15 text-amber-300 hover:bg-[#202737]'
              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
          }`}
          title="Jump to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Bottom Floating Input Console */}
      <div
        className={`border-t px-4 py-3 shrink-0 transition-colors ${
          isDark ? 'bg-[#0b0d11]/95 border-white/10' : 'bg-slate-50/95 border-slate-200'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick status bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-medium">JAVIRUS AI Core</span>
              <span>·</span>
              <span className="text-slate-400">
                {focusDomain ? `Focus: ${focusDomain}` : 'Executive Strategic Reasoning'}
              </span>
            </div>

            {messages.length > 0 && !isGenerating && (
              <button
                onClick={onRegenerateLast}
                className="flex items-center gap-1 text-[11px] hover:text-amber-300 transition-colors cursor-pointer"
                title="Regenerate the last answer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            )}
          </div>

          {/* Input Box Container */}
          <form
            onSubmit={handleSubmit}
            className={`relative flex items-end gap-2 p-2 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#12161f] border-white/10 focus-within:border-amber-400/40 focus-within:ring-1 focus-within:ring-amber-400/20'
                : 'bg-white border-slate-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20'
            }`}
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isDark
                  ? 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isListening ? 'Listening (Click to stop)' : 'Voice input (Web Speech)'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Expandable Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : 'Message JAVIRUS AI (Enter to send, Shift+Enter for newline)...'
              }
              className="flex-1 max-h-44 bg-transparent outline-none resize-none text-sm leading-relaxed py-1 px-1 placeholder:text-slate-400"
            />

            {/* Send / Stop Generation Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer shrink-0"
                title="Halt neural generation"
              >
                <Square className="w-4 h-4 fill-amber-300" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  input.trim()
                    ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-semibold shadow-sm hover:opacity-95'
                    : 'bg-slate-700/20 text-slate-500 cursor-not-allowed'
                }`}
                title="Send directive"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Footer Subtext */}
          <div className="text-[10px] text-center text-slate-400 select-none pt-0.5">
            JAVIRUS AI operates under the vision of HORIX.AI · Confirm critical business or code actions.
          </div>
        </div>
      </div>
    </div>
  );
};
