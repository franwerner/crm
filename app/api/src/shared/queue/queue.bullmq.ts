// BullMQ adapter — the ONLY file in this codebase that imports bullmq or ioredis.
// All other code enqueues via QueueProducer and consumes via WorkerRegistry.

import { Queue, Worker } from 'bullmq'
// BullMQ bundles its own ioredis internally. We use a standalone ioredis only for the
// ping health check; for BullMQ connections we pass the URL string so BullMQ creates
// its own ioredis instance internally and avoids cross-package type conflicts.
import IORedis from 'ioredis'
import type {
  JobHandler,
  JobOptions,
  QueueName,
  QueueProducer,
  ReconciliationJob,
  WorkerRegistry,
} from './queue'

export class BullMQAdapter implements QueueProducer, WorkerRegistry {
  // Standalone ioredis client used only for ping health checks.
  // BullMQ connections receive the URL string directly to avoid cross-package type mismatch.
  private readonly healthConn: IORedis
  private readonly redisUrl: string
  // BullMQ Queue instances keyed by queue name
  private readonly queues = new Map<QueueName, Queue>()
  // Active Worker instances (kept to prevent GC)
  private readonly workers: Worker[] = []

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl
    // Health-check connection: no retries and a short connect timeout so the
    // fail-fast ping at startup exits quickly when Redis is unreachable.
    this.healthConn = new IORedis(redisUrl, {
      maxRetriesPerRequest: 0,
      connectTimeout: 3000,
      // Disable reconnect retries for the health-check client.
      retryStrategy: () => null,
    })
  }

  /** Ping the Redis connection — used for fail-fast health checks at startup. */
  async ping(): Promise<void> {
    await this.healthConn.ping()
  }

  // QueueProducer -------------------------------------------------------

  async enqueue<T>(queue: QueueName, name: string, data: T, opts?: JobOptions): Promise<void> {
    const q = this.getOrCreateQueue(queue)
    await q.add(name, data, {
      attempts: opts?.attempts,
      backoff: opts?.backoff,
      delay: opts?.delay,
    })
  }

  // WorkerRegistry -------------------------------------------------------

  register<T>(queue: QueueName, handler: JobHandler<T>): void {
    const worker = new Worker<T>(
      queue,
      async (job) => {
        await handler({ id: job.id ?? '', name: job.name, data: job.data })
      },
      { connection: { url: this.redisUrl } },
    )
    this.workers.push(worker as Worker)
  }

  /**
   * Registers periodic reconciliation jobs (cron-style repeatable jobs via BullMQ).
   * Phase 0: contract + hook only — no concrete table logic yet (see Phases 1/2).
   */
  registerReconciliation(jobs: ReconciliationJob[]): void {
    // Phase 0 placeholder: reconciliation jobs are registered here in Phases 1/2.
    // The parameter is typed to lock down the contract early.
    void jobs
  }

  async start(): Promise<void> {
    // Workers begin processing the moment they are constructed.
    // This method exists as the explicit lifecycle boundary for the worker entrypoint.
    // Nothing more to do in Phase 0 (no handlers registered).
  }

  // Helpers -------------------------------------------------------------

  private getOrCreateQueue(name: QueueName): Queue {
    let q = this.queues.get(name)
    if (!q) {
      q = new Queue(name, { connection: { url: this.redisUrl } })
      this.queues.set(name, q)
    }
    return q
  }
}
