# Provider Registries Architecture

Supports hot-swappable providers:
- **AIProviderRegistry**: Gemini, OpenAI, Claude, Local LLM adapters.
- **SearchProviderRegistry**: Tavily, Google Custom Search, Serper, Exa.
- **STTEngineRegistry**: WebSpeech API, Whisper WASM, Deepgram WS.
- **OCREngineRegistry**: Tesseract WASM video frame parser.
