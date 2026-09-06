# Chrome / Edge 应用商店上架清单

目前插件是「开发者可用」（开发者模式加载）。要让普通用户一键安装，需要上架商店。

## Chrome Web Store

1. 注册开发者账号：一次性 $5（[Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole)）。
2. 打包：把 `extension/` 压缩成 zip（包含 `manifest.json`、`background.js`）。
3. 图标：商店要求至少 128×128 图标（透明背景），可让 AI 生成后加入 `extension/icons/`，并在 manifest 里补 `icons` 字段。
4. 商店信息：
   - 名称：认知翻译 · 划词即译
   - 一句话简介：选中任何难懂的话，右键「认知翻译」，先告诉你卡在哪、再说人话。
   - 分类：生产工具 / Productivity。
   - 截图：至少 1 张（1280×800）。
5. 隐私说明（重点）：插件不收集任何内容；选中的文字只会发送到**用户自己**在网页里配置的模型服务商（如 DeepSeek）进行翻译；本产品无服务器、不存储数据。
6. 权限：只申请了 `contextMenus`，审核心得会快一些。
7. 提交审核：一般 1~3 天；通过后所有人可搜索安装。

## Edge Add-ons

流程类似（[partner.microsoft.com](https://partner.microsoft.com)），免费、无 $5 门槛，可优先发布验证。

## 上架后

安装用户右键菜单即出现「认知翻译」；点击后在弹出的公网页里翻译，公网页地址由 `background.js` 里的 `HOST` 常量决定（换域名时同步更新）。
