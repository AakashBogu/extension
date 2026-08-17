import { describe, it, expect } from 'vitest';
import { VoiceActivityDetector } from '../core/audio/processing/VoiceActivityDetector';

describe('Module 3C: VoiceActivityDetector', () => {
  it('should transition VAD states cleanly with persistence and hangover', () => {
    const vad = new VoiceActivityDetector({
      enabled: true,
      speechThresholdDb: -35,
      silenceThresholdDb: -42,
      speechStartFrames: 3,
      silenceHangoverMs: 40,
      minSpeechDurationMs: 60
    });

    expect(vad.getState()).toBe('SILENCE');

    // 1st loud frame -> POSSIBLE_SPEECH
    vad.processFrame(-20, 20);
    expect(vad.getState()).toBe('POSSIBLE_SPEECH');

    // 2nd loud frame -> POSSIBLE_SPEECH
    vad.processFrame(-20, 20);
    expect(vad.getState()).toBe('POSSIBLE_SPEECH');

    // 3rd loud frame -> SPEECH
    const res3 = vad.processFrame(-20, 20);
    expect(res3.state).toBe('SPEECH');
    expect(res3.isSpeech).toBe(true);

    // Quiet frame -> POSSIBLE_SILENCE (hangover)
    const res4 = vad.processFrame(-50, 20);
    expect(res4.state).toBe('POSSIBLE_SILENCE');
    expect(res4.isSpeech).toBe(true);

    // Sustained quiet frame -> SILENCE
    const res5 = vad.processFrame(-50, 30);
    expect(res5.state).toBe('SILENCE');
    expect(res5.isSpeech).toBe(false);
  });
});
