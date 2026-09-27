# Implementation Plan: Mobile Upload Data Reduction & Deduplication

## 1. Problem Diagnosis
When uploading a 3MB `.txt` file and pressing **Start Translation**, the application currently consumes ~6.7MB of mobile data because:
1. **Request #1 (`/api/cloud-job/prepare`)**: Sends the raw uncompressed 3MB text string inside JSON (~3.2 MB wire size).
2. **Request #2 (`/api/cloud-job/start`)**: When the user presses *Start*, because the asynchronous preparation may still be resolving its server handshake, the client falls back to transmitting the entire chunk array with all Chinese text inside the start payload (~3.5 MB wire size).
3. **Double Upload Result**: The entire 3MB novel is transmitted across mobile data twice in back-to-back requests before background translation begins.

---

## 2. Proposed Optimization Solution

### A. Deduplicate Start Payload (Zero Redundant Data)
- Ensure `/api/cloud-job/start` **never** re-transmits raw chunks if the novel was already uploaded/prepared on the server.
- The start payload will only send a lightweight ~120-byte reference pointer (`{ jobId: "...", fileName: "..." }`).
- Await the in-flight prepare promise so race conditions cannot trigger the fallback chunk transmission.

### B. Client-Side GZIP Compression on Uploads
- Use the modern HTML5 `CompressionStream('gzip')` API (with fallback) to compress large text files before transmission to the server.
- For a 3MB Chinese text file, GZIP reduces the upload payload from **3.2MB down to ~850KB** (a **73%+ bandwidth reduction**).
- Configure Express backend with `express.raw()` / `zlib.gunzipSync` to seamlessly unpack compressed payloads.

### C. Direct One-Step Start Option
- In `UploadSection.tsx`, provide a streamlined direct-start option so that uploading and initiating background cloud translation happens in a single, compressed network request.

---

## 3. Verification Steps
1. Create automated test simulating a 3MB Chinese text novel upload.
2. Measure exact network payload bytes for:
   - Uncompressed dual-payload flow (baseline: ~6.7 MB).
   - Deduplicated and GZIP-compressed single flow (target: < 900 KB).
3. Verify server correctly chunks, stores, and begins background translation of the compressed novel.
4. Verify UI smoothly displays the active translation queue and progress banner.
