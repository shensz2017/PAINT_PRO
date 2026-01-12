import { v4 as uuidv4 } from "uuid";
import { JobRecord, JobStatus, JobType } from "./types";
import { JobStore } from "./store";
import { buildMockResult } from "../providers/mock";

const randomDuration = () => 3000 + Math.floor(Math.random() * 4000);

export class JobService {
  private readonly timers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly store: JobStore) {}

  createJob(type: JobType, input: Record<string, unknown>): JobRecord {
    const id = uuidv4();
    const now = new Date().toISOString();
    const job: JobRecord = {
      id,
      type,
      status: "queued",
      progress: 0,
      input,
      createdAt: now
    };

    this.store.create(job);
    this.startJob(id);
    return job;
  }

  cancelJob(id: string): JobRecord | undefined {
    const current = this.store.get(id);
    if (!current || current.status === "succeeded" || current.status === "failed") {
      return current;
    }
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
    return this.store.update(id, (job) => ({
      ...job,
      status: "canceled",
      finishedAt: new Date().toISOString()
    }));
  }

  getJob(id: string): JobRecord | undefined {
    return this.store.get(id);
  }

  listJobs(): JobRecord[] {
    return this.store.list();
  }

  private startJob(id: string): void {
    const duration = randomDuration();
    const interval = 500;
    const steps = Math.ceil(duration / interval);
    let tick = 0;

    this.store.update(id, (job) => ({
      ...job,
      status: "running",
      startedAt: new Date().toISOString()
    }));

    const timer = setInterval(() => {
      tick += 1;
      const progress = Math.min(100, Math.round((tick / steps) * 100));
      const status: JobStatus = progress >= 100 ? "succeeded" : "running";

      const next = this.store.update(id, (job) => {
        if (job.status === "canceled") {
          return job;
        }
        return {
          ...job,
          status,
          progress,
          output: progress >= 100 ? buildMockResult(job.type, job.id) : job.output,
          finishedAt: progress >= 100 ? new Date().toISOString() : job.finishedAt
        };
      });

      if (!next || next.status === "canceled" || status === "succeeded") {
        clearInterval(timer);
        this.timers.delete(id);
      }
    }, interval);

    this.timers.set(id, timer);
  }
}
