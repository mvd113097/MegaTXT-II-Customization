import React from "react";

/**
 * Storybook Artwork & Vector Illustrations
 */

export const SakuraBlossom: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* 5 Petals of Sakura */}
    <g transform="translate(24, 24)">
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <path
          key={i}
          d="M 0 0 C -6 -11, -11 -20, -6 -23 C -2 -25, 0 -22, 0 -20 C 0 -22, 2 -25, 6 -23 C 11 -20, 6 -11, 0 0 Z"
          fill="url(#sakuraPetalGrad)"
          stroke="#F472B6"
          strokeWidth="0.8"
          transform={`rotate(${angle})`}
          opacity="0.95"
        />
      ))}
      {/* Pistils / Center */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2="-6"
          stroke="#EC4899"
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx="0" cy="0" r="3" fill="#F43F5E" />
      <circle cx="0" cy="0" r="1.5" fill="#FEF08A" />
    </g>
    <defs>
      <linearGradient id="sakuraPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FBCFE8" />
        <stop offset="60%" stopColor="#F9A8D4" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
    </defs>
  </svg>
);

export const SparkleStar: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 16,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

export const ThemeSceneIllustration: React.FC = () => null;
export const PagodaHeaderIllustration: React.FC = () => null;
export const SleepingCatIllustration: React.FC<{ className?: string }> = () => null;
export const StoryVignetteIllustration: React.FC<{ className?: string }> = () => null;
export const UploadFooterIllustration: React.FC = () => null;
export const SakuraFooterDecoration: React.FC = () => null;

