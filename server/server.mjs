// 认知翻译 · 极简后端代理（零依赖，Node 18+）
// 作用：把前端发的 messages 转发给 DeepSeek（或任意 OpenAI 兼容接口），
//       密钥只放在服务器环境变量里，不暴露给浏览器。
//
// 运行：  AI_API_KEY=sk-xxx node server/server.mjs
// 环境变量：AI_API_KEY（必填） AI_BASE（默认 https://api.deepseek.com） AI_MODEL（默认 deepseek-chat） PORT（默认 8787）
//
// 前端在「AI 设置 → 自有后端代理」填：http://你的服务器:8787/api/translate

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const KEY = process.env.AI_API_KEY || "";
const BASE = (process.env.AI_BASE || "https://api.deepseek.com").replace(/\/+$/, "");
const MODEL = process.env.AI_MODEL || "deepseek-chat";
const PORT = Number(process.env.PORT || 8787);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  if (req.url === "/api/translate" && req.method === "POST") {
    if (!KEY) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "服务器未配置 AI_API_KEY" }));
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { messages } = JSON.parse(body || "{}");
        if (!Array.isArray(messages)) throw new Error("缺少 messages");
        const up = await fetch(BASE + "/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
          body: JSON.stringify({ model: MODEL, messages, temperature: 0.4, max_tokens: 1600, response_format: { type: "json_object" } })
        });
        if (!up.ok) {
          const t = await up.text();
          res.writeHead(up.status, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "上游接口错误 " + up.status + " " + t.slice(0, 200) }));
        }
        const j = await up.json();
        const content = j?.choices?.[0]?.message?.content || "";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ content }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
      }
    });
    return;
  }

  // 静态文件：把本仓库 index.html 也一起服务，方便本地整站测试
  try {
    let p = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    p = path.join(ROOT, path.normalize(p));
    if (!p.startsWith(ROOT)) throw new Error("bad path");
    const file = await readFile(p);
    const ext = path.extname(p);
    const type = ext === ".html" ? "text/html; charset=utf-8" : ext === ".js" ? "text/javascript" : "text/plain";
    res.writeHead(200, { "Content-Type": type });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(PORT, () => console.log(`认知翻译后端代理已启动 http://127.0.0.1:${PORT}/api/translate（模型：${MODEL}）`));
