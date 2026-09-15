import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Settings,
  Image as ImageIcon,
  Palette,
  Send,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Layers,
  HelpCircle,
  Paintbrush,
} from "lucide-react";
import { AppearanceCustomizer } from "./AppearanceCustomizer";
import { syncSiteAppearanceToServer } from "../theme/visualAppearance";

interface TelegramSettings {
  botToken: string;
  chatIds: string;
  enabled: boolean;
  statusIntervalMin: number;
  statusEnabled: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGlossary: () => void;
  concurrency: number;
  onChangeConcurrency: (n: number) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenGlossary,
  concurrency,
  onChangeConcurrency,
  theme,
  onToggleTheme,
}) => {
  // Navigation view inside Settings: 'hub' | 'background' | 'appearance' | 'telegram' | 'translation'
  const [activeView, setActiveView] = useState<"hub" | "background" | "appearance" | "telegram" | "translation">("hub");

  // Custom Background photo state
  const [customBgUrl, setCustomBgUrl] = useState<string>(() => {
    try {
      return localStorage.getItem("megatext_custom_bg") || "";
    } catch {
      return "";
    }
  });
  const [bgBlur, setBgBlur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("megatext_bg_blur");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("megatext_bg_opacity");
      return saved ? parseInt(saved, 10) : 60;
    } catch {
      return 60;
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgInputUrl, setBgInputUrl] = useState("");

  // Telegram settings state
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>({
    botToken: "",
    chatIds: "",
    enabled: false,
    statusIntervalMin: 5,
    statusEnabled: true,
  });
  const [isTgLoading, setIsTgLoading] = useState(false);
  const [isTgSaving, setIsTgSaving] = useState(false);
  const [showTgToken, setShowTgToken] = useState(false);
  const [tgTestStatus, setTgTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [tgTestError, setTgTestError] = useState<string | null>(null);
  const [tgSaveStatus, setTgSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // Reset view to hub and refresh background state when opened
  useEffect(() => {
    if (isOpen) {
      setActiveView("hub");
      try {
        setCustomBgUrl(localStorage.getItem("megatext_custom_bg") || "");
        const b = localStorage.getItem("megatext_bg_blur");
        setBgBlur(b ? parseInt(b, 10) : 0);
        const o = localStorage.getItem("megatext_bg_opacity");
        setBgOpacity(o ? parseInt(o, 10) : 60);
      } catch (e) {
        console.warn(e);
      }
      // Load telegram config in background
      setIsTgLoading(true);
      fetch("/api/telegram-settings")
        .then((res) => res.json())
        .then((data) => {
          setTelegramSettings(data);
          setIsTgLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load Telegram settings:", err);
          setIsTgLoading(false);
        });
    }
  }, [isOpen]);

  // Sync background photo changes
  const applyCustomBg = (url: string) => {
    setCustomBgUrl(url);
    try {
      if (url) {
        localStorage.setItem("megatext_custom_bg", url);
        window.dispatchEvent(new Event("megatext_bg_changed"));
      } else {
        localStorage.removeItem("megatext_custom_bg");
        window.dispatchEvent(new Event("megatext_bg_changed"));
      }
      syncSiteAppearanceToServer({ customBg: url });
    } catch (e) {
      console.warn("Storage warning for custom bg:", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large! Please choose an image under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      applyCustomBg(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgInputUrl.trim()) return;
    applyCustomBg(bgInputUrl.trim());
    setBgInputUrl("");
  };

  const handleBlurChange = (val: number) => {
    setBgBlur(val);
    localStorage.setItem("megatext_bg_blur", String(val));
    window.dispatchEvent(new Event("megatext_bg_changed"));
    syncSiteAppearanceToServer({ bgBlur: val });
  };

  const handleOpacityChange = (val: number) => {
    setBgOpacity(val);
    localStorage.setItem("megatext_bg_opacity", String(val));
    window.dispatchEvent(new Event("megatext_bg_changed"));
    syncSiteAppearanceToServer({ bgOpacity: val });
  };

  // Telegram actions
  const handleSaveTelegram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTgSaving(true);
    setTgSaveStatus("idle");
    try {
      const res = await fetch("/api/telegram-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramSettings),
      });
      const data = await res.json();
      if (data.success) {
        setTgSaveStatus("success");
        setTelegramSettings(data.settings);
        setTimeout(() => setTgSaveStatus("idle"), 3000);
      } else {
        setTgSaveStatus("error");
      }
    } catch (err) {
      console.error("Failed to save Telegram settings:", err);
      setTgSaveStatus("error");
    } finally {
      setIsTgSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTgTestStatus("sending");
    setTgTestError(null);
    const token = telegramSettings.botToken.trim();
    const chatIdsStr = telegramSettings.chatIds.trim();

    if (!token || !chatIdsStr) {
      setTgTestStatus("error");
      setTgTestError("Please enter both Bot Token and Chat ID(s) before testing.");
      return;
    }
    const chatIds = chatIdsStr
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (chatIds.length === 0) {
      setTgTestStatus("error");
      setTgTestError("Please enter at least one valid numeric Chat ID.");
      return;
    }

    try {
      const testMsg = encodeURIComponent(
        `🔔 <b>[MegaText Telegram Connection Test]</b>\n\n` +
        `Your bot is correctly connected to MegaText! 🎉\n` +
        `Periodic updates: <b>every ${telegramSettings.statusIntervalMin} minutes</b>.`
      );
      const promises = chatIds.map(async (chatId) => {
        const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${testMsg}&parse_mode=HTML`;
        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.description || `HTTP Error ${res.status}`);
        }
      });
      await Promise.all(promises);
      setTgTestStatus("success");
      setTimeout(() => setTgTestStatus("idle"), 5000);
    } catch (err: any) {
      console.error("Telegram test failed:", err);
      setTgTestStatus("error");
      setTgTestError(err.message || String(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-purple-950/40 dark:bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-purple-100/90 dark:border-purple-900/60 bg-white/98 dark:bg-slate-900/98 shadow-2xl shadow-purple-500/10 transition-colors duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100/70 dark:border-purple-900/40 px-5 sm:px-6 py-4 bg-purple-50/40 dark:bg-purple-950/40">
          <div className="flex items-center gap-3">
            {activeView !== "hub" ? (
              <button
                type="button"
                onClick={() => setActiveView("hub")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 cursor-pointer transition"
                title="Back to Settings Menu"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                <Settings className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                {activeView === "hub" && "Settings"}
                {activeView === "background" && "Custom Background Photo"}
                {activeView === "appearance" && "Card & Visual Customizer"}
                {activeView === "telegram" && "Telegram Notifications"}
                {activeView === "translation" && "Translation Engine & Speed"}
              </h3>
              <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-300/80 font-medium">
                {activeView === "hub" && "Manage appearance, backgrounds, alerts, and preferences"}
                {activeView === "background" && "Personalize your website backdrop with any photo"}
                {activeView === "appearance" && "Customize card transparency, blur, button colors, and glass styling"}
                {activeView === "telegram" && "Send real-time progress and completion alerts to your phone"}
                {activeView === "translation" && "Configure parallel workers and glossary terms"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-purple-100/60 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* ========================================================= */}
          {/* VIEW 1: CLEAN MAIN SETTINGS HUB (ALL WITH DEDICATED BUTTONS) */}
          {/* ========================================================= */}
          {activeView === "hub" && (
            <div className="space-y-3">
              {/* Button 1: Card & Visual Customizer (Transparency, Colors, Buttons) */}
              <button
                type="button"
                onClick={() => setActiveView("appearance")}
                className="w-full flex items-center justify-between rounded-2xl border border-pink-200/80 dark:border-pink-900/50 bg-gradient-to-r from-pink-50/70 via-purple-50/70 to-rose-50/70 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-rose-950/20 p-4 text-left transition hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-md cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition">
                    <Paintbrush className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                        Card & Visual Customizer
                      </h4>
                      <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        Glass & Colors
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/70">
                      Control card transparency (0–100%), blur, glass tint, button colors & contrast
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800 text-purple-600 dark:text-purple-300 group-hover:translate-x-0.5 transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              {/* Button 2: Custom Background Photo */}
              <button
                type="button"
                onClick={() => setActiveView("background")}
                className="w-full flex items-center justify-between rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/70 to-pink-50/70 dark:from-purple-950/30 dark:to-pink-950/20 p-4 text-left transition hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                        Background Photo Settings
                      </h4>
                      {customBgUrl && (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/70">
                      Upload or paste any photo URL for your website background
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800 text-purple-600 dark:text-purple-300 group-hover:translate-x-0.5 transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              {/* Button 3: Telegram Settings (DEDICATED BUTTON) */}
              <button
                type="button"
                onClick={() => setActiveView("telegram")}
                className="w-full flex items-center justify-between rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-r from-sky-50/70 to-blue-50/70 dark:from-sky-950/30 dark:to-blue-950/20 p-4 text-left transition hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-md cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition">
                        Telegram Settings
                      </h4>
                      {telegramSettings.enabled && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/70">
                      Configure bot tokens, chat IDs, and automatic progress reports
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800 text-sky-600 dark:text-sky-300 group-hover:translate-x-0.5 transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              {/* Button 4: Translation Engine & Workers */}
              <button
                type="button"
                onClick={() => setActiveView("translation")}
                className="w-full flex items-center justify-between rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-slate-50/60 dark:bg-purple-950/20 p-4 text-left transition hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                      Translation Engine Settings
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-purple-300/70">
                      Concurrency speed ({concurrency} parallel requests) and options
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800 text-purple-600 dark:text-purple-300 group-hover:translate-x-0.5 transition">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              {/* Quick toggle: Dark / Light Mode */}
              <div className="flex items-center justify-between rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-800/40 p-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Dark / Night Mode
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-purple-300/60">
                    Switch between light and high-contrast night viewing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/60 px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer transition active:scale-95"
                >
                  {theme === "dark" ? "🌙 Dark Active" : "☀️ Light Active"}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: CUSTOM BACKGROUND PHOTO SETTINGS */}
          {/* ========================================================= */}
          {activeView === "background" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Current Background Preview Card */}
              <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-800 bg-slate-100 dark:bg-slate-800">
                {customBgUrl ? (
                  <>
                    <img
                      src={customBgUrl}
                      alt="Custom website background"
                      className="h-full w-full object-cover"
                      style={{
                        filter: `blur(${bgBlur}px)`,
                        opacity: bgOpacity / 100,
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="self-start rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        Active Custom Background
                      </span>
                      <button
                        type="button"
                        onClick={() => applyCustomBg("")}
                        className="self-end inline-flex items-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove & Reset</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-950/40 text-slate-500 dark:text-purple-300">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-60 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      No custom photo applied yet
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-purple-300/70 mt-0.5">
                      Upload a photo from your computer/phone or enter an image URL below
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Photo Button */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  1. Upload Photo from your Device:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white py-3 px-4 text-xs font-bold shadow-md shadow-purple-500/20 active:scale-98 transition cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose Photo File (JPG, PNG, WebP)</span>
                </button>
              </div>

              {/* Or Paste Image URL */}
              <form onSubmit={handleApplyUrl} className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Or Paste Image Web URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bgInputUrl}
                    onChange={(e) => setBgInputUrl(e.target.value)}
                    placeholder="https://example.com/wallpaper.jpg"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!bgInputUrl.trim()}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer active:scale-95 transition"
                  >
                    Apply URL
                  </button>
                </div>
              </form>

              {/* Adjustments (Blur & Opacity) */}
              {customBgUrl && (
                <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Backdrop Adjustments
                  </h4>

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-purple-300">
                      <span>Photo Visibility (Opacity)</span>
                      <span>{bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={100}
                      value={bgOpacity}
                      onChange={(e) => handleOpacityChange(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-purple-300">
                      <span>Soft Blur Filter</span>
                      <span>{bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={bgBlur}
                      onChange={(e) => handleBlurChange(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: CARD & VISUAL CUSTOMIZER (TRANSPARENCY, BLUR, COLORS) */}
          {/* ========================================================= */}
          {activeView === "appearance" && <AppearanceCustomizer />}

          {/* ========================================================= */}
          {/* VIEW 3: TELEGRAM SETTINGS (ONLY SHOWN WHEN BUTTON IS PRESSED) */}
          {/* ========================================================= */}
          {activeView === "telegram" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              {isTgLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Loading Telegram settings...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveTelegram} className="space-y-4">
                  {/* Enable Switch */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-purple-900/50 bg-slate-50/50 dark:bg-purple-950/30 p-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        Enable Telegram Notifications
                      </label>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                        Send translation completion and progress updates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTelegramSettings({
                          ...telegramSettings,
                          enabled: !telegramSettings.enabled,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        telegramSettings.enabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          telegramSettings.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {telegramSettings.enabled && (
                    <div className="space-y-3.5 pt-1">
                      {/* Bot Token */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Bot Token (from @BotFather)
                        </label>
                        <div className="relative">
                          <input
                            type={showTgToken ? "text" : "password"}
                            value={telegramSettings.botToken}
                            onChange={(e) =>
                              setTelegramSettings({
                                ...telegramSettings,
                                botToken: e.target.value,
                              })
                            }
                            placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3 pr-10 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                            required={telegramSettings.enabled}
                          />
                          <button
                            type="button"
                            onClick={() => setShowTgToken(!showTgToken)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showTgToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Chat IDs */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Telegram Chat ID(s)
                          </label>
                          <span className="text-[10px] text-slate-400">Comma-separated</span>
                        </div>
                        <input
                          type="text"
                          value={telegramSettings.chatIds}
                          onChange={(e) =>
                            setTelegramSettings({
                              ...telegramSettings,
                              chatIds: e.target.value,
                            })
                          }
                          placeholder="e.g. 987654321, -10012345678"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-purple-500 focus:outline-none"
                          required={telegramSettings.enabled}
                        />
                      </div>

                      {/* Periodic Updates Interval */}
                      <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Periodic Progress Reports
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTelegramSettings({
                                ...telegramSettings,
                                statusEnabled: !telegramSettings.statusEnabled,
                              })
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              telegramSettings.statusEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                telegramSettings.statusEnabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {telegramSettings.statusEnabled && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                            <label className="text-[11px] text-slate-600 dark:text-slate-300">
                              Report Frequency
                            </label>
                            <select
                              value={telegramSettings.statusIntervalMin}
                              onChange={(e) =>
                                setTelegramSettings({
                                  ...telegramSettings,
                                  statusIntervalMin: Number(e.target.value),
                                })
                              }
                              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:border-purple-500"
                            >
                              <option value={1}>Every 1 min (Test)</option>
                              <option value={5}>Every 5 min (Recommended)</option>
                              <option value={10}>Every 10 min</option>
                              <option value={15}>Every 15 min</option>
                              <option value={30}>Every 30 min</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Test Connection Button */}
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={tgTestStatus === "sending"}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 py-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer active:scale-98 transition disabled:opacity-50"
                      >
                        {tgTestStatus === "sending" ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Sending Ping...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Send Test Message to Telegram</span>
                          </>
                        )}
                      </button>

                      {tgTestStatus === "success" && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>Test message sent successfully!</span>
                        </div>
                      )}
                      {tgTestStatus === "error" && (
                        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5 text-[11px] text-rose-800 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>{tgTestError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-2 flex items-center justify-between">
                    {tgSaveStatus === "success" && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isTgSaving}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
                    >
                      {isTgSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      <span>Save Telegram Settings</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: TRANSLATION ENGINE & CONCURRENCY */}
          {/* ========================================================= */}
          {activeView === "translation" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Parallel Worker Concurrency
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                      How many chunks to translate concurrently
                    </p>
                  </div>
                  <span className="rounded-xl bg-purple-600 text-white font-extrabold px-3 py-1 text-xs">
                    {concurrency} Workers
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onChangeConcurrency(n)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer active:scale-95 ${
                        concurrency === n
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                          : "bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100"
                      }`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Glossary Shortcut */}
              <div className="flex items-center justify-between rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-white dark:bg-slate-800/40 p-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    Glossary & Terminology Dictionary
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                    Maintain character names, ranks, and cultivation realms
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGlossary();
                  }}
                  className="rounded-xl bg-purple-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-purple-700 cursor-pointer transition active:scale-95"
                >
                  Manage Terms
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-purple-100/70 dark:border-purple-900/40 px-5 sm:px-6 py-3 bg-purple-50/40 dark:bg-purple-950/40">
          {activeView !== "hub" ? (
            <button
              type="button"
              onClick={() => setActiveView("hub")}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Settings Menu</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-purple-300/50">
              MegaText Novel Translator
            </span>
          )}
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-5 py-2 text-xs font-bold active:scale-95 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
