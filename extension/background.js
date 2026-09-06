// 认知翻译 · 划词即译（Chrome / Edge / Chromium）
// 选中文字 → 右键 → 打开公网翻译页并自动翻译
const HOST = "https://z9cwwf48w4-lab.github.io/cognitive-translate/";

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "ct-translate",
      title: "认知翻译：把这段话翻译成人话",
      contexts: ["selection"]
    }, () => void chrome.runtime.lastError);
  });
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "ct-translate" || !info.selectionText) return;
  const url = HOST + "?text=" + encodeURIComponent(info.selectionText);
  chrome.windows.create({ url, type: "popup", width: 580, height: 860, focused: true });
});
