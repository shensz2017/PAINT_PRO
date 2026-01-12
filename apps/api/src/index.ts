import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";
import { JobService } from "./jobs/service";
import { JobStore } from "./jobs/store";
import { JobType } from "./jobs/types";
import { openapiSpec } from "./openapi";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const store = new JobStore();
const service = new JobService(store);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * @openapi
 * /jobs:
 *   post:
 *     summary: Create a new generation or edit job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [txt2img, img2img, inpaint, outpaint, upscale, bgremove]
 *               input:
 *                 type: object
 *     responses:
 *       201:
 *         description: Job created
 */
app.post("/jobs", (req, res) => {
  const schema = z.object({
    type: z.enum(["txt2img", "img2img", "inpaint", "outpaint", "upscale", "bgremove"]),
    input: z.record(z.unknown()).default({})
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const job = service.createJob(parsed.data.type as JobType, parsed.data.input);
  return res.status(201).json(job);
});

/**
 * @openapi
 * /jobs:
 *   get:
 *     summary: List jobs
 *     responses:
 *       200:
 *         description: Job list
 */
app.get("/jobs", (_req, res) => {
  res.json(service.listJobs());
});

/**
 * @openapi
 * /jobs/{id}:
 *   get:
 *     summary: Get job status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Not found
 */
app.get("/jobs/:id", (req, res) => {
  const job = service.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  return res.json(job);
});

/**
 * @openapi
 * /jobs/{id}/cancel:
 *   post:
 *     summary: Cancel a job
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job canceled
 *       404:
 *         description: Not found
 */
app.post("/jobs/:id/cancel", (req, res) => {
  const job = service.cancelJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  return res.json(job);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
