import { SanitizedVerificationRequest, VerificationTaskStatus } from '../VerificationTypes';
import {
  VerificationQueueFullError,
  VerificationShutdownError,
  VerificationTaskTimeoutError,
  VerificationTaskCancelledError
} from '../../error/VerificationErrors';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export interface VerificationTask {
  taskId: string;
  claim: SanitizedVerificationRequest;
  priority: number; // 4: CRITICAL, 3: HIGH, 2: MEDIUM, 1: LOW
  status: VerificationTaskStatus;
  dedupKey: string;
  createdAt: number;
  enqueuedAt: number;
  abortController: AbortController;
  timeoutMs: number;
  retryCount: number;
  deferredPromise?: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  };
  executor?: (task: VerificationTask) => Promise<unknown>;
}

export interface VerificationQueueConfig {
  capacity: number;
  concurrencyLimit: number;
  highWaterMarkPercent: number;
  lowWaterMarkPercent: number;
  staleTaskTtlMs: number;
  defaultTaskTimeoutMs: number;
}

export class VerificationQueue {
  private queue: VerificationTask[] = [];
  private activeTasks = new Map<string, VerificationTask>();
  private timeoutHandles = new Map<string, NodeJS.Timeout>();
  private settledTasks = new Set<string>();
  private activeUpstreamPaused = false;
  private isShuttingDown = false;

  private readonly config: VerificationQueueConfig;

  constructor(
    config?: Partial<VerificationQueueConfig>,
    private readonly eventBus?: IEventBus
  ) {
    this.config = {
      capacity: config?.capacity ?? 50,
      concurrencyLimit: config?.concurrencyLimit ?? 3,
      highWaterMarkPercent: config?.highWaterMarkPercent ?? 80,
      lowWaterMarkPercent: config?.lowWaterMarkPercent ?? 40,
      staleTaskTtlMs: config?.staleTaskTtlMs ?? 30000,
      defaultTaskTimeoutMs: config?.defaultTaskTimeoutMs ?? 15000
    };
  }

  /**
   * Enqueues a sanitized claim task using REJECT_NEW backpressure.
   * DROP_OLDEST is strictly prohibited.
   */
  public enqueue(
    claim: SanitizedVerificationRequest,
    priorityLevel: number = 2,
    customTimeoutMs?: number,
    executor?: (task: VerificationTask) => Promise<unknown>
  ): VerificationTask {
    if (this.isShuttingDown) {
      throw new VerificationShutdownError('Cannot enqueue task: Verification queue is shutting down');
    }

    if (this.isFull()) {
      this.checkBackpressure();
      throw new VerificationQueueFullError(
        `Verification queue is full (${this.queue.length}/${this.config.capacity}). REJECT_NEW policy enforced.`
      );
    }

    const taskId = `verif_task_${claim.claimId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dedupKey = claim.normalizedText;
    const timeoutMs = customTimeoutMs || this.config.defaultTaskTimeoutMs;

    const task: VerificationTask = {
      taskId,
      claim,
      priority: Math.max(1, Math.min(4, priorityLevel)),
      status: 'QUEUED',
      dedupKey,
      createdAt: claim.createdAt || Date.now(),
      enqueuedAt: Date.now(),
      abortController: new AbortController(),
      timeoutMs,
      retryCount: 0,
      executor
    };

    // Insert according to priority order (higher priority value at front, stable FIFO within same priority)
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (task.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.queue.push(task);
    }

    this.checkBackpressure();
    return task;
  }

  /**
   * Enqueues and executes a task with concurrency limit enforcement and task-specific completion.
   */
  public async execute<T = unknown>(
    claim: SanitizedVerificationRequest,
    priorityLevel: number = 2,
    customTimeoutMs?: number,
    executor?: (task: VerificationTask) => Promise<T>
  ): Promise<T> {
    if (!executor) {
      throw new Error('Executor function is required for VerificationQueue.execute');
    }
    return new Promise<T>((resolve, reject) => {
      try {
        const task = this.enqueue(claim, priorityLevel, customTimeoutMs, executor);
        task.deferredPromise = {
          resolve: (val: unknown) => resolve(val as T),
          reject
        };
        this.dispatchNext();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Internal worker dispatcher enforcing concurrencyLimit.
   * Execution slots are occupied until the underlying executor promise settles.
   */
  private dispatchNext(): void {
    if (this.isShuttingDown && this.queue.length === 0) {
      return;
    }

    while (this.activeTasks.size < this.config.concurrencyLimit && this.queue.length > 0) {
      // Find the next task in queue that has an executor
      const taskIndex = this.queue.findIndex(t => !!t.executor);
      if (taskIndex === -1) {
        // No auto-dispatchable tasks in queue (they may be dequeued manually)
        break;
      }

      const task = this.queue.splice(taskIndex, 1)[0];
      const now = Date.now();

      // Check TTL eviction
      if (now - task.enqueuedAt > this.config.staleTaskTtlMs) {
        task.status = 'EXPIRED';
        this.settledTasks.add(task.taskId);
        if (this.eventBus) {
          this.eventBus.publish('verification.failed' as EventTopic, {
            taskId: task.taskId,
            claimId: task.claim.claimId,
            reason: 'Task expired in queue before processing',
            timestamp: Date.now()
          });
        }
        task.deferredPromise?.reject(
          new VerificationTaskTimeoutError(`Task ${task.taskId} expired in queue after TTL (${this.config.staleTaskTtlMs}ms)`)
        );
        this.checkBackpressure();
        continue;
      }

      // Mark ACTIVE and allocate physical execution slot
      task.status = 'ACTIVE';
      this.activeTasks.set(task.taskId, task);
      this.checkBackpressure();

      // Arm active timeout timer
      const timer = setTimeout(() => {
        this.timeoutHandles.delete(task.taskId);
        if (!this.settledTasks.has(task.taskId)) {
          this.settledTasks.add(task.taskId);
          task.status = 'EXPIRED';
          task.abortController.abort();
          if (this.eventBus) {
            this.eventBus.publish('verification.failed' as EventTopic, {
              taskId: task.taskId,
              claimId: task.claim.claimId,
              reason: `Task timed out after ${task.timeoutMs}ms`,
              timestamp: Date.now()
            });
          }
          task.deferredPromise?.reject(
            new VerificationTaskTimeoutError(`Verification task ${task.taskId} timed out after ${task.timeoutMs}ms`)
          );
        }
        // Note: Slot is NOT released here; it is released when executor promise settles in .finally()
      }, task.timeoutMs);
      this.timeoutHandles.set(task.taskId, timer);

      const finalizeTask = (isSuccess: boolean, valueOrErr: unknown) => {
        const t = this.timeoutHandles.get(task.taskId);
        if (t) {
          clearTimeout(t);
          this.timeoutHandles.delete(task.taskId);
        }
        // Free physical execution slot
        this.activeTasks.delete(task.taskId);

        if (!this.settledTasks.has(task.taskId)) {
          this.settledTasks.add(task.taskId);
          if (isSuccess) {
            task.status = 'COMPLETED';
            task.deferredPromise?.resolve(valueOrErr);
          } else {
            task.status = 'FAILED';
            task.deferredPromise?.reject(valueOrErr);
          }
        }

        this.settledTasks.delete(task.taskId);
        this.checkBackpressure();
        this.dispatchNext();
      };

      try {
        Promise.resolve(task.executor!(task))
          .then(result => {
            finalizeTask(true, result);
          })
          .catch(err => {
            finalizeTask(false, err);
          });
      } catch (syncErr) {
        finalizeTask(false, syncErr);
      }
    }
  }

  /**
   * Dequeues the next valid task, skipping and evicting stale tasks past TTL.
   */
  public dequeue(): VerificationTask | undefined {
    const now = Date.now();

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      // Check TTL eviction
      if (now - task.enqueuedAt > this.config.staleTaskTtlMs) {
        task.status = 'EXPIRED';
        this.settledTasks.add(task.taskId);
        if (this.eventBus) {
          this.eventBus.publish('verification.failed' as EventTopic, {
            taskId: task.taskId,
            claimId: task.claim.claimId,
            reason: 'Task expired in queue before processing',
            timestamp: Date.now()
          });
        }
        continue; // Try next task
      }

      task.status = 'ACTIVE';
      this.activeTasks.set(task.taskId, task);
      this.checkBackpressure();
      return task;
    }

    this.checkBackpressure();
    return undefined;
  }

  /**
   * Marks an active task as completed or failed and removes it from active set.
   * Used for manually dequeued tasks or external task completion.
   */
  public markFinished(taskId: string, status: 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'): void {
    const timer = this.timeoutHandles.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timeoutHandles.delete(taskId);
    }

    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = status;
      this.settledTasks.add(taskId);
      this.activeTasks.delete(taskId);
      this.settledTasks.delete(taskId);
      this.checkBackpressure();
      this.dispatchNext();
    }
  }

  /**
   * Cancels a specific task by taskId or dedupKey.
   */
  public cancelTask(taskIdOrDedupKey: string): boolean {
    // Check queued tasks
    const queueIndex = this.queue.findIndex(t => t.taskId === taskIdOrDedupKey || t.dedupKey === taskIdOrDedupKey);
    if (queueIndex !== -1) {
      const task = this.queue.splice(queueIndex, 1)[0];
      task.status = 'CANCELLED';
      this.settledTasks.add(task.taskId);
      task.abortController.abort();
      task.deferredPromise?.reject(new VerificationTaskCancelledError(`Task ${task.taskId} was cancelled`));
      this.checkBackpressure();
      this.dispatchNext();
      return true;
    }

    // Check active tasks
    for (const [id, task] of this.activeTasks.entries()) {
      if (id === taskIdOrDedupKey || task.dedupKey === taskIdOrDedupKey) {
        if (this.settledTasks.has(id)) {
          // Already logically settled (e.g. timed out or cancelled), but still physically executing
          return false;
        }
        const timer = this.timeoutHandles.get(id);
        if (timer) {
          clearTimeout(timer);
          this.timeoutHandles.delete(id);
        }
        this.settledTasks.add(id);
        task.status = 'CANCELLED';
        task.abortController.abort();
        task.deferredPromise?.reject(new VerificationTaskCancelledError(`Task ${task.taskId} was cancelled`));
        // If task was manually dequeued without an executor, free slot immediately:
        if (!task.executor) {
          this.activeTasks.delete(id);
          this.settledTasks.delete(id);
          this.checkBackpressure();
          this.dispatchNext();
        }
        // If task has an executor, its execution slot is preserved until the executor physically settles
        return true;
      }
    }

    return false;
  }

  public size(): number {
    return this.queue.length;
  }

  public activeCount(): number {
    return this.activeTasks.size;
  }

  public totalCount(): number {
    return this.queue.length + this.activeTasks.size;
  }

  /**
   * Returns true if the waiting-queue buffer is full.
   * Capacity semantics:
   * `capacity` configures waiting-queue capacity (the maximum number of pending tasks
   * buffered in queue awaiting an execution slot). Concurrently executing tasks
   * (up to `concurrencyLimit`) have been dequeued into physical execution slots
   * and do not count toward waiting-queue capacity.
   */
  public isFull(): boolean {
    return this.queue.length >= this.config.capacity;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getUtilizationPercent(): number {
    return (this.queue.length / this.config.capacity) * 100;
  }

  /**
   * Evaluates queue capacity against High and Low watermarks and emits PAUSE_UPSTREAM signals.
   */
  private checkBackpressure(): void {
    const utilization = this.getUtilizationPercent();

    if (utilization >= this.config.highWaterMarkPercent && !this.activeUpstreamPaused) {
      this.activeUpstreamPaused = true;
      if (this.eventBus) {
        this.eventBus.publish('verification.backpressure' as EventTopic, {
          pauseUpstream: true,
          utilizationPercent: utilization,
          queueLength: this.queue.length,
          timestamp: Date.now()
        });
      }
    } else if (utilization <= this.config.lowWaterMarkPercent && this.activeUpstreamPaused) {
      this.activeUpstreamPaused = false;
      if (this.eventBus) {
        this.eventBus.publish('verification.backpressure' as EventTopic, {
          pauseUpstream: false,
          utilizationPercent: utilization,
          queueLength: this.queue.length,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Gracefully drains the queue.
   * Stops accepting new tasks and waits for all queued tasks to be dispatched
   * and all active physical executors to settle.
   *
   * If any uncooperative executor ignores AbortSignals and does not settle
   * within `timeoutMs` (default: 5000ms), drain rejects with a
   * `VerificationTaskTimeoutError` documenting the remaining tasks,
   * rather than silently claiming that execution has stopped.
   *
   * @param timeoutMs Maximum time in milliseconds to wait for all tasks to settle. Default: 5000ms.
   * @throws {VerificationTaskTimeoutError} If tasks fail to settle within timeoutMs.
   */
  public async drain(timeoutMs: number = 5000): Promise<void> {
    this.isShuttingDown = true;
    const startTime = Date.now();
    const pollIntervalMs = 20;

    while (this.queue.length > 0 || this.activeTasks.size > 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        const activeIds = Array.from(this.activeTasks.keys()).join(', ');
        throw new VerificationTaskTimeoutError(
          `Verification queue drain timed out after ${timeoutMs}ms (${this.queue.length} queued, ${this.activeTasks.size} active tasks remaining: [${activeIds}])`
        );
      }
      await new Promise(resolve => setTimeout(resolve, Math.min(pollIntervalMs, timeoutMs - elapsed)));
    }
  }

  /**
   * Immediately shuts down the queue, rejecting queued tasks and aborting active tasks.
   */
  public shutdown(): void {
    this.isShuttingDown = true;

    // Clear all active timers
    for (const timer of this.timeoutHandles.values()) {
      clearTimeout(timer);
    }
    this.timeoutHandles.clear();

    // Reject all queued tasks
    for (const task of this.queue) {
      task.status = 'CANCELLED';
      this.settledTasks.add(task.taskId);
      task.abortController.abort();
      task.deferredPromise?.reject(new VerificationShutdownError('Verification queue is shutting down'));
    }
    this.queue = [];

    // Abort and reject active tasks
    for (const [id, task] of this.activeTasks.entries()) {
      if (!this.settledTasks.has(id)) {
        this.settledTasks.add(id);
        task.status = 'CANCELLED';
        task.abortController.abort();
        task.deferredPromise?.reject(new VerificationShutdownError('Verification queue is shutting down'));
      }
      // If task does not have an active executor, delete immediately
      if (!task.executor) {
        this.activeTasks.delete(id);
        this.settledTasks.delete(id);
      }
      // If task has an executor, its finally() block will delete it upon physical settlement
    }
    this.checkBackpressure();
  }
}
