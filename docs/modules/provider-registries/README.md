# Provider Registries Module - Technical Overview

## Summary
Decoupled registries for AI, Search, Speech, OCR, and Storage providers with priority ordering and default provider selection.

## Components Implemented
- `ProviderRegistry<T>`: Base generic registry.
- `AIProviderRegistry`: AI models (Gemini, OpenAI, Claude, Local).
- `SearchProviderRegistry`: Search engines (Tavily, Google, Exa).
- `SpeechProviderRegistry`: STT engines (WebSpeech, Whisper WASM).
- `OCRProviderRegistry`: Video frame OCR engines (Tesseract).
- `StorageProviderRegistry`: Persistence backends (IndexedDB, Chrome Storage).
