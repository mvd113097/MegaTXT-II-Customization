import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  List,
  Type,
  Minimize2,
  Maximize2,
  Download,
  Loader2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Languages,
  Check,
  Clock,
  Headphones,
  Sliders,
  ExternalLink,
  Square,
  Settings,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import {
  getCachedChapter,
  setCachedChapter,
  getReaderPreferences,
  saveReaderPreferences,
  ReaderPreferences,
  getLocalLibraryBooks,
  addOrUpdateBookInLibrary,
  removeBookFromLibrary,
} from "../utils/indexedDbStorage";
import { TextChunk } from "../types";

export interface NovelReaderModalProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onToggleMinimize: () => void;
  novelTitle: string;
  author?: string;
  coverUrl?: string;
  novelUrl?: string;
  siteId?: string;
  initialChapterIndex?: number;
  totalChapters?: number;
  allChapters?: Array<{ title: string; url: string; index?: number }>;
  initialContent?: string;
  initialEnglishContent?: string;
  getAuthHeaders: () => Record<string, string>;
  sessionChunks?: TextChunk[];
  onImportNovel?: () => void;
  onUpdateChapterIndex?: (
    chapterIndex: number,
    chapterTitle: string,
    allChapters?: Array<{ title: string; url: string; index?: number }>
  ) => void;
}

export const NovelReaderModal: React.FC<NovelReaderModalProps> = ({
  isOpen,
  isMinimized,
  onClose,
  onToggleMinimize,
  novelTitle,
  author,
  coverUrl,
  novelUrl,
  siteId = "default",
  initialChapterIndex = 1,
  totalChapters = 1,
  allChapters = [],
  initialContent = "",
  initialEnglishContent = "",
  getAuthHeaders,
  sessionChunks,
  onImportNovel,
  onUpdateChapterIndex,
}) => {
  // Current Chapter State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(initialChapterIndex);
  const [chapterTitle, setChapterTitle] = useState<string>(`Chapter ${initialChapterIndex}`);
  const [chineseContent, setChineseContent] = useState<string>(initialContent);
  const [englishContent, setEnglishContent] = useState<string>(initialEnglishContent);
  const [chapterList, setChapterList] = useState<Array<{ title: string; url: string; index?: number }>>(allChapters);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [isDataSavedFromCache, setIsDataSavedFromCache] = useState(false);

  // Single Chapter Instant Translation State
  const [isTranslatingSingleChapter, setIsTranslatingSingleChapter] = useState(false);
  const [singleChapterTranslateError, setSingleChapterTranslateError] = useState<string | null>(null);

  // Settings & Preferences (stored in IndexedDB)
  const [prefs, setPrefs] = useState<ReaderPreferences>({
    theme: "sepia",
    fontSize: 18,
    lineHeight: "normal",
    fontFamily: "serif",
    bilingualMode: "english",
    ttsRate: 1.0,
    ttsPitch: 1.0,
    autoAdvanceTts: true,
  });

  // UI Panels
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [showTtsPlayer, setShowTtsPlayer] = useState(true);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [readingWidth, setReadingWidth] = useState<"standard" | "wide" | "full">("standard");
  const [settingsTab, setSettingsTab] = useState<"text" | "voice" | "translation" | "general">("text");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [showTtsSpeedPopup, setShowTtsSpeedPopup] = useState(false);
  const [showSleepTimerPopup, setShowSleepTimerPopup] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | "end-of-chapter" | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);

  // Library / Bookmark State
  const [isInLibrary, setIsInLibrary] = useState<boolean>(() => {
    const books = getLocalLibraryBooks();
    return books.some((b) => b.id === novelId || (b.title === novelTitle && (b.author === author || !author)));
  });

  const handleToggleLibrary = () => {
    if (isInLibrary) {
      removeBookFromLibrary(novelId);
      setIsInLibrary(false);
    } else {
      addOrUpdateBookInLibrary({
        id: novelId,
        title: novelTitle,
        author,
        coverUrl,
        novelUrl,
        siteId,
        currentChapterIndex,
        totalChapters: chapterList.length > 0 ? chapterList.length : totalChapters,
        lastReadChapterTitle: chapterTitle,
        allChapters: chapterList,
      });
      setIsInLibrary(true);
    }
  };

  // QuickNovel TTS State (Paragraph-level highlighting & zero-delay playback)
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isTtsPaused, setIsTtsPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsFeedbackMessage, setTtsFeedbackMessage] = useState<string | null>(null);

  // Refs for zero-delay instant execution & state synchronization
  const activeParagraphIndexRef = useRef<number>(-1);
  const ttsParagraphsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const readerBodyRef = useRef<HTMLDivElement | null>(null);
  const sleepTimerIdRef = useRef<any>(null);
  const pendingTtsStartRef = useRef(false);

  // Draggable Floating Button Position State
  // Default: bottom: 92px (comfortably above bottom navigation bar's 64px), right: 16px
  const [bubblePos, setBubblePos] = useState<{ bottom: number; right?: number; left?: number; side: "right" | "left" }>(() => {
    try {
      const saved = localStorage.getItem("megatext_reader_bubble_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.bottom === "number") {
          return {
            bottom: Math.max(84, parsed.bottom),
            side: parsed.side || "right",
            ...(parsed.side === "left" ? { left: 16 } : { right: 16 }),
          };
        }
      }
    } catch {}
    return { bottom: 92, right: 16, side: "right" };
  });

  const isDraggingBubbleRef = useRef(false);
  const bubbleDragStartRef = useRef<{ clientX: number; clientY: number; startBottom: number }>({ clientX: 0, clientY: 0, startBottom: 92 });
  const bubbleHasMovedRef = useRef(false);

  // Load preferences from IndexedDB on mount
  useEffect(() => {
    getReaderPreferences().then((saved) => {
      setPrefs(saved);
    });
  }, []);

  // Update preferences helper
  const updatePrefs = (newPrefs: Partial<ReaderPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...newPrefs };
      saveReaderPreferences(next);
      return next;
    });
  };

  // Sync initial content or index changes
  useEffect(() => {
    if (initialChapterIndex) {
      setCurrentChapterIndex(initialChapterIndex);
    }
    if (allChapters && allChapters.length > 0) {
      setChapterList(allChapters);
    }
  }, [initialChapterIndex, allChapters]);

  // Voice Initialization: Prioritize Standard Google US Female Voice (English Only)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const findGoogleUsFemaleVoice = (voices: SpeechSynthesisVoice[]) => {
      if (!voices || voices.length === 0) return null;

      // 1. Strict Google US English Female (Standard Google TTS voice in Chrome/Android)
      const googleUs = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google") &&
          (v.lang.toLowerCase().replace("_", "-") === "en-us" ||
            v.name.toLowerCase().includes("us english") ||
            v.name.toLowerCase().includes("us female"))
      );
      if (googleUs) return googleUs;

      // 2. Any Google English voice
      const googleAnyEn = voices.find(
        (v) => v.name.toLowerCase().includes("google") && v.lang.toLowerCase().startsWith("en")
      );
      if (googleAnyEn) return googleAnyEn;

      // 3. Known natural high-quality US female voices (Jenny, Aria, Samantha, Victoria, Zira)
      const usFemale = voices.find(
        (v) =>
          (v.lang.toLowerCase().replace("_", "-") === "en-us") &&
          (v.name.toLowerCase().includes("jenny") ||
            v.name.toLowerCase().includes("aria") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira"))
      );
      if (usFemale) return usFemale;

      // 4. Any en-US voice
      const anyUs = voices.find(
        (v) => v.lang.toLowerCase().replace("_", "-") === "en-us"
      );
      if (anyUs) return anyUs;

      // 5. Any English voice
      const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      return anyEn || voices[0] || null;
    };

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // Filter to English-only voices as requested by user ("i dont need other language voices")
      const englishVoices = allVoices.filter(
        (v) => v.lang && v.lang.toLowerCase().startsWith("en")
      );
      const filteredVoices = englishVoices.length > 0 ? englishVoices : allVoices;

      // Sort with Google US English / Google English at top, followed by natural US female
      filteredVoices.sort((a, b) => {
        const aIsGoogleUs =
          a.name.toLowerCase().includes("google") &&
          (a.lang.toLowerCase().includes("us") || a.name.toLowerCase().includes("us english"));
        const bIsGoogleUs =
          b.name.toLowerCase().includes("google") &&
          (b.lang.toLowerCase().includes("us") || b.name.toLowerCase().includes("us english"));
        if (aIsGoogleUs && !bIsGoogleUs) return -1;
        if (!aIsGoogleUs && bIsGoogleUs) return 1;

        const aIsGoogle = a.name.toLowerCase().includes("google");
        const bIsGoogle = b.name.toLowerCase().includes("google");
        if (aIsGoogle && !bIsGoogle) return -1;
        if (!aIsGoogle && bIsGoogle) return 1;

        const aIsUs =
          a.lang.toLowerCase().includes("us") || a.lang.toLowerCase().replace("_", "-") === "en-us";
        const bIsUs =
          b.lang.toLowerCase().includes("us") || b.lang.toLowerCase().replace("_", "-") === "en-us";
        if (aIsUs && !bIsUs) return -1;
        if (!aIsUs && bIsUs) return 1;

        return a.name.localeCompare(b.name);
      });

      setAvailableVoices(filteredVoices);

      // Restore saved preference if exists and valid, otherwise auto-select standard Google US Female
      getReaderPreferences().then((saved) => {
        if (saved?.ttsVoiceName) {
          const matchedSaved = filteredVoices.find((v) => v.name === saved.ttsVoiceName);
          if (matchedSaved) {
            setSelectedVoice(matchedSaved);
            return;
          }
        }
        const matched = findGoogleUsFemaleVoice(filteredVoices);
        if (matched) setSelectedVoice(matched);
      });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Sleep Timer Interval Ticker
  useEffect(() => {
    if (typeof sleepTimerMinutes === "number" && sleepTimerMinutes > 0) {
      setSleepTimerRemainingSec(sleepTimerMinutes * 60);

      if (sleepTimerIdRef.current) clearInterval(sleepTimerIdRef.current);

      sleepTimerIdRef.current = setInterval(() => {
        setSleepTimerRemainingSec((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(sleepTimerIdRef.current);
            stopTts();
            setSleepTimerMinutes(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (sleepTimerIdRef.current) clearInterval(sleepTimerIdRef.current);
      };
    } else if (sleepTimerMinutes === null) {
      if (sleepTimerIdRef.current) clearInterval(sleepTimerIdRef.current);
      setSleepTimerRemainingSec(null);
    }
  }, [sleepTimerMinutes]);

  // Unique ID for IndexedDB caching
  const novelId = useMemo(() => {
    return `${siteId}_${novelTitle}`.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "_");
  }, [siteId, novelTitle]);

  // Clean Paragraphs for Display
  const chineseParagraphs = useMemo(() => {
    if (!chineseContent) return [];
    return chineseContent
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [chineseContent]);

  const englishParagraphs = useMemo(() => {
    if (!englishContent) return [];
    return englishContent
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [englishContent]);

  // Active paragraphs for TTS and reading
  const displayParagraphs = useMemo(() => {
    if (prefs.bilingualMode === "chinese") {
      return chineseParagraphs;
    }
    if (englishParagraphs.length > 0) {
      return englishParagraphs;
    }
    return chineseParagraphs;
  }, [prefs.bilingualMode, englishParagraphs, chineseParagraphs]);

  // Keep ref in sync for zero-delay TTS
  useEffect(() => {
    ttsParagraphsRef.current = displayParagraphs;
  }, [displayParagraphs]);

  // -------------------------------------------------------------
  // Load Chapter (Instant Cache First -> Network Fallback)
  // -------------------------------------------------------------
  const loadChapter = useCallback(
    async (targetIndex: number) => {
      if (targetIndex < 1) return;
      setIsLoadingChapter(true);
      setChapterError(null);
      setIsDataSavedFromCache(false);
      setSingleChapterTranslateError(null);

      // Stop any active TTS utterance when navigating chapters
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
      setActiveParagraphIndex(-1);
      activeParagraphIndexRef.current = -1;

      // 1. Check current session chunks (e.g., active translation session)
      if (sessionChunks && sessionChunks.length > 0) {
        const sessionChunk = sessionChunks[targetIndex - 1];
        if (sessionChunk) {
          setCurrentChapterIndex(targetIndex);
          setChapterTitle(sessionChunk.chapterTitle || `Chapter ${targetIndex}`);
          setChineseContent(sessionChunk.chineseText || "");
          setEnglishContent(sessionChunk.englishText || "");
          setIsLoadingChapter(false);
          setIsDataSavedFromCache(true);
          onUpdateChapterIndex?.(targetIndex, sessionChunk.chapterTitle || `Chapter ${targetIndex}`);
          if (pendingTtsStartRef.current) {
            pendingTtsStartRef.current = false;
            setTimeout(() => speakParagraphAtIndex(0), 250);
          }
          return;
        }
      }

      // 2. Check IndexedDB Offline Cache (0 bytes network!)
      try {
        const cached = await getCachedChapter(novelId, targetIndex);
        if (cached && cached.chineseContent) {
          setCurrentChapterIndex(targetIndex);
          setChapterTitle(cached.chapterTitle || `Chapter ${targetIndex}`);
          setChineseContent(cached.chineseContent);
          setEnglishContent(cached.englishContent || "");
          setIsLoadingChapter(false);
          setIsDataSavedFromCache(true);
          onUpdateChapterIndex?.(targetIndex, cached.chapterTitle || `Chapter ${targetIndex}`);
          if (pendingTtsStartRef.current) {
            pendingTtsStartRef.current = false;
            setTimeout(() => speakParagraphAtIndex(0), 250);
          }
          return;
        }
      } catch (e) {
        console.warn("IndexedDB cache check skipped:", e);
      }

      // 3. Fetch from API if not in cache
      try {
        let chapterObj = chapterList[targetIndex - 1];
        let res: Response;

        if (chapterObj && chapterObj.url) {
          res = await fetch("/api/store/fetch-chapter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              chapterUrl: chapterObj.url,
              chapterTitle: chapterObj.title,
            }),
          });
        } else {
          res = await fetch("/api/store/peek-chapter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              novelUrl,
              siteId,
              title: novelTitle,
              author,
              targetIndex,
            }),
          });
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load chapter content.");
        }

        const data = await res.json();
        const fetchedTitle = data.chapterTitle || (chapterObj ? chapterObj.title : `Chapter ${targetIndex}`);
        const fetchedChinese = data.content || "";

        setCurrentChapterIndex(targetIndex);
        setChapterTitle(fetchedTitle);
        setChineseContent(fetchedChinese);
        setEnglishContent(data.englishContent || "");

        if (data.allChapters && Array.isArray(data.allChapters) && data.allChapters.length > 0) {
          setChapterList(data.allChapters);
        }

        onUpdateChapterIndex?.(targetIndex, fetchedTitle, data.allChapters);

        // Save to IndexedDB cache
        await setCachedChapter(novelId, targetIndex, {
          chapterIndex: targetIndex,
          chapterTitle: fetchedTitle,
          chineseContent: fetchedChinese,
          englishContent: data.englishContent || "",
          totalChapters: data.totalChapters || totalChapters,
        });

        // If in user library, auto-update last read chapter
        try {
          const libraryBooks = getLocalLibraryBooks();
          const exists = libraryBooks.some((b) => b.id === novelId || (b.title === novelTitle && (b.author === author || !author)));
          if (exists) {
            addOrUpdateBookInLibrary({
              id: novelId,
              title: novelTitle,
              author,
              coverUrl,
              novelUrl,
              siteId,
              currentChapterIndex: targetIndex,
              totalChapters: data.totalChapters || totalChapters || chapterList.length || 1,
              lastReadChapterTitle: fetchedTitle,
              allChapters: data.allChapters || chapterList,
            });
          }
        } catch {}

        if (pendingTtsStartRef.current) {
          pendingTtsStartRef.current = false;
          setTimeout(() => speakParagraphAtIndex(0), 250);
        }
      } catch (err: any) {
        setChapterError(err.message || "Failed to load chapter text.");
      } finally {
        setIsLoadingChapter(false);
        if (readerBodyRef.current) {
          readerBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },
    [novelId, chapterList, novelUrl, siteId, novelTitle, author, getAuthHeaders, sessionChunks, totalChapters, onUpdateChapterIndex]
  );

  // Novel Identity Synchronization: When switching from Novel 1 to Novel 2, cleanly reset and load novel 2
  const prevNovelKeyRef = useRef<string>(`${siteId}_${novelTitle}_${novelUrl || ""}`);
  useEffect(() => {
    const currentKey = `${siteId}_${novelTitle}_${novelUrl || ""}`;
    if (prevNovelKeyRef.current !== currentKey) {
      prevNovelKeyRef.current = currentKey;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
      setActiveParagraphIndex(-1);
      activeParagraphIndexRef.current = -1;
      pendingTtsStartRef.current = false;

      const targetIndex = initialChapterIndex || 1;
      setCurrentChapterIndex(targetIndex);
      setChapterTitle(`Chapter ${targetIndex}`);
      setChineseContent(initialContent || "");
      setEnglishContent(initialEnglishContent || "");
      setChapterList(allChapters && allChapters.length > 0 ? allChapters : []);
      setChapterError(null);
      setIsDataSavedFromCache(false);

      if (!initialContent) {
        loadChapter(targetIndex);
      }
    }
  }, [siteId, novelTitle, novelUrl, initialChapterIndex, initialContent, initialEnglishContent, allChapters, loadChapter]);

  // Load initial chapter if needed
  useEffect(() => {
    if (isOpen && !chineseContent && !isLoadingChapter) {
      loadChapter(currentChapterIndex);
    }
  }, [isOpen, chineseContent, currentChapterIndex, isLoadingChapter, loadChapter]);

  // -------------------------------------------------------------
  // Translate THIS Chapter On-Demand (Single Chapter AI Translation)
  // -------------------------------------------------------------
  const handleTranslateThisChapter = async () => {
    if (!chineseContent || !chineseContent.trim()) return;
    setIsTranslatingSingleChapter(true);
    setSingleChapterTranslateError(null);

    try {
      const res = await fetch("/api/store/translate-single-chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          content: chineseContent,
          chapterTitle,
          novelTitle,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Single chapter translation failed.");
      }

      const data = await res.json();
      if (data.englishContent) {
        setEnglishContent(data.englishContent);
        updatePrefs({ bilingualMode: "english" });

        // Save translation directly to IndexedDB cache
        await setCachedChapter(novelId, currentChapterIndex, {
          chapterIndex: currentChapterIndex,
          chapterTitle,
          chineseContent,
          englishContent: data.englishContent,
          totalChapters: chapterList.length || totalChapters,
        });
      }
    } catch (err: any) {
      console.error("Single chapter translation error:", err);
      setSingleChapterTranslateError(err.message || "Could not translate chapter.");
    } finally {
      setIsTranslatingSingleChapter(false);
    }
  };

  // -------------------------------------------------------------
  // QuickNovel Zero-Delay TTS & Paragraph Highlighting Engine
  // -------------------------------------------------------------

  const stopTts = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsTtsPlaying(false);
    setIsTtsPaused(false);
    setActiveParagraphIndex(-1);
    activeParagraphIndexRef.current = -1;
    pendingTtsStartRef.current = false;
  }, []);

  const speakParagraphAtIndex = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setTtsFeedbackMessage("Text-to-speech is not supported in this browser.");
        setTimeout(() => setTtsFeedbackMessage(null), 3000);
        return;
      }

      const paragraphs = ttsParagraphsRef.current;
      if (!paragraphs || paragraphs.length === 0) {
        if (isLoadingChapter) {
          pendingTtsStartRef.current = true;
          setTtsFeedbackMessage("Chapter is loading... TTS will begin in a moment.");
          setTimeout(() => setTtsFeedbackMessage(null), 3000);
          return;
        }
        setTtsFeedbackMessage("No text found in chapter to speak.");
        setTimeout(() => setTtsFeedbackMessage(null), 3000);
        stopTts();
        return;
      }

      if (index < 0 || index >= paragraphs.length) {
        // Reached end of current chapter
        if (sleepTimerMinutes === "end-of-chapter") {
          stopTts();
          setSleepTimerMinutes(null);
          return;
        }

        if (prefs.autoAdvanceTts) {
          const nextIndex = currentChapterIndex + 1;
          const maxChapters = chapterList.length || totalChapters;
          if (nextIndex <= maxChapters) {
            pendingTtsStartRef.current = true;
            loadChapter(nextIndex);
            return;
          }
        }
        stopTts();
        return;
      }

      const rawText = paragraphs[index] || "";
      const text = rawText.trim();
      if (!text) {
        // Skip empty whitespace paragraphs instantly
        speakParagraphAtIndex(index + 1);
        return;
      }

      // 1. Synchronously update UI state IMMEDIATELY (0ms perceived lag)
      setIsTtsPlaying(true);
      setIsTtsPaused(false);
      setActiveParagraphIndex(index);
      activeParagraphIndexRef.current = index;

      // 2. Smoothly scroll highlighted paragraph into center view (non-blocking)
      requestAnimationFrame(() => {
        const el = document.getElementById(`reader-paragraph-${index}`);
        if (el && readerBodyRef.current) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      // 3. Language & Voice Matching
      const isChinese = /[\u4e00-\u9fa5]/.test(text);

      let currentVoices = availableVoices;
      if (!currentVoices || currentVoices.length === 0) {
        try {
          const fresh = window.speechSynthesis.getVoices();
          if (fresh && fresh.length > 0) {
            currentVoices = fresh;
            setAvailableVoices(fresh);
          }
        } catch {}
      }

      let voiceToUse: SpeechSynthesisVoice | null = null;
      if (isChinese) {
        if (selectedVoice && selectedVoice.lang && selectedVoice.lang.toLowerCase().startsWith("zh")) {
          voiceToUse = selectedVoice;
        } else if (currentVoices && currentVoices.length > 0) {
          voiceToUse =
            currentVoices.find((v) => v.lang && (v.lang.toLowerCase() === "zh-cn" || v.lang.toLowerCase() === "zh_cn")) ||
            currentVoices.find((v) => v.lang && v.lang.toLowerCase().startsWith("zh")) ||
            currentVoices.find((v) => v.name.toLowerCase().includes("chinese") || v.name.includes("普通话") || v.name.includes("中文")) ||
            null;
        }
      } else {
        if (selectedVoice && selectedVoice.lang && selectedVoice.lang.toLowerCase().startsWith("en")) {
          voiceToUse = selectedVoice;
        } else if (currentVoices && currentVoices.length > 0) {
          voiceToUse =
            currentVoices.find((v) => v.lang && (v.lang.toLowerCase() === "en-us" || v.lang.toLowerCase() === "en_us")) ||
            currentVoices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) ||
            null;
        }
      }

      // 4. Create Utterance with explicit language
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isChinese ? "zh-CN" : "en-US";
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }
      utterance.rate = prefs.ttsRate || 1.0;
      utterance.pitch = prefs.ttsPitch || 1.0;

      utterance.onend = () => {
        const nextIdx = index + 1;
        speakParagraphAtIndex(nextIdx);
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("TTS Error:", e);
          if (utterance.voice && e.error !== "not-allowed") {
            setTimeout(() => {
              const fallback = new SpeechSynthesisUtterance(text);
              fallback.lang = isChinese ? "zh-CN" : "en-US";
              fallback.rate = prefs.ttsRate || 1.0;
              fallback.pitch = prefs.ttsPitch || 1.0;
              fallback.onend = () => speakParagraphAtIndex(index + 1);
              utteranceRef.current = fallback;
              (window as any).__megatextActiveUtterance = fallback;
              window.speechSynthesis.speak(fallback);
            }, 30);
          }
        }
      };

      // 5. Safely cancel preceding audio and prevent Android Chrome race condition
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      utteranceRef.current = utterance;
      (window as any).__megatextActiveUtterance = utterance;

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis speak error:", err);
        }
      }, 20);
    },
    [
      selectedVoice,
      availableVoices,
      prefs.ttsRate,
      prefs.ttsPitch,
      prefs.autoAdvanceTts,
      currentChapterIndex,
      chapterList.length,
      totalChapters,
      sleepTimerMinutes,
      loadChapter,
      stopTts,
      isLoadingChapter,
    ]
  );

  // Instant 0ms Play / Pause Handler
  const togglePlayPauseTts = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isTtsPlaying) {
      if (isTtsPaused) {
        // Resume instantly
        setIsTtsPaused(false);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          // If browser lost state, restart from active paragraph
          const target = activeParagraphIndexRef.current >= 0 ? activeParagraphIndexRef.current : 0;
          speakParagraphAtIndex(target);
        }
      } else {
        // Pause instantly
        setIsTtsPaused(true);
        window.speechSynthesis.pause();
      }
    } else {
      const startIndex = activeParagraphIndexRef.current >= 0 ? activeParagraphIndexRef.current : 0;
      speakParagraphAtIndex(startIndex);
    }
  };

  // Instant Skip Paragraph Handler (0ms Delay)
  const handleSkipParagraph = (direction: -1 | 1) => {
    const current = activeParagraphIndexRef.current >= 0 ? activeParagraphIndexRef.current : 0;
    const next = current + direction;
    const max = displayParagraphs.length;
    if (next >= 0 && next < max) {
      speakParagraphAtIndex(next);
    } else if (next >= max) {
      // Advance to next chapter
      handleSkipChapter(1);
    } else if (next < 0 && currentChapterIndex > 1) {
      // Skip back to previous chapter
      handleSkipChapter(-1);
    }
  };

  // Instant Skip Chapter Handler
  const handleSkipChapter = (direction: -1 | 1) => {
    const target = currentChapterIndex + direction;
    const maxChapters = chapterList.length || totalChapters;
    if (target >= 1 && target <= maxChapters) {
      loadChapter(target);
    }
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (sleepTimerIdRef.current) clearInterval(sleepTimerIdRef.current);
    };
  }, []);

  // Theme Stylings (QuickNovel authentic palette)
  const themeClasses = useMemo(() => {
    switch (prefs.theme) {
      case "oled":
        return {
          bg: "bg-[#09090b]",
          text: "text-zinc-100",
          cardBg: "bg-zinc-900/95",
          border: "border-zinc-800",
          navBg: "bg-[#09090b]/95",
          activeParagraph:
            "bg-purple-950/40 text-purple-100 border-l-4 border-purple-500 pl-3.5 ring-1 ring-purple-500/20",
          playerBg: "bg-zinc-900/95 border-zinc-800 text-zinc-100",
          buttonBg: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
        };
      case "cream":
        return {
          bg: "bg-[#fcf7ed]",
          text: "text-[#2e261f]",
          cardBg: "bg-[#f5ecdc]/95",
          border: "border-[#e6dbca]",
          navBg: "bg-[#fcf7ed]/95",
          activeParagraph:
            "bg-[#f0e3cc] text-[#241a12] border-l-4 border-amber-600 pl-3.5 ring-1 ring-amber-500/20",
          playerBg: "bg-[#f5ecdc]/95 border-[#e2d5c0] text-[#2e261f]",
          buttonBg: "bg-[#eae0cd] hover:bg-[#dfd3bd] text-[#2e261f]",
        };
      case "slate":
        return {
          bg: "bg-[#0f172a]",
          text: "text-slate-100",
          cardBg: "bg-slate-900/95",
          border: "border-slate-800",
          navBg: "bg-[#0f172a]/95",
          activeParagraph:
            "bg-sky-950/40 text-sky-100 border-l-4 border-sky-400 pl-3.5 ring-1 ring-sky-500/20",
          playerBg: "bg-slate-900/95 border-slate-800 text-slate-100",
          buttonBg: "bg-slate-800 hover:bg-slate-700 text-slate-200",
        };
      case "light":
        return {
          bg: "bg-white",
          text: "text-slate-900",
          cardBg: "bg-slate-50/95",
          border: "border-slate-200",
          navBg: "bg-white/95",
          activeParagraph:
            "bg-purple-50 text-slate-950 border-l-4 border-purple-600 pl-3.5 ring-1 ring-purple-300",
          playerBg: "bg-white/95 border-slate-200 text-slate-900 shadow-xl",
          buttonBg: "bg-slate-100 hover:bg-slate-200 text-slate-800",
        };
      case "sepia":
      default:
        return {
          bg: "bg-[#fbf0d9]",
          text: "text-[#3f3123]",
          cardBg: "bg-[#f3e3be]/95",
          border: "border-[#dfcca1]",
          navBg: "bg-[#fbf0d9]/95",
          activeParagraph:
            "bg-[#ebd6a7] text-[#2c1d0f] border-l-4 border-amber-700 pl-3.5 ring-1 ring-amber-600/20",
          playerBg: "bg-[#f3e3be]/95 border-[#dec899] text-[#3f3123]",
          buttonBg: "bg-[#e8d5a8] hover:bg-[#ddc895] text-[#3f3123]",
        };
    }
  }, [prefs.theme]);

  // Typography Stylings
  const fontClass =
    prefs.fontFamily === "serif" ? "font-serif" : prefs.fontFamily === "mono" ? "font-mono" : "font-sans";

  const lineHeightClass =
    prefs.lineHeight === "compact"
      ? "leading-relaxed space-y-3"
      : prefs.lineHeight === "relaxed"
      ? "leading-loose space-y-6"
      : "leading-relaxed space-y-4";

  // Filtered Chapters in Drawer
  const filteredChapters = useMemo(() => {
    if (!chapterSearchQuery.trim()) return chapterList;
    return chapterList.filter(
      (c, idx) =>
        c.title.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
        String(idx + 1).includes(chapterSearchQuery)
    );
  }, [chapterList, chapterSearchQuery]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Floating Reader Pill (When Minimized)
  // Draggable, sits safely above bottom navigation (default bottom: 92px)
  // -------------------------------------------------------------
  if (isMinimized) {
    const isDockedLeft = bubblePos.side === "left";
    return (
      <div
        style={{
          bottom: `${bubblePos.bottom}px`,
          ...(isDockedLeft ? { left: "16px" } : { right: "16px" }),
        }}
        className="fixed z-40 select-none animate-in zoom-in-75 duration-200"
      >
        {/* Subtle pulsing wave when audio is actively speaking */}
        {isTtsPlaying && !isTtsPaused && (
          <span className="absolute -inset-1.5 rounded-full bg-purple-500/25 animate-ping pointer-events-none" />
        )}

        <div className="relative flex items-center bg-slate-900/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-purple-500/30 ring-1 ring-white/10 hover:border-purple-400/60 transition-colors">
          {/* Main draggable button to restore reader */}
          <button
            type="button"
            onPointerDown={(e) => {
              isDraggingBubbleRef.current = true;
              bubbleHasMovedRef.current = false;
              bubbleDragStartRef.current = {
                clientX: e.clientX,
                clientY: e.clientY,
                startBottom: bubblePos.bottom,
              };
              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerMove={(e) => {
              if (!isDraggingBubbleRef.current) return;
              const dy = bubbleDragStartRef.current.clientY - e.clientY;
              const dx = Math.abs(e.clientX - bubbleDragStartRef.current.clientX);
              if (Math.abs(dy) > 5 || dx > 5) {
                bubbleHasMovedRef.current = true;
              }
              const newBottom = Math.max(84, Math.min(window.innerHeight - 80, bubbleDragStartRef.current.startBottom + dy));
              const newSide: "right" | "left" = e.clientX < window.innerWidth / 2 ? "left" : "right";
              setBubblePos({
                bottom: newBottom,
                side: newSide,
                ...(newSide === "left" ? { left: 16 } : { right: 16 }),
              });
            }}
            onPointerUp={(e) => {
              if (!isDraggingBubbleRef.current) return;
              isDraggingBubbleRef.current = false;
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch {}
              if (bubbleHasMovedRef.current) {
                try {
                  localStorage.setItem("megatext_reader_bubble_pos", JSON.stringify(bubblePos));
                } catch {}
              } else {
                onToggleMinimize();
              }
            }}
            title={`Reader Minimized (${novelTitle} · Ch ${currentChapterIndex}) - Tap to open or drag to move`}
            className="flex items-center gap-2 pl-2 pr-3 py-1 cursor-grab active:cursor-grabbing group touch-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              {isTtsPlaying && !isTtsPaused ? (
                <Volume2 className="h-5 w-5 text-white animate-pulse" />
              ) : (
                <BookOpen className="h-5 w-5 text-white" />
              )}
            </div>

            <div className="flex flex-col text-left max-w-[140px] sm:max-w-[180px]">
              <span className="text-[11px] font-bold text-zinc-100 truncate leading-tight">
                {novelTitle}
              </span>
              <span className="text-[10px] font-medium text-purple-300 leading-tight">
                Ch {currentChapterIndex}
                {isTtsPlaying && !isTtsPaused ? " · Speaking..." : isTtsPaused ? " · Paused" : ""}
              </span>
            </div>
          </button>

          {/* Quick Play / Pause Toggle right on the floating widget */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPauseTts();
            }}
            title={isTtsPlaying && !isTtsPaused ? "Pause TTS" : "Play TTS"}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0 ml-1"
          >
            {isTtsPlaying && !isTtsPaused ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Close Reader Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stopTts();
              onClose();
            }}
            title="Close Reader"
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-600 flex items-center justify-center cursor-pointer transition-colors active:scale-90 shrink-0 ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Fullscreen Immersive QuickNovel Reader
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 p-0 sm:p-2 md:p-3">
      <div
        className={`w-full max-w-4xl h-full sm:h-[96vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors ${themeClasses.bg} ${themeClasses.text} border ${themeClasses.border}`}
      >
        {/* ========================================================= */}
        {/* QuickNovel App Bar (Header) */}
        {/* ========================================================= */}
        <header
          className={`px-3 sm:px-5 py-2.5 shrink-0 flex items-center justify-between gap-2 sm:gap-3 border-b ${themeClasses.border} ${themeClasses.navBg} backdrop-blur-md`}
        >
          {/* Left: Back / Close & Novel Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                stopTts();
                onClose();
              }}
              title="Back / Close"
              className={`p-2 rounded-xl ${themeClasses.buttonBg} transition active:scale-95 cursor-pointer shrink-0`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-600/15 text-purple-700 dark:text-purple-300">
                  QuickNovel
                </span>
                {isDataSavedFromCache && (
                  <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    0 KB Offline
                  </span>
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-bold truncate leading-tight mt-0.5">{novelTitle}</h2>
              <p className="text-[11px] opacity-70 truncate font-sans">
                {chapterTitle} {chapterList.length > 0 ? `· (${currentChapterIndex} / ${chapterList.length})` : ""}
              </p>
            </div>
          </div>

          {/* Right Action Controls (Clean, uncluttered, with all settings under the gear icon) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Library / Bookmark Toggle */}
            <button
              type="button"
              onClick={handleToggleLibrary}
              title={isInLibrary ? "Saved in Library (Click to remove)" : "Bookmark & Save to Library"}
              className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 ${
                isInLibrary
                  ? "bg-purple-600 text-white shadow-xs"
                  : `${themeClasses.buttonBg} hover:text-purple-600`
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isInLibrary ? "fill-current" : ""}`} />
            </button>

            {/* Chapters Table of Contents */}
            <button
              type="button"
              onClick={() => setShowChapterDrawer(!showChapterDrawer)}
              title="Table of Contents (Chapters)"
              className={`p-2 sm:p-2.5 rounded-xl ${themeClasses.buttonBg} transition cursor-pointer flex items-center justify-center active:scale-95`}
            >
              <List className="h-5 w-5" />
            </button>

            {/* Minimize Reader (Minimizes to floating open book bubble at bottom-right) */}
            <button
              type="button"
              onClick={onToggleMinimize}
              title="Minimize to Floating Book Bubble"
              className={`p-2 sm:p-2.5 rounded-xl ${themeClasses.buttonBg} transition cursor-pointer text-purple-600 dark:text-purple-400 active:scale-95 flex items-center justify-center`}
            >
              <Minimize2 className="h-5 w-5" />
            </button>

            {/* Gear Icon (All Settings: Text size, Fonts, TTS Voice, 1.3x Speed, Sleep Timer, Translation) */}
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="Settings"
              className={`p-2 sm:p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 ${
                showSettingsMenu
                  ? "bg-purple-600 text-white shadow-sm"
                  : `${themeClasses.buttonBg} hover:text-purple-600`
              }`}
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Close Reader */}
            <button
              type="button"
              onClick={() => {
                stopTts();
                onClose();
              }}
              title="Close Reader"
              className={`p-2 sm:p-2.5 rounded-xl ${themeClasses.buttonBg} hover:bg-rose-500/20 hover:text-rose-600 transition cursor-pointer active:scale-95 flex items-center justify-center`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* QuickNovel Settings Sheet (read_bottom_settings) */}
        {/* ========================================================= */}
        {showSettingsMenu && (
          <div
            className={`border-b ${themeClasses.border} ${themeClasses.cardBg} animate-in slide-in-from-top-2 text-xs select-none`}
          >
            {/* QuickNovel Navigation Tabs */}
            <div className="flex items-center border-b border-black/5 dark:border-white/5 px-4 pt-2 gap-2 overflow-x-auto">
              {[
                { id: "text", label: "Text" },
                { id: "voice", label: "Voice / TTS" },
                { id: "translation", label: "Translation" },
                { id: "general", label: "General" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSettingsTab(tab.id as any)}
                  className={`px-3 py-1.5 font-bold rounded-t-lg transition border-b-2 ${
                    settingsTab === tab.id
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-black/5 dark:bg-white/5"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Tab 1: Text Settings */}
              {settingsTab === "text" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Theme Palette */}
                  <div className="space-y-1.5">
                    <span className="font-bold block opacity-75">Theme Palette</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: "sepia", name: "Sepia", bg: "bg-[#fbf0d9]", border: "border-[#d8c397]" },
                        { id: "cream", name: "Cream", bg: "bg-[#fcf7ed]", border: "border-[#e0d3bc]" },
                        { id: "oled", name: "OLED", bg: "bg-[#09090b]", border: "border-zinc-700" },
                        { id: "slate", name: "Slate", bg: "bg-[#0f172a]", border: "border-slate-600" },
                        { id: "light", name: "Light", bg: "bg-white", border: "border-slate-300" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updatePrefs({ theme: t.id as any })}
                          className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border-2 transition ${
                            t.bg
                          } ${t.border} ${prefs.theme === t.id ? "ring-2 ring-purple-600 ring-offset-1" : "opacity-80"}`}
                        >
                          {prefs.theme === t.id && <Check className="h-3.5 w-3.5 text-purple-700" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size & Line Height (Supports down to 8px with quick presets) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold block opacity-75">Font Size & Spacing</span>
                      <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">
                        Current: {prefs.fontSize}px
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => updatePrefs({ fontSize: Math.max(8, prefs.fontSize - 1) })}
                        className={`px-2.5 py-1 rounded-lg ${themeClasses.buttonBg} font-bold text-xs hover:bg-purple-500/20 active:scale-95 transition`}
                        title="Decrease text size (down to 8px)"
                      >
                        A-
                      </button>

                      {/* Quick Font Size Presets including extra small sizes */}
                      {[8, 10, 11, 12, 14, 16, 18, 20].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updatePrefs({ fontSize: size })}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                            prefs.fontSize === size
                              ? "bg-purple-600 text-white shadow-xs"
                              : `${themeClasses.buttonBg} opacity-80 hover:opacity-100`
                          }`}
                        >
                          {size}px
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => updatePrefs({ fontSize: Math.min(32, prefs.fontSize + 1) })}
                        className={`px-2.5 py-1 rounded-lg ${themeClasses.buttonBg} font-bold text-xs hover:bg-purple-500/20 active:scale-95 transition`}
                        title="Increase text size"
                      >
                        A+
                      </button>

                      <select
                        value={prefs.lineHeight}
                        onChange={(e) => updatePrefs({ lineHeight: e.target.value as any })}
                        className={`rounded-lg ${themeClasses.buttonBg} px-2 py-1 font-semibold focus:outline-none text-xs ml-auto`}
                      >
                        <option value="compact">Compact Spacing</option>
                        <option value="normal">Normal Spacing</option>
                        <option value="relaxed">Relaxed Spacing</option>
                      </select>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-1.5">
                    <span className="font-bold block opacity-75">Typeface</span>
                    <select
                      value={prefs.fontFamily}
                      onChange={(e) => updatePrefs({ fontFamily: e.target.value as any })}
                      className={`w-full rounded-lg ${themeClasses.buttonBg} px-2.5 py-1.5 font-semibold focus:outline-none`}
                    >
                      <option value="serif">Serif (Literary Book)</option>
                      <option value="sans">Sans-serif (Modern Clean)</option>
                      <option value="mono">Monospace (Technical)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 2: Voice Settings (Standard Google US Voice Priority & Fine-grained Speed Options) */}
              {settingsTab === "voice" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold block opacity-75">Voice Actor (English)</span>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          Google US Standard
                        </span>
                      </div>
                      <select
                        value={selectedVoice?.name || ""}
                        onChange={(e) => {
                          const v = availableVoices.find((x) => x.name === e.target.value);
                          if (v) {
                            setSelectedVoice(v);
                            updatePrefs({ ttsVoiceName: v.name });
                            if (isTtsPlaying && activeParagraphIndexRef.current >= 0) {
                              speakParagraphAtIndex(activeParagraphIndexRef.current);
                            }
                          }
                        }}
                        className={`w-full rounded-lg ${themeClasses.buttonBg} px-2.5 py-2 font-semibold text-xs focus:outline-none truncate`}
                      >
                        {availableVoices.map((v, i) => {
                          const nameLower = v.name.toLowerCase();
                          const isGoogle = nameLower.includes("google");
                          const isUs = v.lang.toLowerCase().includes("us") || nameLower.includes("us");
                          let tag = "";
                          if (isGoogle && isUs) tag = " ★ (Google US Standard)";
                          else if (isGoogle) tag = " (Google)";
                          else if (nameLower.includes("natural") || nameLower.includes("jenny") || nameLower.includes("aria") || nameLower.includes("samantha")) tag = " (Natural)";
                          
                          return (
                            <option key={i} value={v.name}>
                              {v.name} [{v.lang}]{tag}
                            </option>
                          );
                        })}
                      </select>
                      <p className="text-[10.5px] opacity-60">
                        Defaulted to the clean Google Text-to-Speech US English voice. Other foreign language voices have been filtered out.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold block opacity-75">Auto-advance Next Chapter</span>
                      <label className="flex items-center gap-2 cursor-pointer mt-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                        <input
                          type="checkbox"
                          checked={prefs.autoAdvanceTts}
                          onChange={(e) => updatePrefs({ autoAdvanceTts: e.target.checked })}
                          className="rounded text-purple-600 focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <span className="font-semibold text-xs leading-tight">
                          Seamlessly read next chapter when finished
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* TTS Speech Rate (Granular Speed Options: 1.3x, 1.35x, 1.4x, 1.45x, 1.5x, etc.) */}
                  <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold block opacity-75">TTS Speed / Rate</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newRate = Math.max(0.5, Math.round((prefs.ttsRate - 0.05) * 100) / 100);
                            updatePrefs({ ttsRate: newRate });
                            if (isTtsPlaying && activeParagraphIndexRef.current >= 0) {
                              speakParagraphAtIndex(activeParagraphIndexRef.current);
                            }
                          }}
                          className={`px-2 py-0.5 rounded ${themeClasses.buttonBg} hover:bg-purple-500/20 active:scale-95 font-mono font-bold text-[11px] cursor-pointer`}
                          title="Decrease speed by 0.05x"
                        >
                          -0.05
                        </button>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                          {Number(prefs.ttsRate).toFixed(2).replace(/\.00$/, ".0").replace(/0$/, "")}x
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newRate = Math.min(2.5, Math.round((prefs.ttsRate + 0.05) * 100) / 100);
                            updatePrefs({ ttsRate: newRate });
                            if (isTtsPlaying && activeParagraphIndexRef.current >= 0) {
                              speakParagraphAtIndex(activeParagraphIndexRef.current);
                            }
                          }}
                          className={`px-2 py-0.5 rounded ${themeClasses.buttonBg} hover:bg-purple-500/20 active:scale-95 font-mono font-bold text-[11px] cursor-pointer`}
                          title="Increase speed by 0.05x"
                        >
                          +0.05
                        </button>
                      </div>
                    </div>

                    {/* Speed preset pills with dedicated 1.30x, 1.35x, 1.40x, 1.45x, 1.50x */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[0.75, 1.0, 1.1, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.6, 1.75, 2.0].map((rate) => {
                        const isSelected = Math.abs(prefs.ttsRate - rate) < 0.02;
                        return (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              updatePrefs({ ttsRate: rate });
                              if (isTtsPlaying && activeParagraphIndexRef.current >= 0) {
                                speakParagraphAtIndex(activeParagraphIndexRef.current);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer active:scale-95 ${
                              isSelected
                                ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40 font-black"
                                : `${themeClasses.buttonBg} opacity-80 hover:opacity-100 hover:text-purple-600`
                            }`}
                          >
                            {rate}x
                          </button>
                        );
                      })}
                    </div>

                    {/* Smooth 0.05-step Slider */}
                    <div className="space-y-1 pt-1">
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={prefs.ttsRate}
                        onChange={(e) => {
                          const newRate = parseFloat(e.target.value);
                          updatePrefs({ ttsRate: newRate });
                          if (isTtsPlaying && activeParagraphIndexRef.current >= 0) {
                            speakParagraphAtIndex(activeParagraphIndexRef.current);
                          }
                        }}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] opacity-50 font-mono px-0.5">
                        <span>0.5x</span>
                        <span>1.0x</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">1.35x-1.45x</span>
                        <span>2.0x</span>
                        <span>2.5x</span>
                      </div>
                    </div>
                  </div>

                  {/* Sleep Timer inside Voice Settings */}
                  <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                    <span className="font-bold block opacity-75">Sleep Timer</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Off", val: null },
                        { label: "15 min", val: 15 },
                        { label: "30 min", val: 30 },
                        { label: "45 min", val: 45 },
                        { label: "60 min", val: 60 },
                        { label: "End of Chapter", val: "end-of-chapter" },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSleepTimerMinutes(item.val as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            sleepTimerMinutes === item.val
                              ? "bg-purple-600 text-white shadow-xs"
                              : `${themeClasses.buttonBg} opacity-80 hover:opacity-100`
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Translation Settings */}
              {settingsTab === "translation" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <span className="font-bold block opacity-75">Reading Display Mode</span>
                    <select
                      value={prefs.bilingualMode}
                      onChange={(e) => updatePrefs({ bilingualMode: e.target.value as any })}
                      className={`w-full rounded-lg ${themeClasses.buttonBg} px-2.5 py-1.5 font-semibold focus:outline-none`}
                    >
                      <option value="english">English Translation</option>
                      <option value="dual">Dual Bilingual (Side-by-side)</option>
                      <option value="chinese">Original Raw Chinese</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTranslateModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Languages className="h-4 w-4" />
                      <span>Open Translation Dialog</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: General Settings */}
              {settingsTab === "general" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="font-bold block opacity-75">Reading Width</span>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "standard", label: "Standard" },
                        { id: "wide", label: "Wide" },
                        { id: "full", label: "Full Width" },
                      ].map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setReadingWidth(w.id as any)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition ${
                            readingWidth === w.id
                              ? "bg-purple-600 text-white"
                              : `${themeClasses.buttonBg} opacity-80 hover:opacity-100`
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold block opacity-75">Sleep Timer</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Off", val: null },
                        { label: "15m", val: 15 },
                        { label: "30m", val: 30 },
                        { label: "45m", val: 45 },
                        { label: "60m", val: 60 },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSleepTimerMinutes(item.val as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            sleepTimerMinutes === item.val
                              ? "bg-purple-600 text-white"
                              : `${themeClasses.buttonBg} opacity-80`
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Main Reading Canvas & Chapters Drawer */}
        {/* ========================================================= */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Chapters Drawer (Slide-over inside reader) */}
          {showChapterDrawer && (
            <div
              className={`absolute inset-y-0 left-0 z-20 w-72 max-w-[85vw] border-r ${themeClasses.border} ${themeClasses.cardBg} shadow-2xl flex flex-col animate-in slide-in-from-left duration-200`}
            >
              <div className={`p-3 border-b ${themeClasses.border} flex items-center justify-between gap-2`}>
                <span className="font-bold text-xs uppercase tracking-wider">Chapter Index</span>
                <button
                  type="button"
                  onClick={() => setShowChapterDrawer(false)}
                  className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search chapter title or #..."
                  value={chapterSearchQuery}
                  onChange={(e) => setChapterSearchQuery(e.target.value)}
                  className={`w-full rounded-lg ${themeClasses.buttonBg} px-2.5 py-1.5 text-xs focus:outline-none border border-transparent focus:border-purple-400`}
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 p-1 text-xs">
                {filteredChapters.map((ch, idx) => {
                  const chIndex = ch.index || idx + 1;
                  const isCurrent = chIndex === currentChapterIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        loadChapter(chIndex);
                        setShowChapterDrawer(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? "bg-purple-600 text-white font-bold"
                          : "hover:bg-purple-500/10 opacity-90"
                      }`}
                    >
                      <span className="truncate">{ch.title || `Chapter ${chIndex}`}</span>
                      <span className="text-[10px] opacity-75 shrink-0">#{chIndex}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reader Body Text Container */}
          <div
            ref={readerBodyRef}
            id="novel-reader-scrollable-body"
            className={`flex-1 p-4 sm:p-8 overflow-y-auto ${fontClass} scroll-smooth`}
            style={{ fontSize: `${prefs.fontSize}px` }}
          >
            {isLoadingChapter ? (
              <div className="py-32 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-xs font-sans opacity-75">Loading chapter text directly from cache or archive...</p>
              </div>
            ) : chapterError ? (
              <div className="py-24 max-w-md mx-auto text-center space-y-3 font-sans">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                  <p className="font-bold mb-1">Notice</p>
                  <p>{chapterError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadChapter(currentChapterIndex)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold cursor-pointer active:scale-95"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <div
                className={`mx-auto ${
                  readingWidth === "full"
                    ? "max-w-full px-2 sm:px-4"
                    : readingWidth === "wide"
                    ? "max-w-4xl px-2 sm:px-6"
                    : "max-w-2xl px-1 sm:px-4"
                } space-y-6 transition-all duration-150`}
              >
                {/* Chapter Title Heading */}
                <div className="text-center pb-4 border-b border-black/10 dark:border-white/10">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">{chapterTitle}</h3>
                  <p className="text-xs opacity-60 mt-1 font-sans">
                    Chapter {currentChapterIndex} · {displayParagraphs.length} paragraphs
                  </p>
                </div>

                {/* Translation Scope Prompt Banner (If only Chinese exists) */}
                {prefs.bilingualMode !== "chinese" && englishParagraphs.length === 0 && chineseParagraphs.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 font-sans text-xs space-y-3">
                    <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                      <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-bold">Original Chinese Chapter Displayed</p>
                        <p className="opacity-85 text-[11px] mt-0.5">
                          This chapter has not been translated into English yet. You can choose whether to translate
                          just this single chapter instantly or queue the full novel:
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Button 1: Translate Just THIS Chapter */}
                      <button
                        type="button"
                        onClick={handleTranslateThisChapter}
                        disabled={isTranslatingSingleChapter}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        {isTranslatingSingleChapter ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Translating This Chapter...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Translate This Chapter</span>
                          </>
                        )}
                      </button>

                      {/* Button 2: Translate Full Novel / Range */}
                      {onImportNovel && (
                        <button
                          type="button"
                          onClick={onImportNovel}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-purple-500/10 text-xs font-bold active:scale-95 transition cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Translate Whole Book</span>
                        </button>
                      )}
                    </div>

                    {singleChapterTranslateError && (
                      <p className="text-rose-500 text-[11px] font-medium">{singleChapterTranslateError}</p>
                    )}
                  </div>
                )}

                {/* Paragraphs Display with QuickNovel Paragraph Highlighting & Click-to-Read */}
                <div className={lineHeightClass}>
                  {prefs.bilingualMode === "dual" ? (
                    // Dual Bilingual Mode (Side-by-side or stacked paragraph by paragraph)
                    chineseParagraphs.map((para, idx) => {
                      const engPara = englishParagraphs[idx] || "";
                      const isHighlighted = idx === activeParagraphIndex;
                      return (
                        <div
                          key={idx}
                          id={`reader-paragraph-${idx}`}
                          onClick={() => speakParagraphAtIndex(idx)}
                          className={`p-3 rounded-xl transition cursor-pointer ${
                            isHighlighted ? themeClasses.activeParagraph : "bg-black/5 dark:bg-white/5"
                          } space-y-1.5 mb-2.5`}
                        >
                          {engPara ? (
                            <p className="font-sans font-medium" style={{ fontSize: `${prefs.fontSize}px` }}>{engPara}</p>
                          ) : null}
                          <p className="opacity-75 font-serif" style={{ fontSize: `${Math.max(8, prefs.fontSize - 1)}px` }}>{para}</p>
                        </div>
                      );
                    })
                  ) : (
                    // English or Chinese Paragraphs with QuickNovel Paragraph Highlighting!
                    displayParagraphs.map((para, pIdx) => {
                      const isHighlighted = pIdx === activeParagraphIndex;
                      return (
                        <p
                          key={pIdx}
                          id={`reader-paragraph-${pIdx}`}
                          onClick={() => speakParagraphAtIndex(pIdx)}
                          style={{ fontSize: `${prefs.fontSize}px` }}
                          className={`transition-all duration-150 cursor-pointer rounded-xl p-2 sm:p-2.5 select-text ${
                            isHighlighted
                              ? `${themeClasses.activeParagraph} shadow-xs font-medium`
                              : "hover:bg-black/5 dark:hover:bg-white/5 opacity-90"
                          }`}
                        >
                          {isHighlighted && isTtsPlaying && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 mr-2 select-none align-middle">
                              <Volume2 className="h-3.5 w-3.5 inline animate-pulse" />
                            </span>
                          )}
                          {para}
                        </p>
                      );
                    })
                  )}
                </div>

                {/* Bottom Chapter Navigation Buttons */}
                <div className="pt-8 pb-10 flex items-center justify-between gap-4 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => loadChapter(currentChapterIndex - 1)}
                    disabled={currentChapterIndex <= 1 || isLoadingChapter}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${themeClasses.buttonBg} disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold active:scale-95`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous Chapter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadChapter(currentChapterIndex + 1)}
                    disabled={
                      isLoadingChapter ||
                      (chapterList.length > 0 && currentChapterIndex >= chapterList.length)
                    }
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold shadow-md active:scale-95"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* QuickNovel Signature Bottom Bar (reader_bottom_view_holder) */}
        {/* ========================================================= */}
        <footer
          className={`shrink-0 border-t ${themeClasses.border} ${themeClasses.playerBg} backdrop-blur-md flex flex-col shadow-2xl z-30 select-none`}
        >
          {/* MODE 1: When TTS is Active or Paused (Exact 4-button player matching reference: Rewind, Stop, Play/Pause, Forward. No extra buttons, no progress bar) */}
          {isTtsPlaying || isTtsPaused ? (
            <div className="grid grid-cols-4 w-full h-14 sm:h-16 divide-x divide-black/5 dark:divide-white/5">
              {/* 1. tts_action_back: Rewind / Previous Paragraph */}
              <button
                type="button"
                onClick={() => handleSkipParagraph(-1)}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title="Previous Paragraph (Rewind)"
              >
                <SkipBack className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Back</span>
              </button>

              {/* 2. tts_action_stop: Stop TTS */}
              <button
                type="button"
                onClick={stopTts}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title="Stop TTS"
              >
                <Square className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Stop</span>
              </button>

              {/* 3. tts_action_pause_play: Pause / Play Toggle (0ms Delay) */}
              <button
                type="button"
                onClick={togglePlayPauseTts}
                className="flex flex-col items-center justify-center w-full h-full text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 active:bg-purple-500/20 transition-colors cursor-pointer select-none group"
                title={isTtsPlaying && !isTtsPaused ? "Pause Speech" : "Play Speech"}
              >
                {isTtsPlaying && !isTtsPaused ? (
                  <Pause className="h-6 w-6 sm:h-7 sm:w-7 fill-current transition-transform group-active:scale-90" />
                ) : (
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current transition-transform group-active:scale-90 ml-0.5" />
                )}
                <span className="text-[10px] font-black tracking-tight mt-0.5">
                  {isTtsPlaying && !isTtsPaused ? "Pause" : "Play"}
                </span>
              </button>

              {/* 4. tts_action_forward: Next Paragraph / Fast Forward */}
              <button
                type="button"
                onClick={() => handleSkipParagraph(1)}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title="Next Paragraph (Forward)"
              >
                <SkipForward className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Forward</span>
              </button>
            </div>
          ) : (
            /* MODE 2: Normal Reader Bottom Bar (reader_bottom_view) */
            <div className="grid grid-cols-4 w-full h-14 sm:h-16 divide-x divide-black/5 dark:divide-white/5">
              {/* 1. read_action_rotate: Screen Rotation / Reading Width */}
              <button
                type="button"
                onClick={() => {
                  setReadingWidth((prev) => (prev === "standard" ? "wide" : prev === "wide" ? "full" : "standard"));
                }}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title={`Rotate Reading Layout (${readingWidth})`}
              >
                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:-rotate-45" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Rotate</span>
              </button>

              {/* 2. read_action_tts: Start Text-to-Speech */}
              <button
                type="button"
                onClick={() => {
                  const startIndex = activeParagraphIndexRef.current >= 0 ? activeParagraphIndexRef.current : 0;
                  speakParagraphAtIndex(startIndex);
                }}
                className="flex flex-col items-center justify-center w-full h-full text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 active:bg-purple-500/20 transition-colors cursor-pointer select-none group"
                title="Start Text-to-Speech (TTS)"
              >
                <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-black tracking-tight mt-0.5">TTS</span>
              </button>

              {/* 3. read_action_chapters: Chapters Table of Contents */}
              <button
                type="button"
                onClick={() => setShowChapterDrawer(true)}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title="Table of Contents (Chapters)"
              >
                <List className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Chapters</span>
              </button>

              {/* 4. read_action_settings: Reading Settings (Gear Icon) */}
              <button
                type="button"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="flex flex-col items-center justify-center w-full h-full text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors cursor-pointer select-none group"
                title="Settings & Font Formatting"
              >
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-active:scale-90" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">Settings</span>
              </button>
            </div>
          )}
        </footer>

        {/* Floating TTS Feedback Toast */}
        {ttsFeedbackMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-950/90 text-white text-xs font-semibold rounded-full shadow-2xl border border-white/20 backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none">
            {ttsFeedbackMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* QuickNovel Translation Scope Modal */}
        {/* Answers: "if i press translate, will it translate whole book or just that chapter?" */}
        {/* ========================================================= */}
        {showTranslateModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 max-w-md w-full text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-sm">QuickNovel Translation Scope</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTranslateModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs opacity-75 mt-3 leading-relaxed">
                Choose whether you want to translate <strong>just the active chapter</strong> immediately on-demand, or queue the <strong>entire novel</strong>:
              </p>

              <div className="mt-4 space-y-3">
                {/* Option 1: Just This Chapter */}
                <div
                  onClick={() => {
                    setShowTranslateModal(false);
                    handleTranslateThisChapter();
                  }}
                  className="p-3.5 rounded-xl border border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition flex items-start gap-3 group active:scale-98"
                >
                  <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        Translate Just Chapter {currentChapterIndex}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-600/15 text-purple-700 dark:text-purple-300">
                        Instant (Single Chapter)
                      </span>
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      Translates only this specific chapter in seconds. Saved instantly into IndexedDB offline storage (0 KB mobile data to re-read).
                    </p>
                  </div>
                </div>

                {/* Option 2: Entire Novel */}
                {onImportNovel && (
                  <div
                    onClick={() => {
                      setShowTranslateModal(false);
                      onImportNovel();
                    }}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 cursor-pointer transition flex items-start gap-3 group active:scale-98"
                  >
                    <div className="p-2 rounded-lg bg-zinc-700 dark:bg-zinc-800 text-white shrink-0 mt-0.5">
                      <Download className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold">
                          Translate Entire Novel ({chapterList.length || totalChapters} Chapters)
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                          Whole Book
                        </span>
                      </div>
                      <p className="text-[11px] opacity-70 mt-1">
                        Adds all chapters to the background translation worker with rate-limit pacing, Telegram progress sync, and EPUB export.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTranslateModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
