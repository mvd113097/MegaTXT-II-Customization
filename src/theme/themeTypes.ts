export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryStrong: string;
  accent: string;
  border: string;
  ring: string;
}

export interface ThemeManifest {
  schema: "megatext-theme";
  schemaVersion: 1;
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  colors: ThemeColors;
  radius?: "soft" | "rounded" | "sharp";
  fontFamily?: string;
  assets?: {
    header?: string;
    cat?: string;
    complete?: string;
    background?: string;
    scene?: string;
    footer?: string;
    preview?: string;
  };
}

export interface InstalledTheme extends ThemeManifest {
  builtIn?: boolean;
  installedAt: number;
  assetUrls: Record<string, string>;
  assetBlobs?: Record<string, Blob>;
}
