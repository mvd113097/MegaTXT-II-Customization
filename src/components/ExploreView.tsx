import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Compass,
  Search,
  Filter,
  Star,
  Heart,
  Calendar,
  Layers,
  BookOpen,
  Download,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle,
  Check,
  Tag,
  SlidersHorizontal,
  X,
  Bookmark,
  BookmarkCheck,
  LayoutGrid,
  List,
  Eye,
  FileText,
  Clock,
  ArrowUpDown,
  BookMarked,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChapterItem, StoreNovelDetail } from "./StoreView";

export interface ExploreNovelItem {
  id: string;
  title: string;
  author: string;
  siteId: string;
  siteName: string;
  novelUrl: string;
  year: number;
  dateStr: string;
  orientation: "bl" | "het" | "no_cp" | "general";
  orientationLabel: string;
  tags: string[];
  summary: string;
  points: number; // Authentic JJWXC work points or popularity score
  likes: number;
  wordCount?: number;
  status?: string;
  chapterCount?: number;
  latestChapter?: string;
  coverUrl?: string;
  hasDirectMirror?: boolean;
  fileSize?: string;
  rating?: number;
  ratingCount?: number;
  ratingMax?: number;
}

export interface ReadableMirror {
  siteId: string;
  siteName: string;
  title: string;
  author: string;
  novelUrl: string;
  latestChapter?: string;
  fileSize?: string;
}

export function formatCleanSiteName(siteId?: string, siteName?: string): string {
  const s = (siteId || siteName || "").toLowerCase();
  if (s.includes("aiqu")) return "aiqu";
  if (s.includes("jjwxc") || s.includes("晋江")) return "jjwxc";
  if (s.includes("52shuku") || s.includes("52")) return "52shuku";
  if (s.includes("fuxsb") || s.includes("腐小说")) return "fuxsb";
  if (s.includes("banxia") || s.includes("半夏")) return "banxia";
  if (s.includes("69shu") || s.includes("69")) return "69shu";
  if (s.includes("sto520") || s.includes("sto") || s.includes("思兔")) return "sto520";
  if (s.includes("shuba") || s.includes("书吧")) return "shuba";
  if (s.includes("hetushu") || s.includes("和图书")) return "hetushu";
  if (s.includes("paoshuba") || s.includes("泡书吧")) return "paoshuba";
  if (s.includes("bxwx") || s.includes("笔下文学")) return "bxwx";
  return (siteName || siteId || "source").replace(/\.(com|vip|net|org|cc|info|me|top|cn)$/i, "").toLowerCase();
}

interface ExploreViewProps {
  onImportNovel: (title: string, rawText: string) => void;
  getAuthHeaders: () => Record<string, string>;
  onSearchStore?: (keyword: string) => void;
}

const SITE_OPTIONS = [
  { id: "all", label: "All Sites", shortLabel: "All Sites" },
  { id: "aiqu226", label: "aiqu", shortLabel: "aiqu" },
  { id: "jjwxc", label: "jjwxc", shortLabel: "jjwxc" },
  { id: "52shuku", label: "52shuku", shortLabel: "52shuku" },
  { id: "fuxsb", label: "fuxsb", shortLabel: "fuxsb" },
  { id: "dmxs", label: "dmxs", shortLabel: "dmxs" },
];

const YEAR_OPTIONS = [
  { id: "all", label: "All Years" },
  { id: "2026", label: "2026" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2022", label: "2022" },
  { id: "older", label: "2021 & Older" },
];

const ORIENTATION_OPTIONS = [
  { id: "all", label: "All" },
  { id: "bl", label: "BL" },
  { id: "het", label: "Het" },
  { id: "no_cp", label: "No CP" },
];

const POPULAR_TROPES = [
  { id: "all", label: "All" },
  { id: "末世", label: "Apocalypse (末世)" },
  { id: "天灾", label: "Natural Disaster (天灾)" },
  { id: "囤货", label: "Hoarding (囤货)" },
  { id: "空间", label: "Portable Space (空间)" },
  { id: "种田", label: "Farming (种田)" },
  { id: "基建", label: "Infrastructure (基建)" },
  { id: "史前", label: "Prehistoric (史前/原始)" },
  { id: "部落", label: "Tribe (部落)" },
  { id: "宫斗", label: "Palace Fight (宫斗)" },
  { id: "快穿", label: "Quick Transmigration (快穿)" },
  { id: "无限流", label: "Infinite Flow (无限流)" },
  { id: "重生", label: "Rebirth (重生)" },
  { id: "修仙", label: "Cultivation (修仙)" },
  { id: "穿书", label: "Book Transmigration (穿书)" },
  { id: "星际", label: "Interstellar (星际)" },
  { id: "系统", label: "System (系统)" },
  { id: "女强", label: "Strong FL (女强)" },
  { id: "甜宠", label: "Sweet / Fluff (甜宠)" },
  { id: "爽文", label: "Power Fantasy (爽文)" },
  { id: "ABO", label: "ABO (Omegaverse)" },
  { id: "豪门", label: "Elite / Wealthy (豪门)" },
  { id: "万人迷", label: "All Love MC (万人迷)" },
  { id: "破镜重圆", label: "Reunited Love (破镜重圆)" },
];

const SORT_OPTIONS = [
  { id: "likes", label: "🔥 Most Popular / Likes", shortLabel: "Popular" },
  { id: "points", label: "⭐️ Highest Rating / Points", shortLabel: "Rating" },
  { id: "recent", label: "⏱️ Newest Release", shortLabel: "Recent" },
  { id: "chapters", label: "📚 Most Chapters / Words", shortLabel: "Chapters" },
];

// Normalized canonical tag mapping to eliminate duplicate bilingual tags on cards
const TAG_CANONICAL_MAP: Record<string, string> = {
  "随身空间": "空间",
  "portable space": "空间",
  "space": "空间",
  "灵泉空间": "空间",
  "囤物资": "囤货",
  "hoarding": "囤货",
  "hoard": "囤货",
  "囤粮": "囤货",
  "natural disaster": "天灾",
  "disaster": "天灾",
  "自然灾害": "天灾",
  "极寒": "天灾",
  "极热": "天灾",
  "apocalypse": "末世",
  "末日": "末世",
  "farming": "种田",
  "农场": "种田",
  "infrastructure": "基建",
  "建设": "基建",
  "原始": "史前",
  "兽世": "史前",
  "rebirth": "重生",
  "system": "系统",
  "infinite flow": "无限流",
  "cultivation": "修仙",
};

export function getAugmentedCardTags(item: ExploreNovelItem): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const addTag = (raw: string) => {
    if (!raw) return;
    const cleanRaw = raw.replace(/^[#＃\s]+/, "").trim();
    if (!cleanRaw) return;
    const lower = cleanRaw.toLowerCase();
    const canonical = TAG_CANONICAL_MAP[lower] || TAG_CANONICAL_MAP[cleanRaw] || cleanRaw;
    const cLower = canonical.toLowerCase();
    if (cLower === "dmxs" || cLower === "all" || cLower === "general" || cLower === "unknown") return;
    if (!seen.has(cLower)) {
      seen.add(cLower);
      result.push(canonical.replace(/^[#＃\s]+/, "").trim());
    }
  };

  if (item.tags) {
    for (const t of item.tags) {
      addTag(t);
    }
  }

  // Scan title and summary for prominent tropes
  const content = `${item.title} ${item.summary}`.toLowerCase();
  if (content.includes("空间") || content.includes("随身空间")) addTag("空间");
  if (content.includes("囤货") || content.includes("囤物资")) addTag("囤货");
  if (content.includes("天灾") || content.includes("极寒") || content.includes("极热")) addTag("天灾");
  if (content.includes("末世") || content.includes("丧尸")) addTag("末世");
  if (content.includes("种田") || content.includes("农家")) addTag("种田");
  if (content.includes("基建")) addTag("基建");

  // Keep neat, max 4 high-relevance tags
  return result.slice(0, 4);
}

function sortNovelItems(
  list: ExploreNovelItem[],
  sort: "points" | "likes" | "recent" | "chapters"
): ExploreNovelItem[] {
  const sorted = [...list];
  if (sort === "likes") {
    sorted.sort((a, b) => {
      const aVal = a.likes || 0;
      const bVal = b.likes || 0;
      if (bVal !== aVal) return bVal - aVal;
      const pDiff = (b.points || 0) - (a.points || 0);
      if (pDiff !== 0) return pDiff;
      if (a.rating !== undefined || b.rating !== undefined) {
        const aR = a.rating ?? 0;
        const bR = b.rating ?? 0;
        if (bR !== aR) return bR - aR;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      }
      return (b.year || 0) - (a.year || 0);
    });
  } else if (sort === "points") {
    sorted.sort((a, b) => {
      if ((a.points || 0) === 0 && (b.points || 0) === 0 && (a.rating !== undefined || b.rating !== undefined)) {
        const aR = a.rating ?? 0;
        const bR = b.rating ?? 0;
        if (bR !== aR) return bR - aR;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      }
      const aPoints = a.points || 0;
      const bPoints = b.points || 0;
      const pDiff = bPoints - aPoints;
      if (pDiff !== 0) return pDiff;
      const lDiff = (b.likes || 0) - (a.likes || 0);
      if (lDiff !== 0) return lDiff;
      if (a.rating !== undefined || b.rating !== undefined) {
        const aR = a.rating ?? 0;
        const bR = b.rating ?? 0;
        if (bR !== aR) return bR - aR;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      }
      return (b.year || 0) - (a.year || 0);
    });
  } else if (sort === "recent") {
    sorted.sort((a, b) => {
      if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
      return (b.dateStr || "").localeCompare(a.dateStr || "");
    });
  } else if (sort === "chapters") {
    sorted.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0) || (b.chapterCount || 0) - (a.chapterCount || 0));
  }
  return sorted;
}

// Module-level cache to preserve feed and scroll position when switching tabs or closing drawers
let cachedFeedState: {
  items: ExploreNovelItem[];
  page: number;
  filters: {
    site: string;
    year: string;
    orientation: string;
    tags: string[];
    query: string;
    sort: "points" | "likes" | "recent" | "chapters";
  };
  scrollY: number;
} | null = null;

// Multi-query in-memory LRU client cache for instantaneous filter switching
interface ClientExploreCacheEntry {
  items: ExploreNovelItem[];
  total: number;
  hasMore: boolean;
  timestamp: number;
}
const clientExploreCache = new Map<string, ClientExploreCacheEntry>();
const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache per combination

export const ExploreView: React.FC<ExploreViewProps> = ({
  onImportNovel,
  getAuthHeaders,
  onSearchStore,
}) => {
  // Initialize state from module cache if available
  const [selectedSite, setSelectedSite] = useState<string>(
    cachedFeedState?.filters.site || "all"
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    cachedFeedState?.filters.year || "all"
  );
  const [selectedOrientation, setSelectedOrientation] = useState<string>(
    cachedFeedState?.filters.orientation || "all"
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    cachedFeedState?.filters.tags || []
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    cachedFeedState?.filters.query || ""
  );
  const [sortBy, setSortBy] = useState<"points" | "likes" | "recent" | "chapters">(
    cachedFeedState?.filters.sort || "likes"
  );
  const [page, setPage] = useState<number>(cachedFeedState?.page || 1);

  // Data State
  const [items, setItems] = useState<ExploreNovelItem[]>(cachedFeedState?.items || []);
  const [hasSearched, setHasSearched] = useState<boolean>(!!cachedFeedState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AbortController ref to cancel obsolete queries immediately on fast tapping
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // View Mode: Cards vs Compact List
  const [viewMode, setViewMode] = useState<"cards" | "compact">(() => {
    try {
      return (localStorage.getItem("explore_view_mode") as any) || "cards";
    } catch {
      return "cards";
    }
  });

  const handleSetViewMode = (mode: "cards" | "compact") => {
    setViewMode(mode);
    try {
      localStorage.setItem("explore_view_mode", mode);
    } catch {}
  };

  // Reading List / Wishlist State
  const [wishlist, setWishlist] = useState<ExploreNovelItem[]>(() => {
    try {
      const saved = localStorage.getItem("megatext_explore_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);

  const isWishlisted = (novel: ExploreNovelItem) => {
    return wishlist.some((w) => w.id === novel.id || (w.title === novel.title && w.author === novel.author));
  };

  const toggleWishlist = (novel: ExploreNovelItem) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.id === novel.id || (w.title === novel.title && w.author === novel.author));
      const next = exists
        ? prev.filter((w) => !(w.id === novel.id || (w.title === novel.title && w.author === novel.author)))
        : [novel, ...prev];
      try {
        localStorage.setItem("megatext_explore_wishlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // UI State
  const [expandedSummaryIds, setExpandedSummaryIds] = useState<Record<string, boolean>>({});
  const [showTropesDrawer, setShowTropesDrawer] = useState<boolean>(false);

  // Chapter Preview & Import Modal State
  const [previewNovel, setPreviewNovel] = useState<StoreNovelDetail | null>(null);
  const [previewMirrors, setPreviewMirrors] = useState<ReadableMirror[]>([]);
  const [isLoadingToc, setIsLoadingToc] = useState<boolean>(false);
  const [startChapter, setStartChapter] = useState<number>(1);
  const [endChapter, setEndChapter] = useState<number>(100);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<string>("");
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeImportItemId, setActiveImportItemId] = useState<string | null>(null);
  const [activeLoadingTocItemId, setActiveLoadingTocItemId] = useState<string | null>(null);

  // Slide-Over Chapter 1 Quick Peek State
  interface PeekState {
    isOpen: boolean;
    isLoading: boolean;
    item: ExploreNovelItem | null;
    chapterTitle: string;
    chapterIndex: number;
    totalChapters: number;
    content: string;
    allChapters?: ChapterItem[];
    error?: string | null;
  }
  const [peekState, setPeekState] = useState<PeekState>({
    isOpen: false,
    isLoading: false,
    item: null,
    chapterTitle: "",
    chapterIndex: 1,
    totalChapters: 0,
    content: "",
  });

  // Save feed cache on unmount or update
  useEffect(() => {
    cachedFeedState = {
      items,
      page,
      filters: {
        site: selectedSite,
        year: selectedYear,
        orientation: selectedOrientation,
        tags: selectedTags,
        query: searchQuery,
        sort: sortBy,
      },
      scrollY: window.scrollY,
    };
  }, [items, page, selectedSite, selectedYear, selectedOrientation, selectedTags, searchQuery, sortBy]);

  // Restore scroll position when returning to explore tab
  useEffect(() => {
    if (cachedFeedState && cachedFeedState.scrollY > 0) {
      window.scrollTo({ top: cachedFeedState.scrollY, behavior: "instant" });
    }
  }, []);

  // Filtered/Computed novel list (or wishlist)
  const displayItems = useMemo(() => {
    const source = showWishlistOnly ? wishlist : items;
    return sortNovelItems(source, sortBy);
  }, [items, wishlist, showWishlistOnly, sortBy]);

  // Toggle category in multi-select mode
  const toggleTag = (tagId: string) => {
    if (tagId === "all") {
      setSelectedTags([]);
      return;
    }
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((t) => t !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Background prefetching ref to avoid duplicate prefetch calls
  const prefetchedPages = useRef<Set<number>>(new Set());

  // Fetch explore collection with instant client cache & AbortController
  const fetchExploreFeed = async (
    pageIdx = 1,
    append = false,
    overrideFilters?: {
      site?: string;
      year?: string;
      orientation?: string;
      tags?: string[];
      query?: string;
      sort?: "points" | "likes" | "recent" | "chapters";
    }
  ) => {
    setHasSearched(true);
    const site = overrideFilters?.site ?? selectedSite;
    const year = overrideFilters?.year ?? selectedYear;
    const orientation = overrideFilters?.orientation ?? selectedOrientation;
    const tags = overrideFilters?.tags ?? selectedTags;
    const query = overrideFilters?.query ?? searchQuery;
    const sort = overrideFilters?.sort ?? sortBy;

    const cacheKey = `c:${site}:${year}:${orientation}:${tags.slice().sort().join(",")}:${query.trim().toLowerCase()}:${sort}:${pageIdx}`;
    const cached = clientExploreCache.get(cacheKey);
    const now = Date.now();

    // 1. Instant cache hit
    if (!append && cached && now - cached.timestamp < CLIENT_CACHE_TTL_MS) {
      setItems(sortNovelItems(cached.items, sort));
      setTotalAvailable(cached.total);
      setHasMore(cached.hasMore);
      setPage(pageIdx);
      setIsLoading(false);
      setIsLoadingMore(false);
      setErrorMessage(null);
      return;
    }

    // 2. Abort any previous pending request to prevent network freezing
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      prefetchedPages.current.clear();
      // Keep existing items if available so UI doesn't violently flicker, while setting isLoading indicator
    }
    setErrorMessage(null);

    // 22-second client safety timeout for deep multi-page crawling
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 22000);

    try {
      const params = new URLSearchParams({
        site,
        year,
        orientation,
        tag: tags.length > 0 ? tags.join(",") : "all",
        tags: tags.join(","),
        q: query,
        sort,
        page: String(pageIdx),
      });

      const res = await fetch(`/api/store/explore?${params.toString()}`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.warn("Explore non-JSON response:", res.status, text.slice(0, 100));
        throw new Error(
          res.status === 502 || res.status === 503 || res.status === 504
            ? "Server is busy. Tap Search to retry."
            : `Server returned HTTP ${res.status}. Tap Search to retry.`
        );
      }

      if (!res.ok) {
        let errMsg = `Failed to load feed (HTTP ${res.status})`;
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      const newItems: ExploreNovelItem[] = data.items || [];
      const totalCount = data.total ?? newItems.length;
      const moreAvailable = data.hasMore ?? (newItems.length === 50);

      setTotalAvailable(totalCount);
      setHasMore(moreAvailable);

      if (append) {
        setItems((prev) => {
          const seen = new Set(prev.map((i) => `${i.title}_${i.author}`));
          const filtered = newItems.filter((i) => !seen.has(`${i.title}_${i.author}`));
          const combined = [...prev, ...filtered];
          return sortNovelItems(combined, sort);
        });
      } else {
        setItems(sortNovelItems(newItems, sort));
      }
      setPage(pageIdx);

      // Save to client cache
      clientExploreCache.set(cacheKey, {
        items: newItems,
        total: totalCount,
        hasMore: moreAvailable,
        timestamp: now,
      });

      // Save to module state
      if (!append && newItems.length > 0) {
        cachedFeedState = {
          items: newItems,
          filters: { site, year, orientation, tags, query, sort },
          page: pageIdx,
          scrollY: typeof window !== "undefined" ? window.scrollY : 0,
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        // Request was aborted by user filter switch or timeout
        return;
      }
      console.error("Explore feed fetch error:", err);
      let msg = err?.message || "Failed to load novels. Please check your connection.";
      if (msg.includes("<!doctype") || msg.includes("is not valid JSON") || msg.includes("Unexpected token")) {
        msg = "Could not load novels at this moment. Please tap Search to retry.";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Auto-load 2026 explore feed on initial mount if empty
  useEffect(() => {
    if (!cachedFeedState && items.length === 0 && !hasSearched) {
      fetchExploreFeed(1, false);
    }
  }, []);

  // Restore scroll position or state if returning to Explore tab
  useEffect(() => {
    if (cachedFeedState && cachedFeedState.items.length > 0) {
      setHasSearched(true);
    }
  }, []);

  // Load More Handler
  const handleLoadMore = () => {
    if (isLoadingMore || isLoading || !hasMore) return;
    fetchExploreFeed(page + 1, true);
  };

  // Handle manual keyword search execution
  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExploreFeed(1, false);
  };

  const toggleSummary = (id: string) => {
    setExpandedSummaryIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Chapter Selection Modal for a novel (with auto cross-mirror resolution)
  const handleOpenPreview = async (item: ExploreNovelItem) => {
    setActiveLoadingTocItemId(item.id);
    setIsLoadingToc(true);
    setPreviewNovel(null);
    setPreviewMirrors([]);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/store/fetch-toc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: item.novelUrl,
          siteId: item.siteId,
          title: item.title,
          author: item.author,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to load Table of Contents (HTTP ${res.status})`);
      }

      const data = await res.json();
      setPreviewNovel(data);
      if (data.allMirrors) {
        setPreviewMirrors(data.allMirrors);
      }
      setStartChapter(1);
      // User requirement: ALWAYS import all / download all by default!
      setEndChapter(data.chapters?.length || 100);
    } catch (err: any) {
      console.error("Failed to load novel TOC:", err);
      setErrorMessage(err.message || "Could not read chapter directory.");
    } finally {
      setIsLoadingToc(false);
      setActiveLoadingTocItemId(null);
    }
  };

  // Switch to a specific readable mirror inside the modal
  const handleSelectMirror = async (mirror: ReadableMirror) => {
    setIsLoadingToc(true);
    try {
      const res = await fetch("/api/store/fetch-toc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: mirror.novelUrl,
          siteId: mirror.siteId,
          title: mirror.title,
          author: mirror.author,
        }),
      });

      if (!res.ok) throw new Error("Failed to load mirror chapters.");
      const data: StoreNovelDetail = await res.json();
      setPreviewNovel(data);
      setStartChapter(1);
      // Always select ALL chapters by default
      setEndChapter(data.chapters.length || 100);
    } catch (err: any) {
      console.error("Failed to switch mirror:", err);
      setErrorMessage("Could not load chapters from selected mirror.");
    } finally {
      setIsLoadingToc(false);
    }
  };

  // Quick Chapter 1 Peek Drawer
  const handleOpenPeek = async (item: ExploreNovelItem) => {
    setPeekState({
      isOpen: true,
      isLoading: true,
      item,
      chapterTitle: "Chapter 1",
      chapterIndex: 1,
      totalChapters: item.chapterCount || 0,
      content: "",
      error: null,
    });

    try {
      const res = await fetch("/api/store/peek-chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: item.novelUrl,
          siteId: item.siteId,
          title: item.title,
          author: item.author,
          intro: item.summary,
          fileSize: item.fileSize,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to load chapter preview.");
      }

      const data = await res.json();
      setPeekState((prev) => ({
        ...prev,
        isLoading: false,
        chapterTitle: data.chapterTitle || "Chapter 1",
        chapterIndex: data.chapterIndex || 1,
        totalChapters: data.totalChapters || prev.totalChapters,
        content: data.content || "No chapter content found.",
        allChapters: data.allChapters,
      }));
    } catch (err: any) {
      setPeekState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to preview chapter.",
      }));
    }
  };

  // Navigate to Next / Previous / Specific Chapter in Peek Drawer
  const handlePeekNavigateChapter = async (targetIndex: number) => {
    if (!peekState.allChapters || peekState.allChapters.length === 0) return;
    if (targetIndex < 1 || targetIndex > peekState.allChapters.length) return;

    const targetChapter = peekState.allChapters[targetIndex - 1];
    setPeekState((prev) => ({
      ...prev,
      isLoading: true,
      chapterIndex: targetIndex,
      chapterTitle: targetChapter.title || `Chapter ${targetIndex}`,
      error: null,
    }));

    try {
      const res = await fetch("/api/store/fetch-chapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          chapterUrl: targetChapter.url,
          chapterTitle: targetChapter.title,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to load chapter.");
      }

      const data = await res.json();
      setPeekState((prev) => ({
        ...prev,
        isLoading: false,
        chapterTitle: data.chapterTitle || targetChapter.title || `Chapter ${targetIndex}`,
        content: data.content || "No chapter content found.",
      }));

      // Scroll reader container to top
      const scrollContainer = document.getElementById("peek-reader-body");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setPeekState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to load chapter text.",
      }));
    }
  };

  // Clean split paragraphs for the reader to ensure proper paragraph spacing
  const peekParagraphs = useMemo(() => {
    if (!peekState.content) return [];
    return peekState.content
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [peekState.content]);

  // Direct 1-Click Import (Always imports ALL chapters as requested by user)
  const handleDirectImport = async (item: ExploreNovelItem) => {
    setActiveImportItemId(item.id);
    setIsImporting(true);
    setImportProgress(`Fetching complete chapter directory for "${item.title}"...`);
    setErrorMessage(null);

    try {
      const tocRes = await fetch("/api/store/fetch-toc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: item.novelUrl,
          siteId: item.siteId,
          title: item.title,
          author: item.author,
        }),
      });

      if (!tocRes.ok) {
        throw new Error("Could not fetch novel chapters.");
      }

      const detail = await tocRes.json();
      if (!detail.chapters || detail.chapters.length === 0) {
        setPreviewNovel(detail);
        if (detail.allMirrors) setPreviewMirrors(detail.allMirrors);
        setErrorMessage("Direct chapters require selecting a readable mirror below.");
        return;
      }

      const totalChapters = detail.chapters.length;
      setImportProgress(`Downloading all ${totalChapters} chapters of "${item.title}"...`);

      const importRes = await fetch("/api/store/import-novel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: detail.novelUrl || item.novelUrl,
          siteId: detail.siteId || item.siteId,
          title: item.title,
          startChapter: 1,
          endChapter: totalChapters,
          importAll: true,
          chapters: detail.chapters,
        }),
      });

      if (!importRes.ok) {
        const errJson = await importRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to download chapter text.");
      }

      const result = await importRes.json();
      onImportNovel(item.title, result.rawText);
    } catch (err: any) {
      console.error("Direct import error:", err);
      setErrorMessage(err.message || "Failed to import novel.");
    } finally {
      setIsImporting(false);
      setActiveImportItemId(null);
      setImportProgress("");
    }
  };

  // Confirm Import from Modal or Peek Drawer (Always imports all available chapters)
  const handleConfirmImportAll = async (targetNovel: StoreNovelDetail | { title: string; novelUrl: string; siteId: string; chapters: ChapterItem[] }) => {
    if (!targetNovel || !targetNovel.chapters || targetNovel.chapters.length === 0) return;
    setIsImporting(true);
    setImportProgress(
      `Downloading all ${targetNovel.chapters.length} chapters of "${targetNovel.title}"...`
    );

    try {
      const importRes = await fetch("/api/store/import-novel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          novelUrl: targetNovel.novelUrl,
          siteId: targetNovel.siteId,
          title: targetNovel.title,
          startChapter: 1,
          endChapter: targetNovel.chapters.length,
          importAll: true,
          chapters: targetNovel.chapters,
        }),
      });

      if (!importRes.ok) {
        const errJson = await importRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to download chapters.");
      }

      const result = await importRes.json();
      setPreviewNovel(null);
      setPeekState((prev) => ({ ...prev, isOpen: false }));
      onImportNovel(targetNovel.title, result.rawText);
    } catch (err: any) {
      console.error("Import all error:", err);
      setErrorMessage(err.message || "Import failed.");
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  // Helper to format points (unshortened with exact commas per requirement)
  const formatDisplayPoints = (pts: number) => {
    if (!pts || pts <= 0) return "0 pts";
    return `${pts.toLocaleString()} pts`;
  };

  // Helper to format likes
  const formatDisplayLikes = (likes?: number) => {
    if (!likes || likes <= 0) return "";
    if (likes >= 1000000) return `${(likes / 1000000).toFixed(2)}M likes`;
    if (likes >= 1000) return `${(likes / 1000).toFixed(1)}k likes`;
    return `${likes.toLocaleString()} likes`;
  };

  // Helper to format word count
  const formatDisplayWordCount = (item: ExploreNovelItem) => {
    if (item.wordCount && item.wordCount > 0) {
      if (item.wordCount >= 1000000) {
        return `${(item.wordCount / 1000000).toFixed(1)}M words`;
      }
      if (item.wordCount >= 1000) {
        return `${Math.round(item.wordCount / 1000)}k words`;
      }
      return `${item.wordCount.toLocaleString()} words`;
    }
    if (item.chapterCount && item.chapterCount > 0) {
      return `${item.chapterCount} Chapters`;
    }
    return null;
  };

  // Helper to highlight matching query text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query || !query.trim() || !text) return text;
    const q = query.trim();
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-200 dark:bg-amber-800/80 text-amber-950 dark:text-amber-100 font-bold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSite("all");
    setSelectedYear("all");
    setSelectedOrientation("all");
    setSelectedTags([]);
    setSearchQuery("");
    setSortBy("likes");
    setShowWishlistOnly(false);
    setItems([]);
    setHasSearched(false);
    setIsLoading(false);
    cachedFeedState = null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Streamlined Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Novel Explorer</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Live & Cached
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse authentic rankings, high-score archives, and import full novels in 1-click.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Reading List Quick Badge */}
        <div className="flex items-center gap-2">
          {/* Wishlist / Reading List Filter Button */}
          <button
            type="button"
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              showWishlistOnly
                ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${showWishlistOnly ? "fill-white" : "text-rose-500"}`} />
            <span>Reading List</span>
            {wishlist.length > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showWishlistOnly ? "bg-white text-rose-600" : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                }`}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          {/* View Mode Toggle (Grid vs Compact) */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => handleSetViewMode("cards")}
              title="Detailed Card View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode("compact")}
              title="Dense List View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "compact"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={handleResetFilters}
            type="button"
            title="Reset Filters"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Streamlined Collapsible Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3.5 sm:p-4 shadow-xs mb-4 space-y-3">
        {/* Row 1: Keyword Search Bar */}
        <form onSubmit={handleKeywordSearch} className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keyword in Title OR Summary (e.g. 末世, 随身空间, 囤货, 丧尸)..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 pl-10 pr-24 py-2 text-sm font-medium focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
              }}
              className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 px-3.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{isLoading ? "..." : "Search"}</span>
          </button>
        </form>

        {/* Row 2: Source Library Pills & Year Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Source:</span>
            {SITE_OPTIONS.map((st) => {
              const active = selectedSite === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedSite(st.id);
                    if (st.id === "aiqu226" || st.id === "52shuku" || st.id === "fuxsb") {
                      if (sortBy === "points") {
                        setSortBy("likes");
                      }
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {st.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Year:</span>
            {YEAR_OPTIONS.map((yr) => {
              const active = selectedYear === yr.id;
              return (
                <button
                  key={yr.id}
                  type="button"
                  onClick={() => {
                    setSelectedYear(yr.id);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {yr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Pairing Filter, Expandable Tropes Toggle, Sort Selector, and Search Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Pairing:</span>
            {ORIENTATION_OPTIONS.map((ori) => {
              const active = selectedOrientation === ori.id;
              return (
                <button
                  key={ori.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrientation(ori.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {ori.label}
                </button>
              );
            })}

            {/* Expandable Tropes Button */}
            <button
              type="button"
              onClick={() => setShowTropesDrawer(!showTropesDrawer)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                showTropesDrawer || selectedTags.length > 0
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              }`}
            >
              <Tag className="h-3 w-3" />
              <span>Tropes {selectedTags.length > 0 ? `(${selectedTags.length})` : ""}</span>
              {showTropesDrawer ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => {
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setItems((prev) => sortNovelItems(prev, opt.id as any));
                    }}
                    className={`px-2 py-0.8 rounded-md text-xs font-semibold transition cursor-pointer ${
                      active
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collapsible Tropes Panel */}
        {showTropesDrawer && (
          <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Genre & Tropes (Multi-Select Enabled):
              </span>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTags([]);
                  }}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                >
                  Clear All ({selectedTags.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TROPES.map((t) => {
                const isAll = t.id === "all";
                const active = isAll ? selectedTags.length === 0 : selectedTags.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      let nextTags: string[] = [];
                      if (t.id === "all") {
                        nextTags = [];
                      } else if (selectedTags.includes(t.id)) {
                        nextTags = selectedTags.filter((x) => x !== t.id);
                      } else {
                        nextTags = [...selectedTags, t.id];
                      }
                      setSelectedTags(nextTags);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      active
                        ? isAll
                          ? "bg-purple-600 text-white"
                          : "bg-amber-500 text-white ring-2 ring-amber-400/50 font-bold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {active && !isAll && <Check className="h-3 w-3" />}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>{errorMessage}</span>
            <button
              onClick={() => fetchExploreFeed(1, false)}
              className="underline font-bold hover:text-rose-900 dark:hover:text-rose-100 cursor-pointer ml-1"
            >
              Retry Search
            </button>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:text-rose-900 dark:hover:text-rose-100 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search results & feed container - Only shown after search or when viewing reading list */}
      {(hasSearched || showWishlistOnly) && (
        <>
          {/* Pulsing Skeleton Cards for Instant Smooth Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-14 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Results Count Banner */}
          {!isLoading && displayItems.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                <span>Found <strong className="text-purple-600 dark:text-purple-400 font-bold">{displayItems.length}</strong> books</span>
              </div>
              {page > 1 && <span className="text-[11px] opacity-75">Page {page}</span>}
            </div>
          )}

          {/* Empty Feed State */}
          {!isLoading && displayItems.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {showWishlistOnly ? "Your Reading List is empty" : "No novels found matching filters"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {showWishlistOnly
                  ? "Click the bookmark icon on any novel while browsing to save it to your queue."
                  : "Try choosing 'All Years' or 'All' in Tropes, or clear your keyword search."}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Novels Display: Card View or Compact Dense List */}
      {(hasSearched || showWishlistOnly) && !isLoading && displayItems.length > 0 && (
        <div className="space-y-3">
          {viewMode === "compact" ? (
            /* COMPACT DENSE LIST VIEW */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
              {displayItems.map((item, index) => {
                const isJjwxc = item.siteId === "jjwxc";
                const bookmarked = isWishlisted(item);

                return (
                  <div
                    key={item.id || index}
                    className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-50/40 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="shrink-0 inline-flex h-5 w-6 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/60 text-[10px] font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                        #{index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {renderHighlightedText(item.title, searchQuery)}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            / {renderHighlightedText(item.author, searchQuery)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {formatCleanSiteName(item.siteId, item.siteName)}
                          </span>
                          <span>•</span>
                          <span>{item.orientationLabel}</span>
                          <span>•</span>
                          <span>{item.year}</span>
                          {item.fileSize && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                💾 {item.fileSize}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compact Metrics & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        {item.rating !== undefined && item.rating > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200/60 dark:border-amber-900/40">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>{item.rating.toFixed(1)} ★</span>
                          </span>
                        )}
                        {item.points !== undefined && item.points > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200/60 dark:border-amber-900/40">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>{formatDisplayPoints(item.points)}</span>
                          </span>
                        )}
                        {item.likes !== undefined && item.likes > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 text-[11px] font-bold border border-pink-200/60 dark:border-pink-900/40">
                            <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                            <span>{formatDisplayLikes(item.likes)}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Bookmark / Wishlist button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item)}
                          title={bookmarked ? "Remove from Reading List" : "Save to Reading List"}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            bookmarked
                              ? "border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:border-rose-800"
                              : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500"
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        {/* Quick Peek Chapter 1 */}
                        <button
                          type="button"
                          onClick={() => handleOpenPeek(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-slate-800 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Peek Ch 1</span>
                        </button>

                        {/* Download / Import ALL */}
                        <button
                          type="button"
                          onClick={() => handleDirectImport(item)}
                          disabled={isImporting && activeImportItemId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          {isImporting && activeImportItemId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          <span>Import All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DETAILED CARD VIEW */
            displayItems.map((item, index) => {
              const isExpanded = !!expandedSummaryIds[item.id];
              const displaySummary = item.summary || "No synopsis available for this novel.";
              const isLongSummary = displaySummary.length > 50 || displaySummary.includes("\n");
              const isJjwxc = item.siteId === "jjwxc";
              const bookmarked = isWishlisted(item);
              const cardTags = getAugmentedCardTags(item);

              return (
                <div
                  key={item.id || index}
                  className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600/60 transition-all duration-200"
                >
                  {/* Top Row: Rank, Badges, Metrics & Bookmark Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="inline-flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                        #{index + 1}
                      </span>

                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          isJjwxc
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                        }`}
                      >
                        {formatCleanSiteName(item.siteId, item.siteName)}
                      </span>

                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                          item.orientation === "bl"
                            ? "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900/40"
                            : item.orientation === "het"
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40"
                        }`}
                      >
                        {item.orientationLabel}
                      </span>

                      {item.status && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                            item.status.includes("完结")
                              ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {item.status === "完结" ? "✅ 完结" : item.status}
                        </span>
                      )}

                      {formatDisplayWordCount(item) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          📝 {formatDisplayWordCount(item)}
                        </span>
                      )}

                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40">
                        📅 {item.year}
                      </span>
                    </div>

                    {/* Right side: Score & Bookmark */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.rating !== undefined && item.rating > 0 && (
                        <span
                          title={`Rating: ${item.rating.toFixed(1)} / 5.0 (${item.ratingCount || 1} votes)`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/70 dark:border-amber-900/40"
                        >
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          <span>{item.rating.toFixed(1)} ★</span>
                          {item.ratingCount ? <span className="text-[9px] opacity-75">({item.ratingCount})</span> : null}
                        </span>
                      )}

                      {item.points !== undefined && item.points > 0 && (
                        <span
                          title={`Official JJWXC Points: ${item.points.toLocaleString()}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/70 dark:border-amber-900/40"
                        >
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          <span>{formatDisplayPoints(item.points)}</span>
                        </span>
                      )}

                      {item.likes !== undefined && item.likes > 0 && (
                        <span
                          title={`Likes / Bookmarks: ${item.likes.toLocaleString()}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 text-[10px] font-bold border border-pink-200/70 dark:border-pink-900/40"
                        >
                          <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                          <span>{formatDisplayLikes(item.likes)}</span>
                        </span>
                      )}

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        title={bookmarked ? "Remove from Reading List" : "Save to Reading List"}
                        className={`p-1 rounded-md transition cursor-pointer ${
                          bookmarked
                            ? "text-rose-500 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100"
                            : "text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-rose-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div className="mb-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {renderHighlightedText(item.title, searchQuery)}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Author:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {renderHighlightedText(item.author, searchQuery)}
                      </span>
                    </p>
                  </div>

                  {/* Clean Normalized Tags (Capped at 4, no duplicates) */}
                  {cardTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {cardTags.map((t, ti) => (
                        <span
                          key={ti}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-purple-50/70 dark:bg-slate-800/80 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-900/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Synopsis Box */}
                  <div className="rounded-lg bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 mb-2.5 text-[11px] sm:text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between font-bold text-[10px] sm:text-[11px] text-purple-700 dark:text-purple-300 mb-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Synopsis / 简介:</span>
                      </div>

                      {isLongSummary && (
                        <button
                          type="button"
                          onClick={() => toggleSummary(item.id)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <span>Show Less</span>
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <span>Read More</span>
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="whitespace-pre-line text-slate-600 dark:text-slate-300">
                      {isExpanded || !isLongSummary
                        ? renderHighlightedText(displaySummary, searchQuery)
                        : renderHighlightedText(
                            displaySummary.slice(0, 85) + (displaySummary.length > 85 ? "..." : ""),
                            searchQuery
                          )}
                    </div>
                  </div>

                  {/* File Size Information */}
                  {item.fileSize && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2.5 px-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">TXT File Size:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/70 dark:border-emerald-800/50">
                        💾 {item.fileSize}
                      </span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={item.novelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 transition"
                      >
                        <span>Original Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      {onSearchStore && (
                        <button
                          type="button"
                          onClick={() => onSearchStore(item.title)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer"
                        >
                          <Search className="h-3 w-3" />
                          <span>Search 11 Stores</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Peek Ch 1 Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPeek(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-slate-800 text-[11px] sm:text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition cursor-pointer"
                      >
                        <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>Peek Ch 1</span>
                      </button>

                      {/* Select Mirrors / TOC */}
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(item)}
                        disabled={(isLoadingToc && activeLoadingTocItemId === item.id) || (isImporting && activeImportItemId === item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        {isLoadingToc && activeLoadingTocItemId === item.id ? (
                          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-purple-600" />
                        ) : (
                          <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                        <span>{isJjwxc ? "Mirrors" : "Chapters"}</span>
                      </button>

                      {/* 1-Click Import ALL */}
                      <button
                        type="button"
                        onClick={() => handleDirectImport(item)}
                        disabled={isImporting && activeImportItemId === item.id}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        {isImporting && activeImportItemId === item.id ? (
                          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                        <span>Import All</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Button */}
          {!showWishlistOnly && (
            <div className="text-center pt-4 pb-8 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-400">
                Showing <strong className="text-purple-600 dark:text-purple-400">{displayItems.length}</strong> of{" "}
                <strong className="text-purple-600 dark:text-purple-400">{totalAvailable || displayItems.length}</strong> novels
              </p>
              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading Next 50 Novels...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="h-4 w-4" />
                      <span>Load Next 50 Novels</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide-Over Drawer: Quick Chapter Peek & Reader */}
      {peekState.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-purple-200 dark:border-purple-900/50 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-purple-50/50 dark:bg-purple-950/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md">
                    Quick Peek • Ch {peekState.chapterIndex} of {peekState.totalChapters || peekState.allChapters?.length || 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {peekState.item?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Author: <span className="font-semibold text-slate-700 dark:text-slate-300">{peekState.item?.author}</span>
                  {peekState.totalChapters > 0 && ` • ${peekState.totalChapters} Chapters`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Header Chapter Nav Arrows */}
                <button
                  type="button"
                  onClick={() => handlePeekNavigateChapter(peekState.chapterIndex - 1)}
                  disabled={peekState.isLoading || peekState.chapterIndex <= 1}
                  title="Previous Chapter"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePeekNavigateChapter(peekState.chapterIndex + 1)}
                  disabled={
                    peekState.isLoading ||
                    (Boolean(peekState.allChapters) && peekState.chapterIndex >= (peekState.allChapters?.length || 1))
                  }
                  title="Next Chapter"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPeekState((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Reader Body with distinct paragraph spacing */}
            <div
              id="peek-reader-body"
              className="flex-1 p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-serif"
            >
              {peekState.isLoading ? (
                <div className="py-28 text-center text-slate-400 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
                  <p className="text-xs font-sans">
                    Loading {peekState.chapterTitle || `Chapter ${peekState.chapterIndex}`} text from source archive...
                  </p>
                </div>
              ) : peekState.error ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-sans space-y-2">
                  <p><strong>Notice:</strong> {peekState.error}</p>
                  <button
                    type="button"
                    onClick={() => handlePeekNavigateChapter(peekState.chapterIndex)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-sans cursor-pointer"
                  >
                    Retry Loading Chapter
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800 font-sans">
                    <h4 className="text-base font-bold text-purple-700 dark:text-purple-300">
                      {peekState.chapterTitle}
                    </h4>
                  </div>
                  <div className="space-y-4 font-serif text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">
                    {peekParagraphs.map((para, idx) => (
                      <p
                        key={idx}
                        className="leading-relaxed mb-3.5 tracking-normal text-slate-800 dark:text-slate-200 font-serif text-[15px]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer with Next Chapter & One-Click Import ALL */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePeekNavigateChapter(peekState.chapterIndex - 1)}
                  disabled={peekState.isLoading || peekState.chapterIndex <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev Ch</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePeekNavigateChapter(peekState.chapterIndex + 1)}
                  disabled={
                    peekState.isLoading ||
                    (Boolean(peekState.allChapters) && peekState.chapterIndex >= (peekState.allChapters?.length || 1))
                  }
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Next Chapter (Ch {peekState.chapterIndex + 1})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPeekState((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>

                {peekState.item && (
                  <button
                    type="button"
                    onClick={() => handleDirectImport(peekState.item!)}
                    disabled={isImporting}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    <span>Import All ({peekState.totalChapters || "Complete"})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Selection & Mirror Modal (Always defaults to Import ALL) */}
      {previewNovel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-purple-200 dark:border-purple-900/60 flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {previewNovel.siteName || "Novel Details"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {previewNovel.title}
                </h3>
                <p className="text-xs text-slate-500">Author: {previewNovel.author}</p>
              </div>
              <button
                onClick={() => setPreviewNovel(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto pr-1">
              {/* Mirrors Section */}
              {previewMirrors && previewMirrors.length > 0 && (
                <div className="rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Readable Mirrors Across 11 Store Libraries:</span>
                    </span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                      {previewMirrors.length} sources
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {previewMirrors.map((m, mi) => (
                      <div
                        key={mi}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{m.siteName}</span>
                          <span className="text-[11px] text-slate-400 ml-2">{m.latestChapter || m.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectMirror(m)}
                          className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition cursor-pointer"
                        >
                          Use Source
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters Overview */}
              {previewNovel.chapters && previewNovel.chapters.length > 0 ? (
                <>
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-800 dark:text-purple-300 block">
                        Full Novel Ready for Import
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Total {previewNovel.chapters.length} chapters found
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmImportAll(previewNovel)}
                      disabled={isImporting}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Import All
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">
                      Chapter Directory Preview (First 5):
                    </label>
                    <div className="space-y-1 max-h-36 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-600 dark:text-slate-300">
                      {previewNovel.chapters.slice(0, 5).map((ch) => (
                        <div key={ch.index} className="flex items-center justify-between">
                          <span className="font-medium truncate">{ch.title}</span>
                          <span className="text-[10px] text-slate-400">#{ch.index}</span>
                        </div>
                      ))}
                      {previewNovel.chapters.length > 5 && (
                        <p className="text-[11px] text-slate-400 italic text-center pt-1">
                          ...and {previewNovel.chapters.length - 5} more chapters
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold">Direct VIP chapter list is locked on commercial host.</p>
                  <p className="text-slate-400 mt-1">
                    Select one of the readable mirror libraries above or search in 11 stores.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setPreviewNovel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              {previewNovel.chapters && previewNovel.chapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleConfirmImportAll(previewNovel)}
                  disabled={isImporting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>Import All ({previewNovel.chapters.length} Chapters)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Scraping / Import Status Overlay */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl text-center border border-purple-200 dark:border-purple-800">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Importing Web Novel</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {importProgress || "Scraping chapter texts from source library..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
