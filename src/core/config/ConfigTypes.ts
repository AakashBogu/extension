import { AppConfig } from './IConfig';

export type EnvironmentType = 'development' | 'production' | 'test' | 'preview' | 'staging';

export interface LoggingSection {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  maxLogEntries: number;
}

export interface ProvidersSection {
  ai: string;
  search: string;
  speech: string;
  ocr: string;
  storage: string;
}

export interface UISection {
  theme: 'dark' | 'light';
  accentColor: string;
}

export interface OverlaySection {
  defaultPosition: { x: number; y: number };
  autoHideTimeoutMs: number;
}

export interface SecuritySection {
  enforceCsp: boolean;
  encryptSecrets: boolean;
}

export interface PrivacySection {
  telemetryEnabled: boolean;
  zeroDataEgress: boolean;
}

export interface NetworkSection {
  apiTimeoutMs: number;
  maxRetries: number;
}

export interface ExtendedAppConfig extends AppConfig {
  version: number;
  environment: EnvironmentType;
  logging: LoggingSection;
  providersSection: ProvidersSection;
  uiSection: UISection;
  overlaySection: OverlaySection;
  securitySection: SecuritySection;
  privacySection: PrivacySection;
  networkSection: NetworkSection;
}

export interface ConfigSnapshot {
  id: string;
  timestamp: number;
  version: number;
  config: ExtendedAppConfig;
}
