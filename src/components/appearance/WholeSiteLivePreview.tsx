import React, { useState } from "react";
import {
  VisualAppearanceConfig,
} from "../../theme/visualAppearance";
import {
  Eye,
  BookOpen,
  PieChart,
  CheckCircle2,
  ListOrdered,
  UploadCloud,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Download,
  Clock,
  BookCheck,
  Activity,
  Play,
  RotateCcw,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";

interface WholeSiteLivePreviewProps {
  config: VisualAppearanceConfig;
  showNotification?: boolean;
}

type PreviewViewMode = "whole" | "translation" | "complete" | "upload";

export const WholeSiteLivePreview: React.FC<WholeSiteLivePreviewProps> = ({
  config,
  showNotification,
}) => {
  const [viewMode, setViewMode] = useState<PreviewViewMode>("whole");
  const [zoomLevel, setZoomLevel] = useState<number>(85); // 85% default so more fits comfortably
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("light");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Helper styles that reflect config variables directly in the simulated preview
  const globalCardStyle: React.CSSProperties = {
    background: "var(--custom-card-bg)",
    backdropFilter: `blur(var(--custom-card-blur))`,
    WebkitBackdropFilter: `blur(var(--custom-card-blur))`,
    border: `var(--custom-card-border-width, 1px) solid var(--custom-card-border)`,
    borderRadius: "var(--custom-card-radius, 28px)",
    boxShadow: "var(--custom-card-shadow)",
    fontFamily: "var(--custom-font-family)",
    color: "var(--custom-text-body)",
  };

  const getCardStyle = (target: "complete" | "progress" | "header" | "queue" | "upload"): React.CSSProperties => {
    const individual = config.individualCards?.[target] || (config as any)[`${target}Card`];
    if (individual && individual.enabled) {
      const radiusMap: Record<string, string> = {
        inherit: "var(--custom-card-radius, 28px)",
        sleek: "14px",
        standard: "20px",
        rounded: "28px",
        ultra: "36px",
        pill: "48px",
      };
      const paddingMap: Record<string, string> = {
        inherit: "var(--custom-card-padding, 18px)",
        compact: "10px",
        standard: "18px",
        relaxed: "24px",
        spacious: "30px",
      };
      const shadowMap: Record<string, string> = {
        inherit: "var(--custom-card-shadow)",
        none: "none",
        subtle: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        deep: "0 20px 25px -5px rgba(0, 0, 0, 0.18)",
        glow: "0 0 25px rgba(168, 85, 247, 0.35)",
      };

      const radKey = individual.borderRadius || individual.radius || "inherit";
      const radValue = radiusMap[radKey] || radKey;
      const padKey = individual.padding || "inherit";
      const padValue = paddingMap[padKey] || padKey;
      const shKey = individual.shadow || "inherit";
      const shValue = shadowMap[shKey] || shKey;

      const bgColor = individual.customColor || individual.backgroundColor || "";
      const borderColor = individual.borderColor || bgColor;
      const borderWidth = individual.borderWidth !== undefined ? `${individual.borderWidth}px` : "1px";

      return {
        background: bgColor ? `var(--card-${target}-bg, ${bgColor})` : `var(--card-${target}-bg, var(--custom-card-bg))`,
        border: individual.borderWidth === 0 ? "none" : `var(--card-${target}-border-width, ${borderWidth}) solid var(--card-${target}-border, ${borderColor})`,
        borderRadius: radValue,
        padding: padValue,
        boxShadow: shValue,
        backdropFilter: `blur(var(--custom-card-blur))`,
        WebkitBackdropFilter: `blur(var(--custom-card-blur))`,
        fontFamily: "var(--custom-font-family)",
        color: "var(--custom-text-body)",
      };
    }
    return globalCardStyle;
  };

  const buttonStyle: React.CSSProperties = {
    background: "var(--custom-btn-gradient)",
    borderRadius: "var(--custom-btn-radius)",
    boxShadow: "0 8px 20px -4px rgba(147, 51, 234, 0.35)",
  };

  return (
    <div className="space-y-2">
      {/* PREVIEW TOP BAR WITH CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>Whole-Site Interactive Live Preview</span>
          </span>
          {showNotification && (
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full animate-in fade-in">
              ✓ Applied Real-Time
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Mode Switchers */}
          <div className="inline-flex rounded-xl bg-purple-100/70 dark:bg-slate-800 p-0.5 text-[11px] font-extrabold">
            <button
              type="button"
              onClick={() => setViewMode("whole")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === "whole"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
              }`}
            >
              <span>🌐 Whole Site</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("translation")}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "translation"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
              }`}
            >
              Translating
            </button>
            <button
              type="button"
              onClick={() => setViewMode("complete")}
              className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                viewMode === "complete"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
              }`}
            >
              <span>🏆 Complete</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("upload")}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "upload"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-purple-600"
              }`}
            >
              Upload
            </button>
          </div>

          {/* Zoom Selector */}
          <div className="inline-flex items-center rounded-xl bg-purple-100/70 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setZoomLevel(65)}
              className={`px-2 py-1 rounded-lg cursor-pointer ${
                zoomLevel === 65
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-200 shadow-2xs font-black"
                  : "text-slate-500 hover:text-purple-600"
              }`}
              title="65% Scale (See Entire Page Without Scrolling)"
            >
              65%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(85)}
              className={`px-2 py-1 rounded-lg cursor-pointer ${
                zoomLevel === 85
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-200 shadow-2xs font-black"
                  : "text-slate-500 hover:text-purple-600"
              }`}
              title="85% Balanced Scale"
            >
              85%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className={`px-2 py-1 rounded-lg cursor-pointer ${
                zoomLevel === 100
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-200 shadow-2xs font-black"
                  : "text-slate-500 hover:text-purple-600"
              }`}
              title="100% Full 1:1 Scale"
            >
              100%
            </button>
          </div>

          {/* Test Wallpaper Dark/Light Toggle */}
          <button
            type="button"
            onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
            className="p-1.5 rounded-xl bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition cursor-pointer"
            title={`Toggle preview wallpaper background (${previewTheme === "light" ? "Switch to Dark Wallpaper" : "Switch to Light Wallpaper"})`}
          >
            {previewTheme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          </button>

          {/* Expand Height Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-purple-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-purple-600 transition cursor-pointer"
            title={isExpanded ? "Collapse preview height" : "Expand preview height"}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* SIMULATED BROWSER CANVAS WITH REALISTIC BACKGROUND */}
      <div
        className={`relative overflow-y-auto rounded-3xl border-2 border-purple-200 dark:border-purple-800 shadow-xl transition-all ${
          previewTheme === "dark"
            ? "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900"
            : "bg-gradient-to-br from-pink-100/80 via-purple-100/70 to-indigo-100/80"
        } ${isExpanded ? "h-[620px]" : "h-[360px] sm:h-[420px]"}`}
      >
        {/* Ambient artistic floating background glow */}
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-pink-400/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-12 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-1/4 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Scaled Preview Inner Container */}
        <div
          className="mx-auto p-4 sm:p-6 transition-all origin-top"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
            width: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : "100%",
            maxWidth:
              config.cardMaxWidth === "narrow"
                ? "380px"
                : config.cardMaxWidth === "standard"
                ? "460px"
                : config.cardMaxWidth === "wide"
                ? "560px"
                : config.cardMaxWidth === "ultrawide"
                ? "680px"
                : "100%",
          }}
        >
          {/* 1. TOP NAVBAR (Always present) */}
          <div
            className="mb-3.5 flex items-center justify-between rounded-2xl px-3 py-2 transition-all"
            style={globalCardStyle}
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <span
                className="text-xs font-black"
                style={{
                  color: "var(--custom-text-heading)",
                  textShadow: "var(--custom-heading-shadow)",
                }}
              >
                MegaText <span className="text-[9px] font-bold text-purple-600 dark:text-purple-300">ZH → EN</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-300">
              <span className="rounded-full bg-white/70 dark:bg-black/40 px-2 py-0.5 border border-purple-100 dark:border-purple-900">
                100% Order Guaranteed
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VIEW: WHOLE SITE (Everything top-to-bottom) OR TRANSLATING */}
          {/* ============================================================ */}
          {(viewMode === "whole" || viewMode === "translation") && (
            <div className="space-y-3">
              {/* Card 1: Novel Header */}
              <div
                className="flex items-center justify-between p-3.5 transition-all"
                style={getCardStyle("header")}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 text-purple-600 dark:text-purple-300 shadow-2xs">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="text-xs sm:text-sm font-extrabold truncate"
                      style={{
                        color: "var(--custom-text-heading)",
                        textShadow: "var(--custom-heading-shadow)",
                      }}
                    >
                      modern bird parrot bai linlin.txt
                    </h2>
                    <p
                      className="text-[10px] font-medium truncate"
                      style={{ color: "var(--custom-text-accent)" }}
                    >
                      Chapter 3 · 8,420 words ready · ~4m 12s remaining
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/80 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                  Translating...
                </span>
              </div>

              {/* Card 2: Big Circular Donut & 4-Metric Grid Progress Card */}
              <div
                className="p-4 transition-all"
                style={getCardStyle("progress")}
              >
                <div className="flex items-center gap-4">
                  {/* Gauge */}
                  <div className="relative flex shrink-0 items-center justify-center">
                    <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        className="stroke-purple-100 dark:stroke-slate-800"
                        strokeWidth="7"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="url(#previewGrad)"
                        strokeWidth="7"
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={(2 * Math.PI * 38) * (1 - 0.42)}
                        strokeLinecap="round"
                        fill="none"
                      />
                      <defs>
                        <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#9333ea" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span
                        className="text-base font-black leading-none"
                        style={{
                          color: "var(--custom-text-heading)",
                          textShadow: "var(--custom-heading-shadow)",
                        }}
                      >
                        42%
                      </span>
                      <span className="text-[8px] font-extrabold uppercase text-purple-600 dark:text-purple-300">
                        Done
                      </span>
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-xl bg-white/40 dark:bg-black/30 border border-white/40 dark:border-white/5">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Chapters</div>
                      <div className="text-xs font-black" style={{ color: "var(--custom-text-heading)" }}>
                        3 / 7 Ready
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/40 dark:bg-black/30 border border-white/40 dark:border-white/5">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Words Ready</div>
                      <div className="text-xs font-black" style={{ color: "var(--custom-text-heading)" }}>
                        8,420
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/40 dark:bg-black/30 border border-white/40 dark:border-white/5">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Characters</div>
                      <div className="text-xs font-black" style={{ color: "var(--custom-text-heading)" }}>
                        12,500 / 30,000
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/40 dark:bg-black/30 border border-white/40 dark:border-white/5">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Estimated</div>
                      <div className="text-xs font-black" style={{ color: "var(--custom-text-heading)" }}>
                        ~4m 12s
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Current Chapter Stream Card */}
              <div
                className="p-3 transition-all space-y-1.5"
                style={globalCardStyle}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Current Chapter 4 (Translating)</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    Chunk 4 of 7 · 4,200 chars
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                  白林林抬起爪子，好奇地打量着这个全新的现代世界...
                </p>
                <div className="h-1.5 w-full rounded-full bg-purple-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-purple-600 w-2/3" />
                </div>
              </div>

              {/* Card 4: Action Button with Custom Gradient */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  style={buttonStyle}
                  className="w-full py-2.5 px-4 text-xs font-black text-white text-center shadow-lg transition active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pause Cloud Translation</span>
                </button>
              </div>

              {/* Card 5: Recent Activity & Chapter Queue List */}
              <div
                className="p-3.5 transition-all space-y-2"
                style={getCardStyle("queue")}
              >
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1.5" style={{ color: "var(--custom-text-heading)" }}>
                    <Activity className="h-3.5 w-3.5 text-purple-500" />
                    <span>Recent Chapter Activity</span>
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                    View All (7)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-purple-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-black">
                        ✓
                      </span>
                      <span className="font-bold text-[11px]" style={{ color: "var(--custom-text-heading)" }}>
                        Chapter 1 · Ready
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400">completed</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-purple-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-black">
                        ✓
                      </span>
                      <span className="font-bold text-[11px]" style={{ color: "var(--custom-text-heading)" }}>
                        Chapter 2 · Ready
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400">completed</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-500 text-white text-[9px] font-black animate-pulse">
                        •
                      </span>
                      <span className="font-bold text-[11px] text-sky-600 dark:text-sky-300">
                        Chapter 4 (Current)
                      </span>
                    </div>
                    <span className="text-[9px] text-sky-500 font-bold">translating...</span>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* WHOLE-SITE SPECIAL: COMPLETE CARD SHOWN BELOW IN WHOLE VIEW! */}
              {/* This lets user directly compare Complete card color vs others */}
              {/* ============================================================ */}
              {viewMode === "whole" && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Preview of "Complete" Card (With Your Custom Styling)</span>
                  </div>

                  {/* The Complete Summary Card */}
                  <div
                    className="p-4 transition-all space-y-3"
                    style={getCardStyle("complete")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div
                            className="text-xs sm:text-sm font-black"
                            style={{
                              color: "var(--custom-text-heading)",
                              textShadow: "var(--custom-heading-shadow)",
                            }}
                          >
                            Translation 100% Complete!
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300">
                            All 7 continuous chapters translated & verified
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                        Ready
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        style={buttonStyle}
                        className="flex-1 py-2 px-3 text-xs font-black text-white text-center shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download EPUB (Ch 1 - 7)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: COMPLETE SCREEN ONLY */}
          {/* ============================================================ */}
          {viewMode === "complete" && (
            <div className="space-y-3">
              <div
                className="p-5 transition-all space-y-4"
                style={getCardStyle("complete")}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2
                    className="text-base font-black"
                    style={{
                      color: "var(--custom-text-heading)",
                      textShadow: "var(--custom-heading-shadow)",
                    }}
                  >
                    🎉 Translation Completed!
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                    All 7 chapters of modern bird parrot bai linlin.txt have been fully translated with 100% sequential ordering.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5">
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Chapters</div>
                    <div className="text-sm font-black" style={{ color: "var(--custom-text-heading)" }}>
                      7 / 7 (100%)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">English Words</div>
                    <div className="text-sm font-black" style={{ color: "var(--custom-text-heading)" }}>
                      24,310 Words
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  style={buttonStyle}
                  className="w-full py-3 px-4 text-xs font-black text-white text-center shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Novel (.EPUB)</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: UPLOAD SCREEN ONLY */}
          {/* ============================================================ */}
          {viewMode === "upload" && (
            <div className="space-y-3">
              <div
                className="p-5 transition-all space-y-3"
                style={getCardStyle("upload")}
              >
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    <Zap className="h-3 w-3 text-pink-500" />
                    <span>Up to 1,000,000+ Characters</span>
                  </div>
                  <h3
                    className="text-sm font-black"
                    style={{
                      color: "var(--custom-text-heading)",
                      textShadow: "var(--custom-heading-shadow)",
                    }}
                  >
                    Upload or Paste Chinese Text
                  </h3>
                </div>

                {/* Dropzone mock */}
                <div className="rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 p-6 text-center space-y-2 bg-white/40 dark:bg-black/30">
                  <UploadCloud className="h-8 w-8 mx-auto text-purple-500" />
                  <p className="text-xs font-bold" style={{ color: "var(--custom-text-heading)" }}>
                    Drag and drop your .txt novel file here
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports large multi-chapter files
                  </p>
                </div>

                <button
                  type="button"
                  style={buttonStyle}
                  className="w-full py-2.5 px-4 text-xs font-black text-white text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Select File from Computer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
