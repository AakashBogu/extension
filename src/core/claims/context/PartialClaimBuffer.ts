export class PartialClaimBuffer {
  private partialText = '';

  updatePartial(text: string): void {
    this.partialText = text;
  }

  clear(): void {
    this.partialText = '';
  }

  getPartial(): string {
    return this.partialText;
  }
}
