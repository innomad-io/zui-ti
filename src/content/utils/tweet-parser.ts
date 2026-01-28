import type { ParsedTweet } from '@/shared/types';

// X 平台的 DOM 选择器（可能需要根据实际情况调整）
const SELECTORS = {
  tweet: 'article[data-testid="tweet"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  actionBar: '[role="group"]',
  replyButton: '[data-testid="reply"]',
  time: 'time',
  articleTitle: '[data-testid="twitter-article-title"]',
  articleContent: '.public-DraftEditor-content',
  articleBlock: '[data-block="true"]',
  longformContent: '[class*="longform"]',
};

function extractArticleContent(container: Element): string {
  console.log('[ZuiTi] Attempting article extraction from:', container);
  
  const draftEditorContent = container.querySelector(SELECTORS.articleContent);
  console.log('[ZuiTi] Draft editor found:', !!draftEditorContent);
  
  if (draftEditorContent) {
    const fullText = draftEditorContent.textContent?.trim();
    console.log('[ZuiTi] Article full text length:', fullText?.length);
    
    if (fullText && fullText.length > 280) {
      console.log('[ZuiTi] Article content extracted (longer than tweet):', fullText.length, 'chars');
      return fullText;
    }
    
    const blocks = container.querySelectorAll(SELECTORS.articleBlock);
    console.log('[ZuiTi] Article blocks found:', blocks.length);
    const parts: string[] = [];
    
    blocks.forEach((block, index) => {
      const text = block.textContent?.trim();
      if (text) {
        console.log(`[ZuiTi] Block ${index} text (first 50 chars):`, text.substring(0, 50));
        parts.push(text);
      }
    });
    
    if (parts.length > 0) {
      const blockText = parts.join('\n\n');
      console.log('[ZuiTi] Extracted from blocks, length:', blockText.length);
      return blockText;
    }
  }
  
  const longformContent = container.querySelector(SELECTORS.longformContent);
  console.log('[ZuiTi] Longform content found:', !!longformContent);
  if (longformContent) {
    const text = longformContent.textContent?.trim();
    if (text) {
      console.log('[ZuiTi] Longform content length:', text.length);
      return text;
    }
  }
  
  console.log('[ZuiTi] No article content found, falling back to regular tweet');
  return '';
}

export function parseTweet(tweetElement: Element): ParsedTweet {
  console.log('[ZuiTi] ===== Starting tweet parse =====');
  console.log('[ZuiTi] Tweet element:', tweetElement);
  console.log('[ZuiTi] Element HTML (first 500 chars):', tweetElement.outerHTML.substring(0, 500));
  
  let content = '';
  
  const articleContent = extractArticleContent(tweetElement);
  if (articleContent) {
    content = articleContent;
  } else {
    const contentEl = tweetElement.querySelector(SELECTORS.tweetText);
    console.log('[ZuiTi] Regular tweet text element found:', !!contentEl);
    content = contentEl?.textContent || '';
    console.log('[ZuiTi] Regular tweet content length:', content.length);
  }

  const userNameEl = tweetElement.querySelector(SELECTORS.userName);
  console.log('[ZuiTi] User-Name element found:', !!userNameEl);
  console.log('[ZuiTi] User-Name HTML:', userNameEl?.outerHTML.substring(0, 200));
  
  let author = '';
  let authorHandle = '';
  
  const authorLink = tweetElement.querySelector(`${SELECTORS.userName} a[href*="/"]`) as HTMLAnchorElement;
  console.log('[ZuiTi] Author link found (scoped query):', !!authorLink);
  
  if (authorLink) {
    const href = authorLink.getAttribute('href');
    console.log('[ZuiTi] Author link href:', href);
    
    if (href) {
      authorHandle = href.split('/').filter(Boolean).pop() || '';
      author = authorLink.textContent?.trim() || '';
      console.log('[ZuiTi] ✓ Extracted - handle:', authorHandle, 'author:', author);
    }
  }
  
  if (!authorHandle) {
    console.log('[ZuiTi] Trying fallback: any link with href in User-Name section');
    const fallbackLinks = userNameEl?.querySelectorAll('a') || [];
    console.log('[ZuiTi] Fallback links found:', fallbackLinks.length);
    
    for (const link of fallbackLinks) {
      const href = link.getAttribute('href');
      console.log('[ZuiTi] Checking fallback link href:', href);
      if (href?.startsWith('/') && !href.includes('/status/') && !href.includes('/photo/')) {
        authorHandle = href.split('/').filter(Boolean).pop() || '';
        if (!author) {
          author = link.textContent?.trim() || '';
        }
        console.log('[ZuiTi] ✓ Extracted from fallback - handle:', authorHandle, 'author:', author);
        break;
      }
    }
  }
  
  if (!authorHandle) {
    console.warn('[ZuiTi] ⚠️ Failed to extract author handle!');
  }

  const timeEl = tweetElement.querySelector(SELECTORS.time);
  const timestamp = timeEl?.getAttribute('datetime') || '';

  const tweetLink = tweetElement.querySelector('a[href*="/status/"]');
  const statusMatch = tweetLink?.getAttribute('href')?.match(/\/status\/(\d+)/);
  const id = statusMatch?.[1] || crypto.randomUUID();

  const isReply = !!tweetElement.closest('[data-testid="reply"]') || 
                  content.startsWith('@') ||
                  !!tweetElement.querySelector('[data-testid="socialContext"]');

  console.log('[ZuiTi Parser] ===== FINAL RESULT =====', {
    id,
    author,
    authorHandle,
    contentLength: content.length,
    contentPreview: content.substring(0, 100),
    isArticle: !!articleContent,
  });

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
