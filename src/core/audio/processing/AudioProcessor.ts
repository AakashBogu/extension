import { PCMExtractor } from './PCMExtractor';
import { ChannelMixer } from './ChannelMixer';
import { AudioResampler } from './AudioResampler';
import { AudioFrameGenerator } from './AudioFrameGenerator';
import { AudioChunkManager } from './AudioChunkManager';
import { AudioSignalAnalyzer } from './AudioSignalAnalyzer';
import { VoiceActivityDetector } from './VoiceActivityDetector';
import { SpeechSegmentManager } from './SpeechSegmentManager';
import { AudioProcessingConfig, AudioFrame, AudioChunk, SpeechSegment, AudioSignalMetrics } from './AudioProcessingTypes';

export class AudioProcessor {
  public readonly pcmExtractor: PCMExtractor;
  public readonly channelMixer: ChannelMixer;
  public readonly resampler: AudioResampler;
  public readonly frameGenerator: AudioFrameGenerator;
  public readonly chunkManager: AudioChunkManager;
  public readonly signalAnalyzer: AudioSignalAnalyzer;
  public readonly vad: VoiceActivityDetector;
  public readonly segmentManager: SpeechSegmentManager;

  constructor(private config: AudioProcessingConfig) {
    this.pcmExtractor = new PCMExtractor();
    this.channelMixer = new ChannelMixer();
    this.resampler = new AudioResampler();
    this.frameGenerator = new AudioFrameGenerator(config.frameDurationMs, config.targetSampleRate, 1);
    this.chunkManager = new AudioChunkManager(config.chunkDurationMs, config.maxPendingChunks);
    this.signalAnalyzer = new AudioSignalAnalyzer();
    this.vad = new VoiceActivityDetector(config.vad);
    this.segmentManager = new SpeechSegmentManager();
  }

  processChannelData(channelBuffers: Float32Array[], inputSampleRate: number): {
    frames: AudioFrame[];
    chunks: AudioChunk[];
    segments: SpeechSegment[];
    metricsList: AudioSignalMetrics[];
  } {
    const extracted = this.pcmExtractor.extractPCM(channelBuffers);
    const mono = this.channelMixer.mixToMono(extracted, this.config.channelMode);
    const resampled = this.resampler.resample(mono, inputSampleRate, this.config.targetSampleRate);
    const frames = this.frameGenerator.pushSamples(resampled);

    const chunks: AudioChunk[] = [];
    const segments: SpeechSegment[] = [];
    const metricsList: AudioSignalMetrics[] = [];

    frames.forEach(frame => {
      const metrics = this.signalAnalyzer.analyzeSignal(frame.samples);
      metricsList.push(metrics);

      const vadRes = this.vad.processFrame(metrics.decibels, frame.durationMs);

      if (vadRes.isSpeech) {
        if (!this.segmentManager.getCurrentSegment()) {
          const seg = this.segmentManager.startSegment(frame.sequenceNumber, vadRes.confidence);
          segments.push(seg);
        } else {
          this.segmentManager.appendFrame();
        }
      } else {
        const finalized = this.segmentManager.finalizeSegment(frame.sequenceNumber);
        if (finalized) segments.push(finalized);
      }

      const chunk = this.chunkManager.addFrame(frame);
      if (chunk) chunks.push(chunk);
    });

    return { frames, chunks, segments, metricsList };
  }

  reset(): void {
    this.resampler.reset();
    this.frameGenerator.reset();
    this.chunkManager.reset();
    this.vad.reset();
    this.segmentManager.reset();
  }
}
