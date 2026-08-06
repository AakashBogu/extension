import { BaseEvent } from './EventTypes';

export type NextFunction = () => Promise<void>;
export type EventMiddleware = (event: BaseEvent, next: NextFunction) => Promise<void>;

export class MiddlewarePipeline {
  private middlewares: EventMiddleware[] = [];

  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  async execute(event: BaseEvent, finalHandler: () => Promise<void>): Promise<void> {
    let index = -1;

    const runner = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;

      if (i === this.middlewares.length) {
        await finalHandler();
        return;
      }

      const middleware = this.middlewares[i];
      await middleware(event, () => runner(i + 1));
    };

    await runner(0);
  }
}
