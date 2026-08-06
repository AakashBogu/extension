export class DebugManager {
  private debugMode: boolean = false;

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  isDebugEnabled(): boolean {
    return this.debugMode;
  }
}
