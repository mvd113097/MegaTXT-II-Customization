import React, { useState } from "react";
import {
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  Layers,
  Clock,
  Settings,
  Lock,
  RefreshCw,
  Palette,
} from "lucide-react";

interface NavbarProps {
  hasFile: boolean;
  totalChars: number;
  completedChars: number;
  isCompleted?: boolean;
  isRunning?: boolean;
  completedChunks?: number;
  totalChunks?: number;
  onReset: () => void;
  onOpenGlossary: () => void;
  onOpenHistory: () => void;
  onOpenTelegramSettings: () => void;
  glossaryCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasFile,
  totalChars,
  completedChars,
  isCompleted = false,
  isRunning = false,
  completedChunks = 0,
  totalChunks = 0,
  onReset,
  onOpenGlossary,
  onOpenHistory,
  onOpenTelegramSettings,
  glossaryCount,
  theme,
  onToggleTheme,
  userEmail,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-40 mx-3 mt-4 app-responsive-container max-w-md w-[calc(100%-24px)] mx-auto rounded-3xl transition-all duration-200 glass-panel-card">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-4 sm:px-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-purple-800/60 text-purple-600 dark:text-purple-300 shadow-sm shadow-purple-500/15 backdrop-blur-xs">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-[20px] font-black text-purple-800 dark:text-purple-200 tracking-tight leading-tight drop-shadow-2xs">
              MegaText
            </h1>
            <p className="text-[12px] font-bold text-purple-700 dark:text-purple-300 leading-none">
              Chinese → English
            </p>
          </div>
        </div>

        {/* Right Action Icons (Matching reference: Sun/Moon + Menu hamburger) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            id="toggle-theme-btn"
            type="button"
            onClick={onToggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-amber-400 shadow-2xs transition hover:bg-white dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Night Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-purple-700" />
            )}
          </button>

          {/* Menu Drawer Button */}
          <button
            id="nav-menu-btn"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 shadow-2xs transition hover:bg-white dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
            title="Menu & Settings"
            aria-label="Open menu"
          >
            {isMenuOpen ? <X className="h-5 w-5 text-purple-600" /> : <Menu className="h-4.5 w-4.5 text-purple-700 dark:text-purple-300" />}
          </button>
        </div>
      </div>

      {/* Slide-out Menu Popover for Extra Settings */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-3xl border border-purple-100/90 dark:border-purple-900/60 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md p-3 shadow-xl transition animate-in fade-in slide-in-from-top-2">
          <div className="mx-auto max-w-md space-y-1.5">
            {/* Glossary */}
            <button
              id="menu-glossary-btn"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenGlossary();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-purple-600" />
                <span>Glossary & Terminology</span>
              </div>
              {glossaryCount > 0 && (
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {glossaryCount} terms
                </span>
              )}
            </button>

            {/* History - placed directly below Glossary & Terminology */}
            <button
              id="menu-history-btn"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenHistory();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
            >
              <Clock className="h-4 w-4 text-purple-600" />
              <span>History</span>
            </button>

            {/* App Settings */}
            <button
              id="menu-telegram-btn"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenTelegramSettings();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
            >
              <Settings className="h-4 w-4 text-purple-600" />
              <span>Settings</span>
            </button>

            {/* Lock Workspace */}
            {onLogout && (
              <button
                id="menu-lock-btn"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
              >
                <Lock className="h-4 w-4 text-purple-600" />
                <span>Lock Workspace</span>
              </button>
            )}

            {/* Reset / New Novel */}
            {hasFile && (
              <button
                id="menu-reset-btn"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onReset();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Start New Novel</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


