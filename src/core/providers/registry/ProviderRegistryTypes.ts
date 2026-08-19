import { ProviderType } from '../ProviderTypes';

export interface ProviderRegistrationOptions {
  autoInitialize?: boolean;
}

export interface ProviderRegistryEventPayload {
  providerId: string;
  providerType: ProviderType;
  timestamp: number;
}
