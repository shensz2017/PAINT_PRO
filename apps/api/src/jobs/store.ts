import { JobRecord } from "./types";

export class JobStore {
  private readonly jobs = new Map<string, JobRecord>();

  create(job: JobRecord): void {
    this.jobs.set(job.id, job);
  }

  update(id: string, updater: (current: JobRecord) => JobRecord): JobRecord | undefined {
    const current = this.jobs.get(id);
    if (!current) {
      return undefined;
    }
    const next = updater(current);
    this.jobs.set(id, next);
    return next;
  }

  get(id: string): JobRecord | undefined {
    return this.jobs.get(id);
  }

  list(): JobRecord[] {
    return Array.from(this.jobs.values());
  }
}
