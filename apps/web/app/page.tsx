"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type JobStatus = "queued" | "running" | "succeeded" | "failed" | "canceled";

type JobRecord = {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  input: Record<string, unknown>;
  output?: {
    images: Array<{ url: string; content?: string }>;
  };
};

const stylePresets = ["Studio", "Cinematic", "Analog", "Soft Light"];
const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:2"];

export default function HomePage() {
  const [prompt, setPrompt] = useState("一间未来感工作室，氛围光线，极简风格");
  const [negativePrompt, setNegativePrompt] = useState("low quality, blurry");
  const [style, setStyle] = useState(stylePresets[0]);
  const [ratio, setRatio] = useState(aspectRatios[0]);
  const [seed, setSeed] = useState("");
  const [steps, setSteps] = useState(28);
  const [cfg, setCfg] = useState(6.5);
  const [count, setCount] = useState(2);
  const [currentJob, setCurrentJob] = useState<JobRecord | null>(null);
  const [history, setHistory] = useState<JobRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      prompt,
      negative_prompt: negativePrompt,
      style,
      aspect_ratio: ratio,
      seed: seed || "random",
      steps,
      cfg,
      n: count
    }),
    [prompt, negativePrompt, style, ratio, seed, steps, cfg, count]
  );

  const submitJob = async () => {
    setError(null);
    const response = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "txt2img", input: payload })
    });

    if (!response.ok) {
      setError("任务创建失败，请检查 API 服务是否启动。");
      return;
    }

    const job = (await response.json()) as JobRecord;
    setCurrentJob(job);
    setHistory((prev) => [job, ...prev]);
  };

  useEffect(() => {
    if (!currentJob) {
      return;
    }

    const timer = setInterval(async () => {
      const response = await fetch(`${API_BASE}/jobs/${currentJob.id}`);
      if (!response.ok) {
        setError("无法获取任务状态。");
        return;
      }
      const job = (await response.json()) as JobRecord;
      setCurrentJob(job);
      setHistory((prev) => {
        const exists = prev.find((item) => item.id === job.id);
        if (exists) {
          return prev.map((item) => (item.id === job.id ? job : item));
        }
        return [job, ...prev];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentJob]);

  const previews = currentJob?.output?.images ?? [];

  return (
    <div className="main-layout">
      <header className="topbar">
        <div className="brand">AI IMAGE STUDIO</div>
        <div className="small-muted">Project: Neon Workspace · Queue: {currentJob?.status ?? "idle"}</div>
        <button className="secondary-button" type="button">
          Export
        </button>
      </header>

      <aside className="panel">
        <div className="section-title">Tools</div>
        <div className="tools">
          {["Select", "Brush", "Mask", "Inpaint", "Outpaint", "Erase"].map((tool) => (
            <div className="tool-button" key={tool}>
              {tool}
            </div>
          ))}
        </div>
      </aside>

      <main className="canvas-area">
        <div className="canvas-frame">
          {previews.length === 0 ? (
            <div>
              <div className="section-title">Canvas Preview</div>
              <div className="small-muted">生成任务完成后将在此处加载结果图。</div>
            </div>
          ) : (
            <div className="preview-grid">
              {previews.map((item) => (
                <div className="preview-card" key={item.url}>
                  <img src={item.url} alt={item.content ?? "preview"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <aside className="panel right-panel">
        <div className="section-title">Generation</div>
        <div className="form-grid">
          <div className="input-group">
            <label>Prompt</label>
            <textarea rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </div>
          <div className="input-group">
            <label>Negative Prompt</label>
            <textarea rows={2} value={negativePrompt} onChange={(event) => setNegativePrompt(event.target.value)} />
          </div>
          <div className="input-group">
            <label>Style Preset</label>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              {stylePresets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Aspect Ratio</label>
            <select value={ratio} onChange={(event) => setRatio(event.target.value)}>
              {aspectRatios.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Seed</label>
            <input value={seed} onChange={(event) => setSeed(event.target.value)} placeholder="random" />
          </div>
          <div className="input-group">
            <label>Steps</label>
            <input
              type="number"
              min={10}
              max={60}
              value={steps}
              onChange={(event) => setSteps(Number(event.target.value))}
            />
          </div>
          <div className="input-group">
            <label>CFG</label>
            <input
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={cfg}
              onChange={(event) => setCfg(Number(event.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Images</label>
            <input
              type="number"
              min={1}
              max={4}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </div>
        </div>
        <div className="action-row">
          <button className="primary-button" type="button" onClick={submitJob}>
            Start Generation
          </button>
          <button className="secondary-button" type="button">
            Save Preset
          </button>
        </div>
        {error ? <p className="small-muted">{error}</p> : null}
      </aside>

      <section className="queue-bar">
        <div>
          <div className="section-title">Queue</div>
          {currentJob ? (
            <div className="queue-card">
              <div>{currentJob.type.toUpperCase()}</div>
              <div className="small-muted">{currentJob.status}</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${currentJob.progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="small-muted">暂无进行中的任务</div>
          )}
        </div>
        <div>
          <div className="section-title">History</div>
          {history.slice(0, 3).map((job) => (
            <div className="queue-card" key={job.id}>
              <div>{job.type.toUpperCase()}</div>
              <div className="small-muted">{job.status}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
