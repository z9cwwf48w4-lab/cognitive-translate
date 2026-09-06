# 后端代理部署说明（把 API Key 从浏览器移到服务器）

目前线上 GitHub Pages 是静态站，AI 主要靠“用户自带 Key、浏览器直连 DeepSeek”（原型方案）。
正式对外提供服务时，建议部署 `server/server.mjs`，把 Key 放在服务端环境变量。

## 方式 A：Render / Railway / Fly.io（零运维）

1. 仓库设置环境变量：
   - `AI_API_KEY=sk-xxx`（必填）
   - `AI_BASE=https://api.deepseek.com`（可选，可换成任意 OpenAI 兼容接口）
   - `AI_MODEL=deepseek-chat`（可选）
2. 启动命令：`node server/server.mjs`，端口 `8787`（或由平台注入的 `PORT`）。
3. 拿到公网地址后，在页面「AI 设置 → 自有后端代理」填：`https://你的域名/api/translate`。

## 方式 B：自己的 VPS（含 Docker）

```bash
AI_API_KEY=sk-xxx node server/server.mjs   # 或
docker run -d -p 8787:8787 -e AI_API_KEY=sk-xxx \
  -v $PWD/index.html:/app/index.html \
  -v $PWD/server:/app/server node:20 node /app/server/server.mjs
```

## 上线前的安全建议（按评审意见）

- 给 `/api/translate` 加限流（如每个 IP 每分钟 N 次）与用量配额，防止 Key 被刷爆。
- 可选加一层简单鉴权（登录或一次性 token），再把代理地址填到页面设置里。
- 保留页面“自有后端代理”模式：Key 只在服务端，前端不接触。

## 说明

- `server.mjs` 零依赖、约 70 行，只做两件事：转发 OpenAI 兼容的 chat/completions 请求；顺带提供静态文件。
- 前端逻辑不变：把 `messages` 发给代理，代理返回 `{content}`，由页面完成 JSON 解析与校验。
