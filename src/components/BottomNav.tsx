import React from "react";
import { Home, Clock, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "history" | "settings";
  onChangeTab: (tab: "home" | "history" | "settings") => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      className="fixed left-1/2 bottom-2 z-40 app-responsive-container w-[calc(100%-20px)] max-w-md -translate-x-1/2 rounded-3xl pb-safe transition-all duration-200 glass-panel-card"
      aria-label="Mobile Navigation"
    >
      <div className="mx-auto flex h-14 w-full items-center justify-around px-3">
        {/* Home Tab */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onChangeTab("home")}
          className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-2xl transition cursor-pointer ${
            activeTab === "home"
              ? "text-purple-700 dark:text-purple-300 font-black bg-white/80 dark:bg-purple-950/60 shadow-xs"
              : "text-slate-800 dark:text-purple-200/90 hover:text-purple-700 dark:hover:text-purple-100 font-bold"
          }`}
        >
          <Home className="h-5 w-5 stroke-[2.4]" />
          <span className="text-[11px] leading-none">Home</span>
          {activeTab === "home" && (
            <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          )}
        </button>

        {/* History Tab */}
        <button
          id="nav-tab-history"
          type="button"
          onClick={() => onChangeTab("history")}
          className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-2xl transition cursor-pointer ${
            activeTab === "history"
              ? "text-purple-700 dark:text-purple-300 font-black bg-white/80 dark:bg-purple-950/60 shadow-xs"
              : "text-slate-800 dark:text-purple-200/90 hover:text-purple-700 dark:hover:text-purple-100 font-bold"
          }`}
        >
          <Clock className="h-5 w-5 stroke-[2.4]" />
          <span className="text-[11px] leading-none">History</span>
          {activeTab === "history" && (
            <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          )}
        </button>

        {/* Settings Tab */}
        <button
          id="nav-tab-settings"
          type="button"
          onClick={() => onChangeTab("settings")}
          className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-4 rounded-2xl transition cursor-pointer ${
            activeTab === "settings"
              ? "text-purple-700 dark:text-purple-300 font-black bg-white/80 dark:bg-purple-950/60 shadow-xs"
              : "text-slate-800 dark:text-purple-200/90 hover:text-purple-700 dark:hover:text-purple-100 font-bold"
          }`}
        >
          <Settings className="h-5 w-5 stroke-[2.4]" />
          <span className="text-[11px] leading-none">Settings</span>
          {activeTab === "settings" && (
            <span className="absolute -bottom-0.5 h-1 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          )}
        </button>
      </div>

      {/* iOS / Android gesture home indicator line */}
      <div className="flex justify-center pb-1.5">
        <div className="h-1 w-28 rounded-full bg-slate-300/80 dark:bg-slate-700/80" />
      </div>
    </nav>
  );
};
