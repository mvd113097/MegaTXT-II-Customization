import React, { useRef, useState } from "react";
import { Check, Download, Palette, Trash2, Upload, X, Sparkles } from "lucide-react";
import { useThemes } from "../../theme/ThemeProvider";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeManager: React.FC<Props> = ({ isOpen, onClose }) => {
  const { themes, activeTheme, setActiveTheme, importTheme, deleteTheme, exportTheme } = useThemes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleImport = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const theme = await importTheme(file);
      setMessage(`Imported “${theme.name}” and applied it.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not import theme.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleExport = async (theme: typeof activeTheme) => {
    setBusy(true);
    setMessage("");
    try {
      const blob = await exportTheme(theme);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${theme.id}.megatext-theme.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setMessage("Could not export this theme.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-purple-950/40 dark:bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="flex w-full max-w-2xl max-h-[92vh] flex-col rounded-t-3xl sm:rounded-3xl border border-purple-100/90 dark:border-purple-900/60 bg-white/98 dark:bg-slate-900/98 text-slate-850 dark:text-slate-100 shadow-2xl shadow-purple-500/10 overflow-hidden transition-colors">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-purple-100/80 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/40 backdrop-blur px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Themes</h2>
                <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {themes.length} Available
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-purple-300/70">
                Choose a visual theme with one-click live application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {message && (
            <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-2.5 text-xs font-semibold text-purple-800 dark:text-purple-200">
              {message}
            </div>
          )}

          {/* Grid of Theme Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {themes.map((theme) => {
              const selected = activeTheme.id === theme.id;
              const preview = theme.assetUrls.preview || theme.assetUrls.header || theme.assetUrls.background;
              
              return (
                <div
                  key={theme.id}
                  className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${
                    selected
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50/40 dark:bg-purple-950/30 ring-2 ring-purple-400/40 shadow-md shadow-purple-500/10"
                      : "border-purple-100/90 dark:border-purple-900/40 bg-white/80 dark:bg-slate-850/40 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  {/* Thumbnail / Image Preview */}
                  <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {preview ? (
                      <img
                        src={preview}
                        alt={theme.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                      >
                        <Sparkles className="h-8 w-8 text-white/70" />
                      </div>
                    )}
                    
                    {/* Active Ribbon Badge */}
                    {selected && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-purple-600 dark:bg-purple-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {theme.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/80 line-clamp-2 leading-relaxed">
                          {theme.description || "Novel translation aesthetic theme"}
                        </p>
                      </div>
                    </div>

                    {/* Color Swatch Indicators */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-purple-300/60 mr-1">
                        Palette:
                      </span>
                      {[
                        theme.colors.primary,
                        theme.colors.accent,
                        theme.colors.background,
                        theme.colors.text,
                      ].map((c, idx) => (
                        <span
                          key={idx}
                          className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/10 shadow-2xs"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>

                    {/* Apply / Active Action Button */}
                    <div className="mt-3.5 pt-2.5 border-t border-purple-100/70 dark:border-purple-900/40 flex items-center gap-2">
                      <button
                        onClick={() => setActiveTheme(theme.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer active:scale-95 ${
                          selected
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300/60 dark:border-purple-700/60"
                            : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-sm shadow-purple-500/20"
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Currently Applied</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Apply Theme</span>
                          </>
                        )}
                      </button>

                      {/* Export button */}
                      <button
                        onClick={() => handleExport(theme)}
                        title="Export theme ZIP"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-100 dark:border-purple-900/60 bg-white dark:bg-slate-800 text-slate-500 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete button if custom installed */}
                      {!theme.builtIn && (
                        <button
                          onClick={() => deleteTheme(theme.id)}
                          title="Delete custom theme"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Import Custom Theme ZIP Section */}
          <div className="rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-4 space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => handleImport(e.target.files?.[0])}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Import Custom Theme (.ZIP)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                  Upload community or custom theme ZIPs with custom artwork and styling.
                </p>
              </div>
              <button
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs active:scale-95 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload ZIP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-purple-100/70 dark:border-purple-900/40 px-6 py-3 bg-purple-50/40 dark:bg-purple-950/40">
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-5 py-2 text-xs font-bold active:scale-95 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

