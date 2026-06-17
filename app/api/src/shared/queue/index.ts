// Public barrel — only the port interfaces and types are exported by default.
// The concrete BullMQAdapter is NOT part of the default surface; import it directly
// from queue.bullmq.ts in composition roots (app.ts, worker.ts).

export type {
  JobHandler,
  JobOptions,
  Job,
  QueueName,
  QueueProducer,
  WorkerRegistry,
  ReconciliationJob,
} from './queue'
