import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, X, PanelLeftClose, PanelLeft, Edit3, Check } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  theme: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  theme,
  isOpen,
  onClose,
  isMobile,
}) => {
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const saveRename = (sessionId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isOpen && !isMobile) {
    return null;
  }

  const content = (
    <div
      className={`h-full flex flex-col justify-between border-r select-none transition-colors ${
        isDark ? 'bg-[#0e1117] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="p-3.5 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-300">
              Intelligence Vault
            </span>
            <span className="text-[11px] text-slate-500 tabular-nums">
              ({sessions.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Start New Conversation Button */}
        <button
          onClick={() => {
            onNewSession();
            if (isMobile) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs text-slate-950 bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-95 shadow-sm transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New JAVIRUS Session</span>
        </button>

        {/* Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dialogue archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
              isDark
                ? 'bg-black/30 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-amber-400/40'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-amber-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-slate-500">
            {searchQuery ? 'No matching dialogue found.' : 'No saved conversations yet.'}
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isActive = activeSessionId === s.id;
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  if (isMobile) onClose();
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-amber-400/10 text-amber-200 border border-amber-400/25 font-medium'
                      : 'bg-amber-100/70 text-amber-950 border border-amber-300/50 font-semibold'
                    : isDark
                    ? 'hover:bg-white/5 text-slate-300 border border-transparent'
                    : 'hover:bg-slate-200/60 text-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  />
                  {isEditing ? (
                    <form
                      onSubmit={(e) => saveRename(s.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1"
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        onBlur={() => saveRename(s.id)}
                        className="w-full bg-black/40 border border-amber-400/40 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 hover:text-emerald-400"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="truncate flex-1">
                      <div className="truncate text-xs">{s.title}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span>{s.messages.length} msg</span>
                        <span>·</span>
                        <span>{formatTimestamp(s.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Actions: Rename / Delete */}
                {!isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1.5 transition-opacity">
                    <button
                      onClick={(e) => startRename(s, e)}
                      className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-white/10"
                      title="Rename session"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Branding & Clear Actions */}
      <div className="p-3 border-t border-white/5 space-y-2.5">
        {sessions.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-[11px] text-rose-300">Clear all archives?</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onClearAllSessions();
                      setConfirmClear(false);
                    }}
                    className="px-2 py-0.5 text-[11px] font-medium bg-rose-500 text-white rounded hover:bg-rose-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear dialogue history</span>
              </button>
            )}
          </div>
        )}

        {/* HORIX.AI Brand Badge */}
        <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 text-center">
          <div className="text-[11px] font-semibold tracking-wide gold-gradient-text uppercase">
            HORIX.AI
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Think Smarter · Build the Future
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 lg:w-72 h-full shrink-0 hidden md:block">
      {content}
    </aside>
  );
};
