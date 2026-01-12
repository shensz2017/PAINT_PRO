import axios from "axios";

const API_BASE = process.env.API_BASE ?? "http://localhost:4000";

const poll = async () => {
  const response = await axios.get(`${API_BASE}/jobs`);
  const pending = response.data.filter(
    (job: { status: string }) => job.status === "queued" || job.status === "running"
  );

  if (pending.length > 0) {
    console.log(`Worker heartbeat: ${pending.length} active jobs`);
  } else {
    console.log("Worker heartbeat: idle");
  }
};

const start = async () => {
  console.log("AI Worker connected to", API_BASE);
  await poll();
  setInterval(poll, 5000);
};

start();
