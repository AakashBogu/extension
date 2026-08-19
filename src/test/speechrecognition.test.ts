import { describe, it, expect, beforeEach } from 'vitest';
import { SpeechRecognitionEngine } from '../core/speech/SpeechRecognitionEngine';
import { EventBus } from '../core/events/EventBus';
import { AudioChunk } from '../core/audio/processing/AudioProcessingTypes';

describe('Module 4: SpeechRecognitionEngine Pipeline', () => {
  let engine: SpeechRecognitionEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    engine = new SpeechRecognitionEngine(
      {
        enabled: true,
        language: 'en-US',
        alternativeLanguages: [],
        enablePartialResults: true,
        enablePunctuation: true,
        enableWordTimestamps: true,
        enableSpeakerDiarization: false,
        maxAlternatives: 1,
        confidenceThreshold: 0.5,
        chunkTimeoutMs: 1000,
        sessionTimeoutMs: 5000,
        providerPreference: ['null-speech-provider'],
        fallbackEnabled: true
      },
      eventBus
    );
  });

  it('should run speech recognition pipeline, accept audio chunks, and generate FinalizedTranscript for Module 5', async () => {
    let finalResultEvent = false;
    let transcriptUpdatedEvent = false;

    eventBus.subscribe('speech.final_result', () => { finalResultEvent = true; });
    eventBus.subscribe('speech.transcript_updated', () => { transcriptUpdatedEvent = true; });

    await engine.initialize();
    const sessionId = await engine.startSession(101, 'video_test_1', 'en-US');

    expect(sessionId).toBeDefined();
    expect(engine.getStatus()).toBe('LISTENING');

    const chunk: AudioChunk = {
      id: 'c1',
      sequenceNumber: 1,
      timestamp: Date.now(),
      durationMs: 1000,
      sampleRate: 16000,
      channels: 1,
      samples: new Float32Array([0.1, 0.2, 0.3])
    };

    await engine.acceptAudioChunk(chunk);

    expect(finalResultEvent).toBe(true);
    expect(transcriptUpdatedEvent).toBe(true);

    const finalizedTranscript = engine.getFinalizedTranscript();
    expect(finalizedTranscript).not.toBeNull();
    expect(finalizedTranscript?.segments.length).toBe(1);
    expect(finalizedTranscript?.fullText).toContain('Recognized final transcript');
    expect(finalizedTranscript?.averageConfidence).toBeGreaterThan(0.9);

    await engine.stopSession();
    expect(engine.getStatus()).toBe('STOPPED');
  });
});
