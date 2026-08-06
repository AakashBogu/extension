# AI Cost & Quota Management

Features:
- Real-time token counter (tiktoken / Gemini token estimation).
- Budget limits per user (Daily max $0.50, Monthly max $10.00).
- Fallback strategy: Switch to Gemini Flash or Local Whisper when budget > 80%.
