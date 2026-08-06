/**
 * Plugin Architecture Interface (Module 1B Contract)
 */
import { IServiceContainer } from '../di/IServiceContainer';

export interface IPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  initialize(container: IServiceContainer): Promise<void>;
  destroy(): Promise<void>;
}
