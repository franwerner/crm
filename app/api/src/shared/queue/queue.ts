// Queue port — pure interfaces and types (no bullmq/ioredis imports here).
// The concrete adapter lives in queue.bullmq.ts (the only file allowed to import those libs).

/** Named queues declared for this application. */
export type QueueName = 'import' | 'enrich-llm'

/** Options forwarded to the underlying job engine. */
export interface JobOptions {
  /** Max delivery attempts (including the first). */
  attempts?: number
  /** Backoff strategy between retries. */
  backoff?: {
    type: 'exponential' | 'fixed'
    /** Delay in milliseconds. */
    delay: number
  }
  /** Delay before the job becomes eligible (ms). */
  delay?: number
}

/** Shape of a job as received by a handler. */
export interface Job<T> {
  id: string
  name: string
  data: T
}

/** Handler function signature — must be idempotent (retries are expected). */
export type JobHandler<T> = (job: Job<T>) => Promise<void>

/** Port for enqueueing jobs from the API process. */
export interface QueueProducer {
  enqueue<T>(queue: QueueName, name: string, data: T, opts?: JobOptions): Promise<void>
}

/** Port for registering consumers and starting the worker process. */
export interface WorkerRegistry {
  register<T>(queue: QueueName, handler: JobHandler<T>): void
  start(): Promise<void>
}

/** Contract for periodic reconciliation jobs (Phase 0 = placeholder; logic added in Phases 1/2). */
export interface ReconciliationJob {
  /** Unique name for the repeatable job. */
  name: string
  /** Re-enqueues pending/stuck records from the durable DB store. */
  run(): Promise<void>
}
