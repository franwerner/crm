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
import type { Logger } from '@shared/logger'

export class BullMQAdapter implements QueueProducer, WorkerRegistry {
  // Standalone ioredis client used only for ping health checks.
  // BullMQ connections receive the URL string directly to avoid cross-package type mismatch.
  private readonly healthConn: IORedis
  private readonly redisUrl: string
  // BullMQ Queue instances keyed by queue name
  private readonly queues = new Map<QueueName, Queue>()
  // Active Worker instances (kept to prevent GC)
  private readonly workers: Worker[] = []
  // Optional logger — provided by the worker process; absent in the API process.
  private readonly logger?: Logger

  constructor(redisUrl: string, logger?: Logger) {
    this.redisUrl = redisUrl
    this.logger = logger
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
   * Runs each reconciliation job once at worker startup (run-on-startup pattern).
   * Each job recovers stale/pending records from the durable DB store by re-enqueueing them.
   * Failures are isolated: one job's error does not affect others or the worker startup.
   * The jobs themselves handle internal logging; this method logs the scheduling boundary.
   */
  registerReconciliation(jobs: ReconciliationJob[]): void {
    for (const job of jobs) {
      this.logger?.info(`Scheduling reconciliation job at startup: ${job.name}`)
      // Fire-and-forget: do not await; do not block worker startup.
      // Each job's run() already wraps its logic in try/catch and logs internally.
      job.run().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        this.logger?.error({ err }, `Reconciliation job '${job.name}' threw unexpectedly: ${msg}`)
      })
    }
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
