import { handleMessage } from './message-handler';
import { getSettings, saveSettings } from '@/shared/utils/storage';

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener(handleMessage);

// 扩展安装/更新时的初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // 首次安装，打开设置页面
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    // 更新时，迁移旧配置：强制使用 API Key 模式
    await migrateToApiKeyMode();
  }
});

// 后台服务启动时也执行迁移（防止用户跳过更新流程）
migrateToApiKeyMode().catch(console.error);

// 迁移函数：将 OAuth 模式切换为 API Key 模式
async function migrateToApiKeyMode() {
  try {
    const settings = await getSettings();
    
    // 如果当前是 OAuth 模式，强制切换为 API Key 模式
    if (settings.ai.geminiAuthType === 'oauth') {
      console.log('[Migration] Detected OAuth mode, migrating to API Key mode...');
      await saveSettings({
        ai: {
          ...settings.ai,
          geminiAuthType: 'apiKey',
          geminiOAuthToken: undefined, // 清除 OAuth token
        },
      });
      console.log('[Migration] Successfully migrated to API Key mode');
    }
  } catch (err) {
    console.error('[Migration] Failed to migrate settings:', err);
  }
}

console.log('ZuiTi background service started');
