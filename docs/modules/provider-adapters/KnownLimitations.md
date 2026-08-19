# Concrete Provider Adapter Layer - Known Limitations

- Direct client-side HTTP calls to AI/Search vendor APIs from browser extensions require proper CORS handling or background service worker context.
- API keys must be provided via environment variables or extension options.
