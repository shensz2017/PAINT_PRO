import { JobType } from "../jobs/types";

export interface MockGenerationResult {
  images: Array<{ url: string; content?: string }>;
}

export const buildMockResult = (jobType: JobType, seed: string): MockGenerationResult => {
  const label = `${jobType.toUpperCase()} preview`;
  const size = jobType === "upscale" ? "1024" : "768";
  return {
    images: [
      {
        url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`,
        content: label
      }
    ]
  };
};
