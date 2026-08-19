# Real-Time Audio Transport, Bounded Chunk Queue & Speech Pipeline Boundary - Architecture Blueprint

```mermaid
graph TD
  Module3C[Module 3C: Audio Processing Engine] --> TransportEngine[AudioTransportEngine]
  TransportEngine --> Queue[AudioChunkQueue]
  Queue --> Transport[AudioChunkTransport]
  Transport --> Boundary[SpeechPipelineBoundary]
  Boundary --> Adapter[ISpeechPipelineAdapter / NullSpeechPipelineAdapter]
  Adapter --> Module4[Module 4: Speech Recognition Pipeline]
```
