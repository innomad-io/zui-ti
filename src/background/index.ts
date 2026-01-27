import { handleMessage } from './message-handler';

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener(handleMessage);

// 扩展安装/更新时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装，打开设置页面
    chrome.runtime.openOptionsPage();
  }
});

console.log('ZuiTi background service started');
