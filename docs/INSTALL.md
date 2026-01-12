# AI Image Studio 本地安装与使用

## 环境要求
- Node.js 18+
- npm 9+

## 安装
```bash
cd /workspace/PAINT_PRO
npm install
```

## 启动 API（含 Mock 生成器）
```bash
npm run dev:api
```
API 默认运行在 `http://localhost:4000`，Swagger 文档位于 `http://localhost:4000/docs`。

## 启动 Web 前端
```bash
npm run dev:web
```
前端默认运行在 `http://localhost:3000`，并使用环境变量 `NEXT_PUBLIC_API_URL` 连接 API（默认指向 `http://localhost:4000`）。

## 启动 Worker（可选）
```bash
npm run dev -w apps/worker
```
Worker 目前用于模拟队列心跳，不影响基础 txt2img 流程。

## 使用说明
1. 打开 `http://localhost:3000`。
2. 在右侧面板输入提示词、选择比例等参数后点击 **Start Generation**。
3. 底部队列会展示进度，生成完成后主画布会显示结果图。

## Mock 生成说明
当前版本使用 Mock Provider，返回占位图（picsum）。后续可在 `apps/api/src/providers` 中替换真实推理接口实现。
