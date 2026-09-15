import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Zap,
  BookCheck,
} from "lucide-react";
import { countChineseCharacters } from "../utils/chunker";
import { SAMPLE_CHINESE_NOVEL } from "../data/sampleNovel";

interface UploadSectionProps {
  onLoadText: (text: string, fileName: string, targetChunkChars: number, splitByChapters: boolean) => void;
  serverJob?: any | null;
  onLoadServerJob?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onLoadText,
  serverJob,
  onLoadServerJob,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileStats, setFileStats] = useState<{
    sizeKb: number;
    charCount: number;
    chineseChars: number;
    estimatedChunks: number;
  } | null>(null);

  // Settings (Default to 7,000 for maximum free volume, or read from preferred stored settings)
  const [targetChunkChars, setTargetChunkChars] = useState<number>(() => {
    const saved = localStorage.getItem("preferred_target_chunk_chars");
    return saved ? Number(saved) : 7000;
  });
  const [splitByChapters, setSplitByChapters] = useState(true);
  const [isReading, setIsReading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically recalculate estimated chunks when targetChunkChars changes
  useEffect(() => {
    const activeText = activeTab === "file" ? fileContent : pastedText;
    if (activeText.trim()) {
      setFileStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          estimatedChunks: Math.max(1, Math.ceil(activeText.length / targetChunkChars)),
        };
      });
    }
  }, [targetChunkChars, fileContent, pastedText, activeTab]);

  // Handle uploaded file
  const handleFileProcess = (file: File) => {
    if (!file) return;
    setIsReading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      setFileContent(content);
      const chineseChars = countChineseCharacters(content);
      const totalChars = content.length;
      const estimatedChunks = Math.max(1, Math.ceil(totalChars / targetChunkChars));

      setFileStats({
        sizeKb: Math.round(file.size / 1024),
        charCount: totalChars,
        chineseChars,
        estimatedChunks,
      });
      setIsReading(false);
    };

    reader.onerror = () => {
      alert("Error reading text file. Please ensure it is a valid UTF-8 text file.");
      setIsReading(false);
    };

    reader.readAsText(file, "UTF-8");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setFileName("sample_doupo_cangqiong.txt");
    setFileContent(SAMPLE_CHINESE_NOVEL);
    const chineseChars = countChineseCharacters(SAMPLE_CHINESE_NOVEL);
    setFileStats({
      sizeKb: Math.round(new Blob([SAMPLE_CHINESE_NOVEL]).size / 1024),
      charCount: SAMPLE_CHINESE_NOVEL.length,
      chineseChars,
      estimatedChunks: 3,
    });
  };

  const handleConfirm = () => {
    const textToLoad = activeTab === "file" ? fileContent : pastedText;
    const name = activeTab === "file" ? fileName || "chinese_document.txt" : "pasted_text.txt";
    if (!textToLoad.trim()) return;

    onLoadText(textToLoad, name, targetChunkChars, splitByChapters);
  };

  return (
    <div className="upload-screen-shell mx-auto max-w-md py-2">
      {/* Existing Server Job Available Banner */}
      {serverJob && (
        <div
          id="server-job-recovery-banner"
          className="mb-6 rounded-2xl border border-emerald-400 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/70 dark:via-slate-900 dark:to-emerald-950/70 p-5 shadow-lg shadow-emerald-500/10 transition animate-in fade-in"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {serverJob.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {serverJob.fileName}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {serverJob.status === "completed"
                    ? `🎉 Translation Completed! All ${serverJob.chunks?.length || 102} chapters are 100% finished and stored on the server.`
                    : `Cloud translation is active (${serverJob.completedChunks || 0} chapters translated).`}
                </p>
              </div>
            </div>

            {onLoadServerJob && (
              <button
                type="button"
                id="resume-server-job-btn"
                onClick={onLoadServerJob}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition cursor-pointer shrink-0"
              >
                <BookCheck className="h-4 w-4" />
                <span>{serverJob.status === "completed" ? "Open & Download Completed Novel" : "Open Cloud Job"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Intro hero banner */}
      <div className="upload-hero mb-2 px-4 pt-1 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 dark:border-purple-700/60 bg-white/70 dark:bg-purple-950/80 backdrop-blur-md px-3.5 py-1 text-[11px] sm:text-xs font-bold text-purple-950 dark:text-purple-100 shadow-xs">
          <Zap className="h-3.5 w-3.5 text-pink-500 dark:text-pink-400 shrink-0" />
          <span>Translating Massive Chinese Files (Up to 1,000,000+ Characters)</span>
        </div>
        <h2 className="mt-3.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white flex flex-col items-center justify-center leading-tight drop-shadow-2xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-pink-500">🌸</span>
            <span>Upload or Paste Your</span>
            <span className="text-pink-500">🌸</span>
          </span>
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-xs">
            Chinese Text File
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-sm sm:max-w-md text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-medium bg-white/30 dark:bg-black/30 backdrop-blur-xs rounded-xl px-3 py-1">
          Built specifically for large Chinese webnovels, long documents, and multi-chapter manuscripts.
          Smart chapter parsing and glossary consistency keep character names and realms unified across all million characters.
        </p>
      </div>

      {/* Main card */}
      <div className="upload-main-card upload-screen-shell card-target-upload overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/25 backdrop-blur-sm p-2 gap-2">
          <button
            id="tab-upload-file"
            onClick={() => setActiveTab("file")}
            style={{
              background: activeTab === "file" ? "var(--custom-btn-gradient)" : undefined,
              borderRadius: "var(--custom-btn-radius)",
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
              activeTab === "file"
                ? "text-white shadow-md shadow-pink-500/25"
                : "text-slate-800 dark:text-slate-100 bg-white/40 dark:bg-slate-900/50 hover:bg-white/70 dark:hover:bg-slate-800/80 backdrop-blur-xs"
            }`}
          >
            <UploadCloud className="h-4 w-4 shrink-0" />
            <span>Upload TXT File</span>
          </button>
          <button
            id="tab-paste-text"
            onClick={() => setActiveTab("paste")}
            style={{
              background: activeTab === "paste" ? "var(--custom-btn-gradient)" : undefined,
              borderRadius: "var(--custom-btn-radius)",
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
              activeTab === "paste"
                ? "text-white shadow-md shadow-pink-500/25"
                : "text-slate-800 dark:text-slate-100 bg-white/40 dark:bg-slate-900/50 hover:bg-white/70 dark:hover:bg-slate-800/80 backdrop-blur-xs"
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Direct Text Input</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "file" ? (
            <div>
              {/* Drag and drop area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition duration-200 backdrop-blur-md ${
                  dragActive
                    ? "border-purple-500 dark:border-purple-400 bg-purple-100/70 dark:bg-purple-950/70 shadow-lg shadow-purple-500/20"
                    : fileContent
                    ? "border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 hover:border-emerald-500 dark:hover:border-emerald-400"
                    : "border-purple-300/80 dark:border-purple-600/70 hover:border-purple-500 dark:hover:border-purple-400 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-purple-950/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                {fileContent ? (
                  <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 shadow-md">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="mt-3 text-sm font-extrabold text-slate-950 dark:text-white">
                      {fileName}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-pink-300 font-bold">
                      Click or drag to replace file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 dark:bg-purple-900/70 text-purple-700 dark:text-pink-300 shadow-md shadow-purple-500/15 transition group-hover:scale-105">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <p className="mt-3.5 text-sm sm:text-base font-black text-slate-950 dark:text-white drop-shadow-2xs">
                      Click to upload or drag & drop your .txt file here
                    </p>
                    <p className="mt-1 text-xs text-slate-800 dark:text-purple-100 font-semibold max-w-sm">
                      Supports files from a few thousand up to 1,000,000+ Chinese characters (10MB+)
                    </p>
                  </div>
                )}
              </div>

              {/* Sample loader button */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-700 dark:text-slate-200 font-bold mb-2">
                  Don't have a file ready right now?
                </p>
                <button
                  id="load-sample-novel-btn"
                  onClick={handleLoadSample}
                  style={{
                    background: "var(--custom-btn-gradient)",
                    borderRadius: "var(--custom-btn-radius)",
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-black text-white transition hover:opacity-95 active:scale-98 shadow-lg shadow-pink-500/25 cursor-pointer text-center leading-snug"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-pink-100" />
                  <span>Load Sample Chinese Fantasy Novel (3 Chapters)</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                Paste Chinese Text:
              </label>
              <textarea
                id="pasted-text-input"
                rows={8}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  const chars = countChineseCharacters(e.target.value);
                  setFileStats({
                    sizeKb: Math.round(new Blob([e.target.value]).size / 1024),
                    charCount: e.target.value.length,
                    chineseChars: chars,
                    estimatedChunks: Math.max(1, Math.ceil(e.target.value.length / targetChunkChars)),
                  });
                }}
                placeholder="Paste Chinese text or web novel chapters here..."
                className="mt-1 w-full rounded-2xl border border-purple-200/90 dark:border-purple-700/80 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md p-3.5 font-mono text-xs sm:text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-purple-300/60 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/40"
              />
            </div>
          )}

          {/* File Statistics Analysis (if loaded) */}
          {fileStats && (
            <div className="mt-5 rounded-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md p-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-200">
                File Analysis & Metrics
              </h4>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-3 shadow-2xs">
                  <div className="text-[11px] text-slate-700 dark:text-purple-200/80 font-semibold">Chinese Characters</div>
                  <div className="mt-0.5 text-base sm:text-lg font-black text-purple-700 dark:text-purple-300">
                    {fileStats.chineseChars.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-3 shadow-2xs">
                  <div className="text-[11px] text-slate-700 dark:text-purple-200/80 font-semibold">Total Characters</div>
                  <div className="mt-0.5 text-base sm:text-lg font-black text-slate-950 dark:text-slate-50">
                    {fileStats.charCount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-3 shadow-2xs">
                  <div className="text-[11px] text-slate-700 dark:text-purple-200/80 font-semibold">File Size</div>
                  <div className="mt-0.5 text-base sm:text-lg font-black text-slate-950 dark:text-slate-50">
                    {fileStats.sizeKb > 1024
                       ? `${(fileStats.sizeKb / 1024).toFixed(2)} MB`
                      : `${fileStats.sizeKb} KB`}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm p-3 shadow-2xs">
                  <div className="text-[11px] text-slate-700 dark:text-purple-200/80 font-semibold">Estimated Chunks</div>
                  <div className="mt-0.5 text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                    ~{fileStats.estimatedChunks}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chunker Configuration */}
          <div className="mt-6 border-t border-white/40 dark:border-white/10 pt-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-200">
              <Sliders className="h-4 w-4 text-purple-600 dark:text-pink-400" />
              <span>SMART CHUNKING ENGINE CONFIGURATION</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                Target Chunk Size (Characters per API Batch)
              </label>
              <select
                id="chunk-size-select"
                value={targetChunkChars}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setTargetChunkChars(value);
                  localStorage.setItem("preferred_target_chunk_chars", String(value));
                }}
                className="mt-1.5 w-full rounded-2xl border border-purple-300/90 dark:border-purple-700/80 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md px-3.5 py-3 text-xs font-bold text-slate-950 dark:text-white shadow-2xs focus:border-purple-500 focus:outline-none"
              >
                <option value={2500}>
                  2,500 Chars (~1,200 words) — Standard Chapter
                </option>
                <option value={7000}>
                  7,000 Chars (~3,500 words) — 5 Books/Day Free Tier (Recommended)
                </option>
                <option value={9000}>
                  9,000 Chars (~4,500 words) — Max Capacity (~110 requests/book)
                </option>
                <option value={1800}>
                  1,800 Chars (~800 words) — Shorter Sections
                </option>
              </select>
              <p className="mt-1.5 text-[11px] text-slate-800 dark:text-purple-100 font-medium">
                Chunks are split strictly on clean chapter/paragraph boundaries to preserve literary context.
              </p>
            </div>

            {/* Auto-detect chapter headings toggle card */}
            <div className="flex items-start gap-3 rounded-2xl border border-sky-300/80 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/40 backdrop-blur-md p-3.5">
              <input
                id="split-chapters-toggle"
                type="checkbox"
                checked={splitByChapters}
                onChange={(e) => setSplitByChapters(e.target.checked)}
                className="mt-0.5 h-4.5 w-4.5 rounded-lg border-sky-400 text-sky-600 focus:ring-sky-400 cursor-pointer accent-sky-600"
              />
              <div>
                <label
                  htmlFor="split-chapters-toggle"
                  className="text-xs font-bold text-slate-950 dark:text-slate-100 cursor-pointer"
                >
                  Auto-Detect Chapter Headings (第X章 / Chapter X)
                </label>
                <p className="mt-0.5 text-[11px] text-slate-800 dark:text-purple-100 font-medium leading-snug">
                  Automatically creates individual chapter cards with chapter titles for easy reading and navigation.
                </p>
              </div>
            </div>

            {/* 5-Books/Day Free Tier High-Volume Guarantee Badge */}
            <div className="rounded-2xl border border-cyan-300/80 dark:border-cyan-800/70 bg-gradient-to-br from-cyan-50/80 to-sky-50/60 dark:from-cyan-950/50 dark:to-sky-950/40 backdrop-blur-md p-3.5 text-xs text-cyan-950 dark:text-cyan-100 shadow-2xs">
              <div className="flex items-center gap-2 font-black text-cyan-950 dark:text-cyan-200">
                <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Configured for Up to 5+ Full Books/Day (Strictly Free)</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-cyan-950 dark:text-cyan-100 font-medium">
                At <strong>7,000 characters per chunk</strong>, a 1-million-character book requires only <strong>~140 requests</strong>. 5 full books consume just ~700 requests, well within Google's free 1,500 daily requests allowance! (Gemini 2.5 Flash / Flash-Lite).
              </p>
            </div>
          </div>

          {/* Confirm button */}
          <div className="mt-7">
            <button
              id="confirm-prepare-btn"
              onClick={handleConfirm}
              disabled={isReading || (activeTab === "file" ? !fileContent : !pastedText.trim())}
              style={{
                background: "var(--custom-btn-gradient)",
                borderRadius: "var(--custom-btn-radius)",
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-black text-white shadow-lg shadow-pink-500/30 transition hover:opacity-95 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-center leading-snug"
            >
              <FileCode className="h-4.5 w-4.5 shrink-0" />
              <span>Process & Prepare Text Chunks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
