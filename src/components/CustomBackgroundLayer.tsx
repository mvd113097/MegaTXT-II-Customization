import React, { useState, useEffect } from "react";

export const CustomBackgroundLayer: React.FC = () => {
  const [bgUrl, setBgUrl] = useState<string>(() => {
    try {
      return localStorage.getItem("megatext_custom_bg") || "";
    } catch {
      return "";
    }
  });

  const [blur, setBlur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("megatext_bg_blur");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [opacity, setOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("megatext_bg_opacity");
      return saved ? parseInt(saved, 10) : 80;
    } catch {
      return 80;
    }
  });

  useEffect(() => {
    const syncRootAttribute = (url: string) => {
      const root = document.documentElement;
      if (url) {
        root.dataset.hasCustomBg = "true";
      } else {
        delete root.dataset.hasCustomBg;
      }
    };

    syncRootAttribute(bgUrl);

    const handleUpdate = () => {
      try {
        const currentUrl = localStorage.getItem("megatext_custom_bg") || "";
        setBgUrl(currentUrl);
        syncRootAttribute(currentUrl);

        const savedBlur = localStorage.getItem("megatext_bg_blur");
        setBlur(savedBlur ? parseInt(savedBlur, 10) : 0);
        const savedOpacity = localStorage.getItem("megatext_bg_opacity");
        setOpacity(savedOpacity ? parseInt(savedOpacity, 10) : 80);
      } catch (e) {
        console.warn(e);
      }
    };

    window.addEventListener("megatext_bg_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("megatext_bg_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [bgUrl]);

  if (!bgUrl) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-all duration-300"
      aria-hidden="true"
    >
      <img
        src={bgUrl}
        alt=""
        className="w-full h-full object-cover object-center"
        style={{
          filter: blur > 0 ? `blur(${blur}px)` : "none",
          opacity: opacity / 100,
        }}
      />
      {/* Gentle frosted tint gradient for text contrast while preserving image clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 dark:from-black/20 dark:via-transparent dark:to-black/40" />
    </div>
  );
};

