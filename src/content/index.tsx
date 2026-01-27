import React from 'react';
import { createRoot } from 'react-dom/client';
import { TweetObserver, parseTweet, getActionBar } from './utils';
import { ReplyButton } from './components';

// 注入按钮到推文
function injectReplyButton(tweetElement: Element): void {
  const actionBar = getActionBar(tweetElement);
  if (!actionBar) return;

  // 创建按钮容器
  const container = document.createElement('div');
  container.className = 'zui-btn-container';
  
  // 找到合适的位置插入（在分享按钮之前）
  const shareButton = actionBar.querySelector('[data-testid="bookmark"]')?.parentElement;
  if (shareButton) {
    shareButton.before(container);
  } else {
    actionBar.appendChild(container);
  }

  // 解析推文数据
  const tweet = parseTweet(tweetElement);

  // 渲染 React 组件
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ReplyButton tweet={tweet} />
    </React.StrictMode>
  );
}

// 初始化
function init(): void {
  // 检查是否在 X 平台
  if (!window.location.hostname.includes('x.com') && 
      !window.location.hostname.includes('twitter.com')) {
    return;
  }

  console.log('X AI Reply Assistant: Content script loaded');

  // 创建观察器并开始监听
  const observer = new TweetObserver(injectReplyButton);
  observer.start();

  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    observer.stop();
  });
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
