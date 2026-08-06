import { EnvironmentType } from './ConfigTypes';
import { EnvironmentError } from '../error/ConfigErrors';

export class EnvironmentManager {
  private currentEnv: EnvironmentType;

  constructor(initialEnv: EnvironmentType = 'development') {
    this.currentEnv = initialEnv;
  }

  getEnvironment(): EnvironmentType {
    return this.currentEnv;
  }

  setEnvironment(env: EnvironmentType): void {
    const validEnvs: EnvironmentType[] = ['development', 'production', 'test', 'preview', 'staging'];
    if (!validEnvs.includes(env)) {
      throw new EnvironmentError(env, 'Invalid environment specified');
    }
    this.currentEnv = env;
  }

  getEnvironmentMetadata() {
    return {
      env: this.currentEnv,
      isDevelopment: this.currentEnv === 'development',
      isProduction: this.currentEnv === 'production',
      isTesting: this.currentEnv === 'test',
      isPreview: this.currentEnv === 'preview',
      isStaging: this.currentEnv === 'staging'
    };
  }
}
