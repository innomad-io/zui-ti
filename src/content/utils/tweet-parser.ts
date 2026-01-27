import type { ParsedTweet } from '@/shared/types';

// X 平台的 DOM 选择器（可能需要根据实际情况调整）
const SELECTORS = {
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  actionBar: '[role="group"]',
  replyButton: '[data-testid="reply"]',
  time: 'time',
};

export function parseTweet(tweetElement: Element): ParsedTweet {
  // 解析推文内容
  const contentEl = tweetElement.querySelector(SELECTORS.tweetText);
  const content = contentEl?.textContent || '';

  // 解析作者信息
  const userNameEl = tweetElement.querySelector(SELECTORS.userName);
  const authorLinks = userNameEl?.querySelectorAll('a') || [];
  
  let author = '';
  let authorHandle = '';
  
  for (const link of authorLinks) {
    const href = link.getAttribute('href');
    if (href?.startsWith('/') && !href.includes('/status/')) {
      authorHandle = href.slice(1).split('/')[0];
      // 获取显示名称
      if (!author) {
        author = link.textContent?.trim() || '';
      }
      break;
    }
  }

  // 解析时间戳
  const timeEl = tweetElement.querySelector(SELECTORS.time);
  const timestamp = timeEl?.getAttribute('datetime') || '';

  // 尝试获取推文 ID
  const tweetLink = tweetElement.querySelector('a[href*="/status/"]');
  const statusMatch = tweetLink?.getAttribute('href')?.match(/\/status\/(\d+)/);
  const id = statusMatch?.[1] || crypto.randomUUID();

  // 判断是否是回复
  const isReply = !!tweetElement.closest('[data-testid="reply"]') || 
                  content.startsWith('@') ||
                  !!tweetElement.querySelector('[data-testid="socialContext"]');

  return {
    id,
    content,
    author,
    authorHandle,
    timestamp,
    isReply,
    element: tweetElement,
  };
}

export function findTweets(container: Element | Document = document): Element[] {
  return Array.from(container.querySelectorAll(SELECTORS.tweet));
}

export function getActionBar(tweet: Element): Element | null {
  return tweet.querySelector(SELECTORS.actionBar);
}

export function getReplyButton(tweet: Element): Element | null {
  return tweet.querySelector(SELECTORS.replyButton);
}

export { SELECTORS };
