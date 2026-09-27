# Implementation Plan: Cloud Translation Lifecycle, Reconnect Data & EPUB Verification

This plan tests the entire translation lifecycle instructed by the user, measuring exact network payload bytes at each step to verify mobile data savings and ensuring chapter sequence integrity in the downloaded EPUB.

---

## 1. Test Dataset Preparation (Multi-Chapter Chinese Novel)
- Prepare a multi-chapter Chinese web novel test text containing 5 chapters (~10,000–15,000 English words):
  - `第1章 重生的开端` (Chapter 1)
  - `第2章 初探迷雾森林` (Chapter 2)
  - `第3章 遗迹的秘密` (Chapter 3)
  - `第4章 远古的盟约` (Chapter 4)
  - `第5章 黎明前的抉择` (Chapter 5)
- Ensure realistic chapter headings and substantive narrative paragraphs so the translation pipeline processes full contextual chunks.

---

## 2. Phase 1: Upload & Cloud Translation Launch
- Simulate novel upload via the cloud pipeline (`/api/cloud-job/prepare`).
- Launch cloud translation via `/api/cloud-job/start`.
- Record initial job ID, session cookie/token, and baseline timestamps.

---

## 3. Phase 2: Browser Closure Simulation
- Close the simulated client connection completely (zero active polling or open WebSockets).
- Verify the server-side cloud translation engine continues running autonomously in the background without requiring any client browser presence.

---

## 4. Phase 3: Mid-Way Browser Reconnect & Payload Measurement
- As background translation progresses past ~3,000 words:
  - Simulate the user opening the browser / unlocking their phone after receiving a notification.
  - Call `GET /api/cloud-job/status?summary=true` (the exact endpoint triggered by tab focus / reconnect in the updated frontend).
  - **Verify UI Data**: Check that `completedChunks`, `totalWords`, `percentage`, and active chapter reflect the correct mid-way progress.
  - **Measure Network Consumption**: Record exact HTTP response headers and body byte sizes to confirm the lightweight payload (~350–500 bytes instead of 5+ MB).

---

## 5. Phase 4 & 5: Second Browser Closure & Final Completion
- Close the simulated browser connection again while the cloud worker completes remaining chapters.
- Once 100% finished:
  - Simulate reopening the browser.
  - Call `GET /api/cloud-job/status?summary=true`.
  - Verify `status: "completed"`, `completedChunks === totalChunks`, and the UI trigger for the completion state (green check badge).
  - Measure payload size on final reconnect to confirm zero unnecessary full-text transfer.

---

## 6. Phase 6: Server-Side EPUB Compilation & Chapter Ordering Inspection
- Request the final EPUB via `GET /api/cloud-job/download-epub?novelName=...&continuous=true`.
- **Measure Transfer Size**: Confirm compressed EPUB delivery vs raw uncompressed text.
- **Unzip & Inspect EPUB Structure**:
  - Verify all EPUB3/EPUB2 compliance files (`mimetype`, `META-INF/container.xml`, `OEBPS/content.opf`, `OEBPS/nav.xhtml`, `OEBPS/toc.ncx`).
  - Verify chapter documents (`chapter_1.xhtml` to `chapter_5.xhtml`) are in strictly sequential, ascending order.
  - Inspect chapter titles in the Table of Contents to confirm zero scrambled, duplicate, or missing chapters.

---

## 7. Phase 7: Mobile Data Savings Audit Report
- Deliver an itemized breakdown comparing:
  - **Old Behavior**: Data consumed when reopening browser / tab focus (3.5–5 MB per reconnect).
  - **New Optimized Behavior**: Data consumed on reconnect (~350–500 bytes) + compressed server EPUB streaming (~75–80% network data saved).
