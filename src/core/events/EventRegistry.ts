import { EventTopic } from './EventTypes';
import { UnknownEventError } from '../error/EventErrors';

export interface EventTopicDefinition {
  topic: EventTopic;
  description: string;
  payloadSchema?: string;
}

export class EventRegistry {
  private definitions = new Map<EventTopic, EventTopicDefinition>();

  constructor() {
    this.registerDefaults();
  }

  registerTopic(definition: EventTopicDefinition): void {
    this.definitions.set(definition.topic, definition);
  }

  getTopicDefinition(topic: EventTopic): EventTopicDefinition {
    const def = this.definitions.get(topic);
    if (!def) {
      throw new UnknownEventError(topic);
    }
    return def;
  }

  hasTopic(topic: EventTopic): boolean {
    return this.definitions.has(topic);
  }

  listTopics(): EventTopicDefinition[] {
    return Array.from(this.definitions.values());
  }

  private registerDefaults(): void {
    const defaults: EventTopicDefinition[] = [
      { topic: 'audio.captured', description: 'Raw PCM audio chunk captured from HTML5 video stream' },
      { topic: 'transcript.produced', description: 'Speech-to-text transcript segment generated' },
      { topic: 'claim.detected', description: 'Factual claim extracted from text segment' },
      { topic: 'verification.started', description: 'Fact verification workflow initiated' },
      { topic: 'verdict.ready', description: 'Fact-check verdict and citations generated' },
      { topic: 'cost.alert', description: 'Token expenditure budget limit threshold reached' },
      { topic: 'system.state_changed', description: 'Extension operational state updated' },
      { topic: 'system.app_started', description: 'Application bootstrap complete' },
      { topic: 'system.app_stopped', description: 'Application teardown complete' },
      { topic: 'system.module_loaded', description: 'System module loaded' },
      { topic: 'system.plugin_loaded', description: 'Plugin initialized' },
      { topic: 'system.plugin_started', description: 'Plugin started' },
      { topic: 'system.plugin_stopped', description: 'Plugin stopped' },
      { topic: 'system.service_registered', description: 'DI service bound' },
      { topic: 'system.config_changed', description: 'Configuration setting modified' },
      { topic: 'system.error_occurred', description: 'Global exception caught' },
      { topic: 'system.diagnostic', description: 'System telemetry diagnostic entry emitted' }
    ];

    defaults.forEach(d => this.registerTopic(d));
  }
}
