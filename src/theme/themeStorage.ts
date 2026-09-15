import type { InstalledTheme, ThemeManifest } from "./themeTypes";

const DB_NAME = "megatext-theme-store";
const STORE = "themes";
const DB_VERSION = 1;
const MAX_PACKAGE_BYTES = 30 * 1024 * 1024;
const MAX_ASSET_BYTES = 8 * 1024 * 1024;
const ALLOWED_ASSET_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putTheme(theme: InstalledTheme) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...theme, builtIn: false, assetUrls: {}, assetBlobs: theme.assetBlobs || {} });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getStoredThemes(): Promise<InstalledTheme[]> {
  const db = await openDb();
  const rows = await new Promise<any[]>((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows.map((row) => ({ ...row, builtIn: false, assetUrls: {} }));
}

export async function loadInstalledThemes(): Promise<InstalledTheme[]> {
  const stored = await getStoredThemes();
  for (const theme of stored) {
    theme.assetUrls = {};
    for (const [role, blob] of Object.entries(theme.assetBlobs || {})) {
      theme.assetUrls[role] = URL.createObjectURL(blob);
    }
  }
  return stored;
}

export async function removeStoredTheme(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function validateManifest(raw: unknown): ThemeManifest {
  if (!raw || typeof raw !== "object") throw new Error("theme.json is invalid.");
  const m = raw as Partial<ThemeManifest>;
  if (m.schema !== "megatext-theme" || m.schemaVersion !== 1) throw new Error("Unsupported MegaTXT theme format.");
  if (!m.name || typeof m.name !== "string") throw new Error("Theme name is required.");
  if (!m.colors || typeof m.colors !== "object") throw new Error("Theme colors are required.");
  const colors = m.colors as any;
  const required = ["background", "surface", "surfaceAlt", "text", "mutedText", "primary", "primaryStrong", "accent", "border", "ring"];
  for (const key of required) {
    if (typeof colors[key] !== "string" || colors[key].length > 40) throw new Error(`Invalid color token: ${key}`);
  }
  const id = safeId(m.id || m.name);
  if (!id) throw new Error("Theme id is invalid.");
  if (["storybook", "sakura-dawn", "midnight-ink"].includes(id)) throw new Error("That theme id is reserved by MegaTXT.");
  return {
    schema: "megatext-theme",
    schemaVersion: 1,
    id,
    name: m.name.slice(0, 80),
    version: typeof m.version === "string" ? m.version.slice(0, 30) : "1.0.0",
    author: typeof m.author === "string" ? m.author.slice(0, 100) : undefined,
    description: typeof m.description === "string" ? m.description.slice(0, 300) : undefined,
    colors: colors as ThemeManifest["colors"],
    radius: m.radius === "sharp" || m.radius === "rounded" || m.radius === "soft" ? m.radius : "soft",
    fontFamily: typeof m.fontFamily === "string" ? m.fontFamily.slice(0, 200) : undefined,
    assets: m.assets && typeof m.assets === "object" ? m.assets : undefined,
  };
}

export async function importThemeZip(file: File): Promise<InstalledTheme> {
  if (file.size > MAX_PACKAGE_BYTES) throw new Error("Theme package is too large. Maximum is 30 MB.");
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const manifestEntry = zip.file("theme.json") || zip.file(/(^|\/)theme\.json$/i)[0];
  if (!manifestEntry) throw new Error("Theme package must contain theme.json.");
  const manifest = validateManifest(JSON.parse(await manifestEntry.async("string")));
  const blobs: Record<string, Blob> = {};
  const roleEntries = Object.entries(manifest.assets || {});
  for (const [role, relativePath] of roleEntries) {
    if (!relativePath || typeof relativePath !== "string") continue;
    const normalized = relativePath.replace(/^\.\//, "");
    if (normalized.includes("..") || !ALLOWED_ASSET_EXT.test(normalized)) throw new Error(`Invalid asset path for ${role}.`);
    const entry = zip.file(normalized) || zip.file(new RegExp(`(^|/)${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"))[0];
    if (!entry) continue;
    const bytes = await entry.async("uint8array");
    if (bytes.byteLength > MAX_ASSET_BYTES) throw new Error(`Asset ${role} is too large.`);
    const ext = normalized.split(".").pop()?.toLowerCase();
    const mime = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
    blobs[role] = new Blob([bytes], { type: mime });
  }
  const theme: InstalledTheme = { ...manifest, builtIn: false, installedAt: Date.now(), assetUrls: {}, assetBlobs: blobs };
  for (const [role, blob] of Object.entries(blobs)) theme.assetUrls[role] = URL.createObjectURL(blob);
  await putTheme(theme);
  return theme;
}

export async function exportThemeZip(theme: InstalledTheme): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const manifest: ThemeManifest = {
    schema: "megatext-theme",
    schemaVersion: 1,
    id: theme.id,
    name: theme.name,
    version: theme.version,
    author: theme.author,
    description: theme.description,
    colors: theme.colors,
    radius: theme.radius,
    fontFamily: theme.fontFamily,
    assets: {},
  };
  for (const [role, url] of Object.entries(theme.assetUrls || {})) {
    try {
      let blob: Blob;
      if (theme.assetBlobs?.[role]) blob = theme.assetBlobs[role];
      else {
        const response = await fetch(url);
        blob = await response.blob();
      }
      const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : blob.type === "image/gif" ? "gif" : blob.type === "image/svg+xml" ? "svg" : "png";
      const path = `assets/${role}.${ext}`;
      zip.file(path, blob);
      (manifest.assets as Record<string, string>)[role] = path;
    } catch {
      // Missing optional asset is fine.
    }
  }
  zip.file("theme.json", JSON.stringify(manifest, null, 2));
  zip.file("README.txt", "MegaTXT Theme Package\n\nSafe theme packages contain theme.json and image assets only. No JavaScript is executed by the theme system.\n");
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
}

export const THEME_PACKAGE_MAX_BYTES = MAX_PACKAGE_BYTES;
