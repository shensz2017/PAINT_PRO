import { describe, expect, it } from "vitest";
import { JobStore } from "../src/jobs/store";
import { JobRecord } from "../src/jobs/types";

const createJob = (id: string): JobRecord => ({
  id,
  type: "txt2img",
  status: "queued",
  progress: 0,
  input: {},
  createdAt: new Date().toISOString()
});

describe("JobStore", () => {
  it("creates and retrieves jobs", () => {
    const store = new JobStore();
    const job = createJob("job-1");

    store.create(job);

    expect(store.get("job-1")).toEqual(job);
  });

  it("updates jobs", () => {
    const store = new JobStore();
    const job = createJob("job-2");

    store.create(job);

    const updated = store.update("job-2", (current) => ({
      ...current,
      progress: 42
    }));

    expect(updated?.progress).toBe(42);
  });
});
