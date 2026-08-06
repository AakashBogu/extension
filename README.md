# Real-Time Video Fact-Checking Chrome Extension (MV3)

A high-performance, enterprise-grade Chrome Extension for real-time video audio capture, speech transcription, factual claim detection, multi-source AI verification, and synchronized video overlay rendering.

## Architecture Highlights
- **Manifest V3 Compliant**: Uses Offscreen Documents for AudioContext processing & VAD.
- **Dependency Injection**: Inversify-style container for clean decoupling and testing.
- **Plugin Architecture**: Extensible detector, verifier, and UI plugin lifecycle hooks.
- **Provider Registries**: Hot-swappable AI (Gemini, OpenAI, Claude, Local), Search (Tavily, Google, Exa), STT (WebSpeech, Whisper), and OCR (Tesseract WASM) providers.
- **Observability & Cost Management**: Prometheus-style metrics, token budget capping, and queue backpressure managers.

---

## Module 1A — Project Foundation Setup & Verification

### Tech Stack
- **Framework**: React 18
- **Language**: TypeScript (Strict Mode)
- **Bundler**: Vite 5 (Multi-entry Rollup bundle)
- **Styling**: TailwindCSS 3 + PostCSS
- **Testing**: Vitest + Playwright

### Installation & Development
```bash
# 1. Install dependencies
cmd /c npm install

# 2. Typecheck without emitting JS
cmd /c npm run typecheck

# 3. Run ESLint checks
cmd /c npm run lint

# 4. Run Vitest smoke & unit tests
cmd /c npm run test

# 5. Build extension distribution bundle (dist/)
cmd /c npm run build
```

### Loading in Google Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the generated `dist/` directory in this workspace.

### Extension Entrypoints Overview
- **Manifest V3 Specification**: `src/manifest.json`
- **Background Service Worker**: `src/background/index.ts` -> `dist/background.js`
- **Content Script**: `src/content/index.ts` -> `dist/content.js`
- **Offscreen Document**: `src/offscreen/index.html` & `src/offscreen/index.ts`
- **Popup UI**: `src/popup/index.html` & `src/popup/PopupApp.tsx`
- **Options UI**: `src/options/index.html` & `src/options/OptionsApp.tsx`
- **DevTools Panel**: `src/devtools/index.html` & `src/devtools/DevToolsApp.tsx`
- **Overlay Shell UI**: `src/ui/overlay/OverlayShell.tsx` (Mounted inside Shadow DOM)

### Documentation & Specifications
Complete system architectural documentation and module design specifications are located inside [/docs](docs/README.md).
Module 1A technical documentation is inside [/docs/modules/project-foundation](docs/modules/project-foundation/README.md).
