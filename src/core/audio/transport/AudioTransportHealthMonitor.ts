import { AudioChunkQueue } from './AudioChunkQueue';
import { ISpeechPipelineAdapter, AudioTransportHealth } from './AudioTransportTypes';
import { IEventBus } from '../../events/IEventBus';

export class AudioTransportHealthMonitor {
  constructor(
    private queue: AudioChunkQueue,
    private adapter: ISpeechPipelineAdapter,
    private eventBus?: IEventBus
  ) {}

  async checkHealth(): Promise<AudioTransportHealth> {
    const queueMetrics = this.queue.getMetrics();
    const adapterHealth = await this.adapter.healthCheck();

    let status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';

    if (queueMetrics.utilizationPercent >= 90 || !adapterHealth.ready) {
      status = 'UNHEALTHY';
    } else if (queueMetrics.utilizationPercent >= 60 || queueMetrics.droppedChunks > 0) {
      status = 'DEGRADED';
    }

    const healthReport: AudioTransportHealth = {
      status,
      queueSaturationPercent: queueMetrics.utilizationPercent,
      droppedChunksCount: queueMetrics.droppedChunks,
      adapterHealthy: adapterHealth.ready,
      details: {
        queueSize: queueMetrics.size,
        queueCapacity: queueMetrics.capacity,
        adapterName: adapterHealth.adapterName,
        processedChunks: adapterHealth.processedChunksCount
      }
    };

    if (this.eventBus) {
      this.eventBus.publish('audio.transport_health_changed', healthReport);
    }

    return healthReport;
  }
}
