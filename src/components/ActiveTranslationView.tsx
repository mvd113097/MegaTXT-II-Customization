import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Download,
  BookCheck,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Activity,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  TranslationSession,
  TranslationMetrics,
  TranslationStyle,
  TranslationMode,
  TextChunk,
} from "../types";
import { SleepingCatIllustration } from "./illustrations/StorybookArtwork";

interface ActiveTranslationViewProps {
  session: TranslationSession;
  metrics: TranslationMetrics;
  mode: TranslationMode;
  onChangeMode: (mode: TranslationMode) => void;
  style: TranslationStyle;
  onChangeStyle: (style: TranslationStyle) => void;
  customInstructions: string;
  onChangeCustomInstructions: (instructions: string) => void;
  concurrency: number;
  onChangeConcurrency: (concurrency: number) => void;
  isRunning: boolean;
  isPaused: boolean;
  isStarting?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onTranslateNext: () => void;
  onRetryFailed: () => void;
  onOpenExport: () => void;
  onDownloadProgress: (format?: "epub" | "txt") => void;
  onTranslateChunk: (index: number) => void;
  onReset: () => void;
  completedEnglishWords: number;
  lastDownloadedWords: number;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export const ActiveTranslationView: React.FC<ActiveTranslationViewProps> = ({
  session,
  metrics,
  mode,
  onChangeMode,
  style,
  onChangeStyle,
  customInstructions,
  onChangeCustomInstructions,
  concurrency,
  onChangeConcurrency,
  isRunning,
  isPaused,
  isStarting,
  onStart,
  onPause,
  onResume,
  onTranslateNext,
  onRetryFailed,
  onOpenExport,
  onDownloadProgress,
  onTranslateChunk,
  onReset,
  completedEnglishWords,
  lastDownloadedWords,
}) => {
  const [showAllQueue, setShowAllQueue] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "processing" | "pending">("all");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const totalChunks = session.chunks.length;
  const completedChunks = session.chunks.filter((c) => c.status === "completed");
  const processingChunks = session.chunks.filter((c) => c.status === "processing");
  const pendingChunks = session.chunks.filter((c) => c.status === "pending");
  const errorChunks = session.chunks.filter((c) => c.status === "error");

  const percent = totalChunks > 0 ? Math.min(100, Math.round((completedChunks.length / totalChunks) * 100)) : 0;
  const charPercent = metrics.totalChars > 0 ? Math.min(100, Math.round((metrics.completedChars / metrics.totalChars) * 100)) : 0;

  // Find active chunk
  const activeChunk =
    processingChunks[0] ||
    pendingChunks[0] ||
    session.chunks[Math.min(completedChunks.length, totalChunks - 1)];

  // Filtered chunks for the detailed inspector
  const filteredChunks = session.chunks.filter((chunk) => {
    if (statusFilter !== "all" && chunk.status !== statusFilter) return false;
    if (searchTerm) {
      const matchIndex = `chapter ${chunk.index + 1}`.includes(searchTerm.toLowerCase());
      const matchTitle = chunk.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchChinese = chunk.chineseText.includes(searchTerm);
      const matchEnglish = chunk.englishText?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchIndex || matchTitle || matchChinese || matchEnglish;
    }
    return true;
  });

  // Circular gauge calculations
  const radius = 46;
  const strokeWidth = 8.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const newWordsSinceLast = Math.max(0, completedEnglishWords - lastDownloadedWords);

  return (
    <div className="space-y-3.5 transition animate-in fade-in duration-200">
      {/* 1. Novel Header Card (Reference Screen 2) */}
      <div className="rounded-3xl p-4 sm:p-5 transition-all duration-200 glass-panel-card card-target-header">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-900/60 dark:to-pink-950/60 text-purple-600 dark:text-purple-300 shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 truncate" title={session.fileName}>
                {session.fileName}
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-300 font-medium truncate">
                Chapter {activeChunk ? activeChunk.index + 1 : 1} · {completedEnglishWords.toLocaleString()} words
                {metrics.estimatedRemainingSeconds > 0
                  ? ` · ~${formatDuration(metrics.estimatedRemainingSeconds)} remaining`
                  : ""}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/80 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                Translating...
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/80 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/80 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Big Circular Progress Card (Reference Screen 2) */}
      <div className="rounded-3xl p-4 sm:p-5 transition-all duration-200 glass-panel-card card-target-progress">
        <div className="flex flex-row items-center gap-4 sm:gap-6">
          {/* Circular Donut Gauge on Left */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg className="h-28 w-28 sm:h-32 sm:w-32 -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-purple-100 dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <defs>
                <linearGradient id="activePastelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#activePastelGrad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner Percentage (Exact 68% format in reference) */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
                {percent}%
              </span>
            </div>
          </div>

          {/* 4 Rows on Right - Exact two-tier vertical hierarchy in reference */}
          <div className="flex-1 min-w-0 space-y-2 text-xs">
            <div className="flex items-start gap-2 min-w-0">
              <Layers className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm leading-tight">
                  {completedChunks.length.toLocaleString()} / {totalChunks.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  chunks completed
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <FileText className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm leading-tight">
                  {metrics.completedChars.toLocaleString()} / {metrics.totalChars.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  Chinese characters
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <BookCheck className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm leading-tight">
                  {completedEnglishWords.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  English words ready
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <Clock className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-xs sm:text-sm leading-tight">
                  {metrics.estimatedRemainingSeconds > 0
                    ? `~${formatDuration(metrics.estimatedRemainingSeconds)}`
                    : "Calculating..."}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "Current Chapter" Card (Reference Screen 2) */}
      {activeChunk && (
        <div className="rounded-3xl p-4 sm:p-5 transition-all duration-200 glass-panel-card space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span>Current Chapter</span>
            </div>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
              Chunk {activeChunk.index + 1} / {totalChunks} · {activeChunk.charCount.toLocaleString()} chars
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeChunk.title || `Chapter ${activeChunk.index + 1}`}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {activeChunk.chineseText.slice(0, 90)}...
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 relative h-2 overflow-hidden rounded-full bg-purple-100/70 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{percent}%</span>
          </div>
        </div>
      )}

      {/* 4. Active Model & Streams Cards Side-by-Side (Reference Screen 2) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 rounded-2xl p-3 glass-panel-card">
          <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/80">Active Model</div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
              gemini-3.8-flash
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              (Recommended)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl p-3 glass-panel-card">
          <Zap className="h-4 w-4 text-purple-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/80">Streams</div>
            <div className="flex items-center gap-1">
              <select
                value={concurrency}
                onChange={(e) => onChangeConcurrency(Number(e.target.value))}
                className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-purple-300/80">
              (Maximum Speed)
            </div>
          </div>
        </div>
      </div>

      {/* 5. Primary Action Button (Reference Screen 2) */}
      <div>
        {isStarting ? (
          <button
            id="starting-translation-btn"
            disabled
            style={{
              borderRadius: "var(--custom-btn-radius)",
            }}
            className="flex w-full items-center justify-center gap-2 bg-purple-400 py-3.5 px-4 text-sm font-bold text-white shadow-md opacity-90 cursor-wait text-center leading-snug"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Starting translation...</span>
          </button>
        ) : isRunning ? (
          <button
            id="active-pause-btn"
            onClick={onPause}
            style={{
              background: "var(--custom-btn-gradient)",
              borderRadius: "var(--custom-btn-radius)",
            }}
            className="flex w-full items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-black text-white shadow-md shadow-purple-500/20 active:scale-98 transition cursor-pointer text-center leading-snug"
          >
            <span className="font-mono text-base leading-none">❚❚</span>
            <span>Pause Translation</span>
          </button>
        ) : isPaused ? (
          <button
            id="active-resume-btn"
            onClick={onResume}
            style={{
              background: "var(--custom-btn-gradient)",
              borderRadius: "var(--custom-btn-radius)",
            }}
            className="flex w-full items-center justify-center gap-2 py-3.5 px-4 text-sm font-black text-white shadow-md shadow-pink-500/20 active:scale-98 transition cursor-pointer text-center leading-snug"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Resume Translation</span>
          </button>
        ) : (
          <button
            id="active-start-btn"
            onClick={onStart}
            style={{
              background: "var(--custom-btn-gradient)",
              borderRadius: "var(--custom-btn-radius)",
            }}
            className="flex w-full items-center justify-center gap-2 py-3.5 px-4 text-sm font-black text-white shadow-md shadow-pink-500/20 active:scale-98 transition cursor-pointer text-center leading-snug"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>{mode === "cloud" ? "Start Cloud Translation ☁️" : "Start Translation ⚡"}</span>
          </button>
        )}
      </div>

      {/* 6. Two Secondary Action Buttons Side-by-Side (Reference Screen 2) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Download EPUB Button */}
        <button
          id="active-download-epub-btn"
          onClick={() => onDownloadProgress("epub")}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 py-3 px-2 text-center text-xs font-extrabold text-sky-800 dark:text-sky-200 transition active:scale-98 cursor-pointer shadow-2xs leading-tight backdrop-blur-xs"
        >
          <BookCheck className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <span>Download Current EPUB</span>
        </button>

        {/* Delete Translation Button */}
        <button
          id="active-reset-book-btn"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 py-3 px-2 text-center text-xs font-extrabold text-rose-700 dark:text-rose-300 transition active:scale-98 cursor-pointer shadow-2xs leading-tight backdrop-blur-xs"
        >
          <Trash2 className="h-4 w-4 shrink-0 text-rose-500" />
          <span>Delete Translation</span>
        </button>
      </div>

      {/* 7. "Recent Activity" Card (Reference Screen 2) */}
      <div className="rounded-3xl p-4 sm:p-5 transition-all duration-200 glass-panel-card card-target-queue space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Activity className="h-4 w-4 text-purple-500" />
            <span>Recent Activity</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllQueue(!showAllQueue)}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            <span>{showAllQueue ? "Hide Queue" : `View All (${totalChunks})`}</span>
            {showAllQueue ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Chronological Recent Chapter Activity Items */}
        <div className="space-y-2 text-xs">
          {session.chunks.slice(0, 5).map((chunk, idx) => {
            const isDone = chunk.status === "completed";
            const isActive = chunk.status === "processing";

            return (
              <div
                key={chunk.id}
                className="flex items-center justify-between py-1.5 border-b border-purple-50/70 dark:border-slate-800/60 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isDone ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isActive ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white shrink-0 text-[10px] font-bold animate-pulse">
                      ✓
                    </span>
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-400 shrink-0 text-[10px] font-bold">
                      •
                    </span>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    Chapter {chunk.index + 1} {chunk.title ? `· ${chunk.title}` : ""} {isActive ? "(Current)" : ""}
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0">
                  {isDone ? "completed" : isActive ? "Translating..." : "queued"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Collapsible Full Chapter Inspector & Search */}
      {showAllQueue && (
        <div className="rounded-3xl p-4 transition-all duration-200 glass-panel-card animate-in fade-in space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-2.5 py-0.5 font-bold transition cursor-pointer ${
                  statusFilter === "all" ? "bg-purple-600 text-white" : "text-slate-500 hover:text-purple-600"
                }`}
              >
                All ({totalChunks})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`rounded-full px-2.5 py-0.5 font-bold transition cursor-pointer ${
                  statusFilter === "completed" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                Done ({completedChunks.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`rounded-full px-2.5 py-0.5 font-bold transition cursor-pointer ${
                  statusFilter === "pending" ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500"
                }`}
              >
                Queued ({pendingChunks.length})
              </button>
            </div>

            <div className="relative w-full sm:w-44">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-slate-800 py-1 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-purple-50 dark:divide-slate-800">
            {filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="flex items-center justify-between py-2 text-xs"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Chapter {chunk.index + 1}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate">
                    {chunk.charCount.toLocaleString()} chars · {chunk.status}
                  </p>
                </div>
                {chunk.status !== "completed" && !isRunning && (
                  <button
                    type="button"
                    onClick={() => onTranslateChunk(chunk.index)}
                    className="rounded-lg border border-purple-200 dark:border-purple-800 px-2 py-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                  >
                    Translate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. THE SLEEPING CAT ON BOOKS ILLUSTRATION (Reference Screen 2) */}
      <SleepingCatIllustration className="mt-0" />
    </div>
  );
};
