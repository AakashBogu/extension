import { describe, it, expect, vi } from 'vitest';
import { VerificationQueue } from '../core/verification/queue/VerificationQueue';
import { SanitizedVerificationRequest } from '../core/verification/VerificationTypes';
import {
  VerificationQueueFullError,
  VerificationShutdownError,
  VerificationTaskTimeoutError,
  VerificationTaskCancelledError
} from '../core/error/VerificationErrors';
import { EventBus } from '../core/events/EventBus';

describe('VerificationQueue', () => {
  const dummyRequest = (id: string, text?: string): SanitizedVerificationRequest => {
    const claimText = text || `Test Claim Text ${id}`;
    return {
      claimId: id,
      claimText,
      normalizedText: claimText.toLowerCase(),
      classification: ['FACTUAL'],
      verifiability: 'HIGH',
      priority: 'MEDIUM',
      entities: [],
      confidence: 0.8,
      createdAt: Date.now()
    };
  };

  it('enqueues tasks in priority order', () => {
    const queue = new VerificationQueue({ capacity: 10 });
    queue.enqueue(dummyRequest('req_low'), 1);
    queue.enqueue(dummyRequest('req_high'), 4);
    queue.enqueue(dummyRequest('req_med'), 2);

    expect(queue.size()).toBe(3);
    const first = queue.dequeue();
    expect(first?.claim.claimId).toBe('req_high');
    const second = queue.dequeue();
    expect(second?.claim.claimId).toBe('req_med');
    const third = queue.dequeue();
    expect(third?.claim.claimId).toBe('req_low');
  });

  it('enforces REJECT_NEW capacity limits throwing VerificationQueueFullError', () => {
    const queue = new VerificationQueue({ capacity: 2 });
    queue.enqueue(dummyRequest('req_1'));
    queue.enqueue(dummyRequest('req_2'));

    expect(() => queue.enqueue(dummyRequest('req_3'))).toThrow(VerificationQueueFullError);
    expect(queue.size()).toBe(2);
  });

  it('emits PAUSE_UPSTREAM signal when high water mark capacity is exceeded', () => {
    const eventBus = new EventBus();
    const publishSpy = vi.spyOn(eventBus, 'publish');
    const queue = new VerificationQueue({ capacity: 5, highWaterMarkPercent: 80 }, eventBus);

    queue.enqueue(dummyRequest('req_1')); // 20%
    queue.enqueue(dummyRequest('req_2')); // 40%
    queue.enqueue(dummyRequest('req_3')); // 60%
    queue.enqueue(dummyRequest('req_4')); // 80% -> Triggers PAUSE_UPSTREAM

    expect(publishSpy).toHaveBeenCalledWith('verification.backpressure', expect.objectContaining({
      pauseUpstream: true
    }));
  });

  it('cancels queued or active task', () => {
    const queue = new VerificationQueue({ capacity: 5 });
    const task = queue.enqueue(dummyRequest('req_cancel'));
    expect(queue.size()).toBe(1);

    const cancelled = queue.cancelTask(task.taskId);
    expect(cancelled).toBe(true);
    expect(queue.size()).toBe(0);
  });

  it('shuts down cleanly rejecting enqueue attempts', () => {
    const queue = new VerificationQueue({ capacity: 5 });
    queue.enqueue(dummyRequest('req_1'));
    queue.shutdown();

    expect(() => queue.enqueue(dummyRequest('req_2'))).toThrow(VerificationShutdownError);
    expect(queue.size()).toBe(0);
  });

  it('enforces concurrencyLimit when executing concurrent tasks', async () => {
    const queue = new VerificationQueue({ capacity: 10, concurrencyLimit: 2 });
    let maxConcurrent = 0;
    let currentlyRunning = 0;

    const runTask = async () => {
      currentlyRunning++;
      maxConcurrent = Math.max(maxConcurrent, currentlyRunning);
      await new Promise(res => setTimeout(res, 20));
      currentlyRunning--;
      return 'done';
    };

    const promises = [
      queue.execute(dummyRequest('t1'), 2, 5000, runTask),
      queue.execute(dummyRequest('t2'), 2, 5000, runTask),
      queue.execute(dummyRequest('t3'), 2, 5000, runTask),
      queue.execute(dummyRequest('t4'), 2, 5000, runTask)
    ];

    const results = await Promise.all(promises);
    expect(results).toEqual(['done', 'done', 'done', 'done']);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(queue.activeCount()).toBe(0);
    expect(queue.size()).toBe(0);
  });

  it('actively enforces task timeoutMs rejecting with VerificationTaskTimeoutError', async () => {
    const queue = new VerificationQueue({ capacity: 5, defaultTaskTimeoutMs: 50 });

    const slowTask = async () => {
      await new Promise(res => setTimeout(res, 200));
      return 'slow_result';
    };

    await expect(
      queue.execute(dummyRequest('timeout_claim'), 2, 50, slowTask)
    ).rejects.toThrow('timed out');
  });

  it('drains active and queued tasks cleanly without deadlocking', async () => {
    const queue = new VerificationQueue({ capacity: 10, concurrencyLimit: 2 });

    let completed = 0;
    const taskFn = async () => {
      await new Promise(res => setTimeout(res, 15));
      completed++;
      return 'ok';
    };

    queue.execute(dummyRequest('d1'), 2, 1000, taskFn);
    queue.execute(dummyRequest('d2'), 2, 1000, taskFn);
    queue.execute(dummyRequest('d3'), 2, 1000, taskFn);

    await queue.drain();
    expect(completed).toBe(3);
    expect(queue.totalCount()).toBe(0);
  });

  it('preserves concurrency limit during cancellation until executor actually settles', async () => {
    const queue = new VerificationQueue({ capacity: 5, concurrencyLimit: 1 });
    let task1Settled = false;
    let task2StartedWhileTask1Running = false;
    let currentlyRunning = 0;
    let maxRunning = 0;

    let resolveTask1: () => void;
    const task1Promise = new Promise<void>(resolve => {
      resolveTask1 = resolve;
    });

    const task1Fn = async () => {
      currentlyRunning++;
      maxRunning = Math.max(maxRunning, currentlyRunning);
      await task1Promise;
      currentlyRunning--;
      task1Settled = true;
      return 't1_result';
    };

    const task2Fn = async () => {
      if (!task1Settled) {
        task2StartedWhileTask1Running = true;
      }
      currentlyRunning++;
      maxRunning = Math.max(maxRunning, currentlyRunning);
      await new Promise(res => setTimeout(res, 20));
      currentlyRunning--;
      return 't2_result';
    };

    const req1 = dummyRequest('cancel_concurrent_1');
    const req2 = dummyRequest('cancel_concurrent_2');

    const p1 = queue.execute(req1, 2, 5000, task1Fn);
    const p2 = queue.execute(req2, 2, 5000, task2Fn);

    // Yield to allow task1 to be dispatched into ACTIVE state
    await new Promise(res => setTimeout(res, 10));
    expect(currentlyRunning).toBe(1);

    // Cancel task 1 while its executor is still running
    const cancelled = queue.cancelTask(req1.normalizedText);
    expect(cancelled).toBe(true);

    // Caller of task 1 should receive rejection immediately
    await expect(p1).rejects.toThrow(VerificationTaskCancelledError);

    // Concurrency limit check: Task 2 must NOT have started yet because task 1 executor has not settled
    await new Promise(res => setTimeout(res, 20));
    expect(task2StartedWhileTask1Running).toBe(false);
    expect(currentlyRunning).toBe(1); // Task 1 executor is still physically running

    // Now let task 1 executor physically settle
    resolveTask1!();
    const res2 = await p2;
    expect(res2).toBe('t2_result');
    expect(task2StartedWhileTask1Running).toBe(false);
    expect(maxRunning).toBe(1);
    expect(queue.activeCount()).toBe(0);
    expect(queue.totalCount()).toBe(0);
  });

  it('ensures idempotent settlement and preserves EXPIRED status upon late executor completion', async () => {
    const queue = new VerificationQueue({ capacity: 5, concurrencyLimit: 1, defaultTaskTimeoutMs: 30 });
    let lateExecutorResolved = false;

    const slowTask = async () => {
      await new Promise(res => setTimeout(res, 80));
      lateExecutorResolved = true;
      return 'late_value';
    };

    const req = dummyRequest('late_completion');
    const p = queue.execute(req, 2, 30, slowTask);

    // Deferred promise rejects at timeoutMs (30ms)
    await expect(p).rejects.toThrow(VerificationTaskTimeoutError);

    // Between 30ms and 80ms, executor is still running, so slot is retained
    expect(queue.activeCount()).toBe(1);

    // Wait for the late executor to physically complete
    await new Promise(res => setTimeout(res, 90));
    expect(lateExecutorResolved).toBe(true);

    // Queue accounting cleanly recovered to 0 without corrupting terminal state
    expect(queue.activeCount()).toBe(0);
    expect(queue.size()).toBe(0);
    expect(queue.totalCount()).toBe(0);

    // Subsequent task executes cleanly without duplicate settlement or accounting bugs
    const result = await queue.execute(dummyRequest('subsequent'), 2, 1000, async () => 'clean');
    expect(result).toBe('clean');
  });

  it('ensures idempotent settlement and preserves CANCELLED status upon late executor rejection', async () => {
    const queue = new VerificationQueue({ capacity: 5, concurrencyLimit: 1 });
    let executorFailed = false;

    let rejectExecutor: (err: Error) => void;
    const slowTask = async () => {
      await new Promise((_, rej) => {
        rejectExecutor = rej;
      });
      return 'never';
    };

    const req = dummyRequest('late_rejection');
    const p = queue.execute(req, 2, 5000, slowTask);

    await new Promise(res => setTimeout(res, 10));
    const cancelled = queue.cancelTask(req.normalizedText);
    expect(cancelled).toBe(true);

    await expect(p).rejects.toThrow(VerificationTaskCancelledError);
    expect(queue.activeCount()).toBe(1); // Slot still physically retained

    // Late rejection by the executor
    rejectExecutor!(new Error('late executor network failure'));
    executorFailed = true;

    await new Promise(res => setTimeout(res, 20));
    expect(executorFailed).toBe(true);
    expect(queue.activeCount()).toBe(0);
    expect(queue.totalCount()).toBe(0);
  });

  it('handles shutdown with a still-running executor and cleans up upon physical settlement', async () => {
    const queue = new VerificationQueue({ capacity: 5, concurrencyLimit: 1 });
    let executorFinished = false;

    let finishExecutor: () => void;
    const task1 = async () => {
      await new Promise<void>(res => {
        finishExecutor = res;
      });
      executorFinished = true;
      return 'done';
    };

    const req1 = dummyRequest('shutdown_active');
    const req2 = dummyRequest('shutdown_queued');

    const p1 = queue.execute(req1, 2, 5000, task1);
    const p2 = queue.execute(req2, 2, 5000, async () => 'should_not_run');

    await new Promise(res => setTimeout(res, 10));
    expect(queue.activeCount()).toBe(1);
    expect(queue.size()).toBe(1);

    queue.shutdown();

    // Queued task rejected immediately
    await expect(p2).rejects.toThrow(VerificationShutdownError);
    // Active task rejected immediately
    await expect(p1).rejects.toThrow(VerificationShutdownError);

    expect(queue.size()).toBe(0);
    expect(queue.activeCount()).toBe(1); // Executor still running physically

    // Now executor settles
    finishExecutor!();
    await new Promise(res => setTimeout(res, 20));

    expect(executorFinished).toBe(true);
    expect(queue.activeCount()).toBe(0);
    expect(queue.totalCount()).toBe(0);
  });

  it('rejects drain with VerificationTaskTimeoutError when an uncooperative executor ignores abort', async () => {
    const queue = new VerificationQueue({ capacity: 5, concurrencyLimit: 1 });

    // An executor that never settles and ignores abort signals
    const uncooperativeExecutor = () => new Promise<never>(() => {});

    queue.execute(dummyRequest('stuck_claim'), 2, 5000, uncooperativeExecutor);

    await new Promise(res => setTimeout(res, 10));
    expect(queue.activeCount()).toBe(1);

    // Bounded drain with 60ms timeout
    await expect(queue.drain(60)).rejects.toThrow(VerificationTaskTimeoutError);
    await expect(queue.drain(60)).rejects.toThrow(/Verification queue drain timed out after 60ms/);
  });

  it('enforces waiting-queue capacity semantics independently of active execution slots', async () => {
    // capacity: 2 waiting tasks, concurrencyLimit: 1 active worker slot
    const queue = new VerificationQueue({ capacity: 2, concurrencyLimit: 1 });
    let releaseActiveTask: () => void;

    const blockingTask = async () => {
      await new Promise<void>(res => {
        releaseActiveTask = res;
      });
      return 'active_done';
    };

    // Task 1 is dispatched immediately and moves to activeTasks
    const p1 = queue.execute(dummyRequest('active_1'), 2, 5000, blockingTask);
    await new Promise(res => setTimeout(res, 10));

    expect(queue.activeCount()).toBe(1);
    expect(queue.size()).toBe(0); // Waiting queue is empty

    // Enqueue 2 waiting tasks (fills waiting buffer to capacity = 2)
    const t2 = queue.enqueue(dummyRequest('queued_2'));
    queue.enqueue(dummyRequest('queued_3'));

    expect(queue.size()).toBe(2);
    expect(queue.isFull()).toBe(true);
    expect(queue.totalCount()).toBe(3); // 1 active + 2 queued

    // 4th task must be rejected because waiting-queue buffer is at capacity (2/2)
    expect(() => queue.enqueue(dummyRequest('queued_4'))).toThrow(VerificationQueueFullError);

    // Release Task 1: finishes active execution
    releaseActiveTask!();
    await p1;

    // After task 1 finishes, task 2 or manual dequeue frees a waiting slot
    const dequeued = queue.dequeue();
    expect(dequeued?.taskId).toBe(t2.taskId);
    expect(queue.size()).toBe(1);
    expect(queue.isFull()).toBe(false);

    // Can now enqueue another task into the freed waiting buffer slot
    const t5 = queue.enqueue(dummyRequest('queued_5'));
    expect(t5.taskId).toBeDefined();
    expect(queue.size()).toBe(2);
    expect(queue.isFull()).toBe(true);
  });
});
