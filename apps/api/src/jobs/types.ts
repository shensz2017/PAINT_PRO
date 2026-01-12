export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

export type JobType = "txt2img" | "img2img" | "inpaint" | "outpaint" | "upscale" | "bgremove";

export interface JobRecord {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  input: Record<string, unknown>;
  output?: {
    images: Array<{ url: string; content?: string }>;
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}
