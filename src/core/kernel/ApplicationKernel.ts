import { ServiceContainer } from '../di/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { ConfigLoader } from '../config/ConfigLoader';
import { GlobalStateStore } from '../state/GlobalStateStore';
import { StateManager } from '../state/StateManager';
import { StateRegistry } from '../state/StateRegistry';
import { StatePersistenceManager } from '../state/StatePersistenceManager';
import { PluginManager } from '../plugin/PluginManager';
import { ApplicationContext, RuntimeMetadata } from './ApplicationContext';
import { GlobalState } from '../state/StateTypes';
import { AIProviderRegistry } from '../providers/registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../providers/registry/SearchProviderRegistry';
import { SpeechProviderRegistry } from '../../providers/registry/SpeechProviderRegistry';
import { OCRProviderRegistry } from '../../providers/registry/OCRProviderRegistry';
import { StorageProviderRegistry } from '../../providers/registry/StorageProviderRegistry';
import { ExtensionInitializationError } from '../error/AppError';
import { MetricsManager } from '../metrics/MetricsManager';
import { ProviderHealthManager } from '../providers/health/ProviderHealthManager';
import { AIProviderRouter } from '../providers/router/AIProviderRouter';
import { SearchProviderRouter } from '../providers/router/SearchProviderRouter';
import { ProviderExecutionEngine } from '../providers/execution/ProviderExecutionEngine';
import { ProviderObservabilityManager } from '../providers/observability/ProviderObservabilityManager';
import { VerificationEngine } from '../verification/VerificationEngine';

export class SimpleLogger {
  debug(msg: string, ctx?: Record<string, unknown>) { console.debug('[DEBUG]', msg, ctx || ''); }
  info(msg: string, ctx?: Record<string, unknown>) { console.info('[INFO]', msg, ctx || ''); }
  warn(msg: string, ctx?: Record<string, unknown>) { console.warn('[WARN]', msg, ctx || ''); }
  error(msg: string, err?: unknown, ctx?: Record<string, unknown>) { console.error('[ERROR]', msg, err || '', ctx || ''); }
}

export class ApplicationKernel {
  private context: ApplicationContext | null = null;
  private isBooted = false;

  async boot(): Promise<ApplicationContext> {
    if (this.isBooted && this.context) {
      return this.context;
    }

    try {
      const container = new ServiceContainer();
      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig();

      const eventBus = new EventBus();
      const logger = new SimpleLogger();

      // Initial State Topology
      const defaultState: GlobalState = {
        application: { status: 'IDLE', activeVideoId: null, activeTabId: null, claimsProcessedCount: 0, lastError: null },
        runtime: { version: '1.0.0', env: config.env, isRunning: true, startedAt: Date.now() },
        configuration: config,
        ui: { theme: 'dark', overlayVisible: true, activeTab: 'status' },
        overlay: { position: { x: 16, y: 16 }, opacity: 0.95 },
        providers: { activeAiProvider: config.defaultAiProvider, activeSearchProvider: config.defaultSearchProvider },
        plugins: { registeredCount: 0, activeCount: 0 },
        diagnostics: { errorCount: 0, lastDiagnosticAt: Date.now() },
        video: {},
        audio: {},
        transcript: {},
        claims: {},
        verification: {},
        timeline: {},
        debug: {}
      };

      const stateStore = new GlobalStateStore(defaultState);
      const stateManager = new StateManager(stateStore, eventBus);
      const stateRegistry = new StateRegistry();
      const persistenceManager = new StatePersistenceManager();
      const pluginManager = new PluginManager(container);

      // Hydrate state from persistence if available
      const hydrated = await persistenceManager.hydrate();
      if (hydrated) {
        stateStore.setState(hydrated);
      }

      // Provider Registries
      const providerRegistries = {
        ai: new AIProviderRegistry(),
        search: new SearchProviderRegistry(),
        speech: new SpeechProviderRegistry(),
        ocr: new OCRProviderRegistry(),
        storage: new StorageProviderRegistry()
      };

      // Metrics & Observability Architecture
      const metricsManager = new MetricsManager(eventBus);
      const providerHealthManager = new ProviderHealthManager(eventBus);

      // Provider Routers
      const aiRouter = new AIProviderRouter(
        providerRegistries.ai,
        providerHealthManager,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        eventBus
      );
      const searchRouter = new SearchProviderRouter(
        providerRegistries.search,
        providerHealthManager,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        eventBus
      );

      // Provider Execution Engine
      const executionEngine = new ProviderExecutionEngine(
        aiRouter,
        searchRouter,
        providerRegistries.ai,
        providerRegistries.search,
        providerHealthManager,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        eventBus
      );
      await executionEngine.initialize();

      // Provider Observability Manager
      const observabilityManager = new ProviderObservabilityManager(
        undefined,
        providerHealthManager,
        executionEngine.circuitRecoveryManager,
        executionEngine.cooldownManager,
        executionEngine.quotaManager,
        executionEngine.rateLimitTracker,
        eventBus
      );
      await observabilityManager.initialize();

      // Module 7: Verification Engine
      const verificationEngine = new VerificationEngine(
        executionEngine,
        undefined,
        eventBus,
        metricsManager
      );
      await verificationEngine.initialize();
      verificationEngine.start();

      // DI Bindings
      container.bind('IServiceContainer').toValue(container);
      container.bind('IEventBus').toValue(eventBus);
      container.bind('IConfigLoader').toValue(configLoader);
      container.bind('ILogger').toValue(logger);
      container.bind('GlobalStateStore').toValue(stateStore);
      container.bind('StateManager').toValue(stateManager);
      container.bind('StateRegistry').toValue(stateRegistry);
      container.bind('StatePersistenceManager').toValue(persistenceManager);
      container.bind('PluginManager').toValue(pluginManager);
      container.bind('MetricsManager').toValue(metricsManager);
      container.bind('ProviderHealthManager').toValue(providerHealthManager);
      container.bind('AIProviderRouter').toValue(aiRouter);
      container.bind('SearchProviderRouter').toValue(searchRouter);
      container.bind('ProviderExecutionEngine').toValue(executionEngine);
      container.bind('ProviderObservabilityManager').toValue(observabilityManager);
      container.bind('VerificationEngine').toValue(verificationEngine);

      const runtimeMetadata: RuntimeMetadata = {
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        version: '1.0.0',
        env: config.env,
        startTime: Date.now()
      };

      this.context = new ApplicationContext(
        container,
        eventBus,
        configLoader,
        logger,
        stateManager,
        pluginManager,
        providerRegistries,
        runtimeMetadata,
        executionEngine,
        verificationEngine,
        observabilityManager
      );

      container.bind('ApplicationContext').toValue(this.context);
      container.bind('ApplicationKernel').toValue(this);

      this.isBooted = true;
      await eventBus.publish('system.app_started', { timestamp: runtimeMetadata.startTime });

      return this.context;
    } catch (err) {
      throw new ExtensionInitializationError('Application Kernel failed to boot', {
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isBooted || !this.context) return;

    try {
      // 1. Teardown VerificationEngine (Module 7)
      if (this.context.verificationEngine) {
        await this.context.verificationEngine.stop();
        this.context.verificationEngine.destroy();
      }

      // 2. Teardown Observability
      if (this.context.observabilityManager) {
        this.context.observabilityManager.shutdown();
        this.context.observabilityManager.destroy();
      }

      // 3. Teardown ProviderExecutionEngine
      if (this.context.executionEngine) {
        await this.context.executionEngine.shutdown();
        this.context.executionEngine.destroy();
      }

      await this.context.eventBus.publish('system.app_stopped', { timestamp: Date.now() });

      // Persist state
      const persistence = this.context.container.get<StatePersistenceManager>('StatePersistenceManager');
      const store = this.context.container.get<GlobalStateStore>('GlobalStateStore');
      await persistence.persist(store.getState());

      this.isBooted = false;
      this.context = null;
    } catch (err) {
      console.error('[ApplicationKernel] Error during shutdown:', err);
    }
  }

  getContext(): ApplicationContext | null {
    return this.context;
  }
}
