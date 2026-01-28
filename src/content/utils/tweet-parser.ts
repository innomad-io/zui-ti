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
  // 对话框相关选择器
  dialog: '[role="dialog"]',
  replyingToButton: 'button',
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

  // Content fallback: 如果当前 article 没有内容，尝试从主页面的 article 提取
  if (!content || content.length < 50) {
    console.log('[ZuiTi] Content fallback: trying main page article');
    const mainArticle = document.querySelector('main article[data-testid="tweet"]');
    if (mainArticle && mainArticle !== tweetElement) {
      const mainContent = extractArticleContent(mainArticle);
      if (mainContent && mainContent.length > content.length) {
        content = mainContent;
        console.log('[ZuiTi] ✓ Got content from main page article:', content.length, 'chars');
      } else {
        const mainTweetText = mainArticle.querySelector(SELECTORS.tweetText);
        if (mainTweetText && mainTweetText.textContent) {
          const mainText = mainTweetText.textContent;
          if (mainText.length > content.length) {
            content = mainText;
            console.log('[ZuiTi] ✓ Got tweetText from main page article:', content.length, 'chars');
          }
        }
      }
    }
  }

  // Content fallback 2: 从对话框内 article 的 textContent 提取预览
  if (!content || content.length < 50) {
    console.log('[ZuiTi] Content fallback 2: trying dialog article textContent');
    const dialog = document.querySelector(SELECTORS.dialog);
    if (dialog) {
      const dialogArticle = dialog.querySelector('article');
      if (dialogArticle) {
        const fullText = dialogArticle.textContent || '';
        // 过滤掉常见的 UI 文本
        const cleanedText = fullText
          .replace(/Kevin Ma|@\w+|·|\d+h|\d+m|Article|Replying to/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanedText.length > content.length) {
          content = cleanedText;
          console.log('[ZuiTi] ✓ Got content from dialog article textContent:', content.length, 'chars');
        }
      }
    }
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
  
  // Fallback 2: 从对话框的 "Replying to @username" 按钮提取
  if (!authorHandle) {
    console.log('[ZuiTi] Trying fallback 2: Replying to button in dialog');
    const dialog = document.querySelector(SELECTORS.dialog);
    if (dialog) {
      const buttons = dialog.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent || '';
        const match = text.match(/Replying to @(\w+)/);
        if (match) {
          authorHandle = match[1];
          console.log('[ZuiTi] ✓ Extracted from Replying to button:', authorHandle);
          break;
        }
      }
    }
  }

  // Fallback 3: 从对话框内的任意用户链接提取
  if (!authorHandle) {
    console.log('[ZuiTi] Trying fallback 3: Any user link in dialog');
    const dialog = document.querySelector(SELECTORS.dialog);
    if (dialog) {
      const userLinks = dialog.querySelectorAll('a[href^="/"]');
      for (const link of userLinks) {
        const href = link.getAttribute('href') || '';
        // 排除非用户链接
        if (href.includes('/status/') || href.includes('/home') || 
            href.includes('/compose') || href.includes('/i/')) {
          continue;
        }
        const parts = href.split('/').filter(Boolean);
        if (parts.length === 1) {
          authorHandle = parts[0];
          if (!author) {
            author = link.textContent?.trim() || '';
          }
          console.log('[ZuiTi] ✓ Extracted from dialog link:', authorHandle);
          break;
        }
      }
    }
  }

  // Fallback 4: 从 URL 提取（适用于单条推文页面）
  if (!authorHandle) {
    console.log('[ZuiTi] Trying fallback 4: URL extraction');
    const urlMatch = window.location.pathname.match(/^\/(\w+)\/status\/\d+/);
    if (urlMatch) {
      authorHandle = urlMatch[1];
      console.log('[ZuiTi] ✓ Extracted from URL:', authorHandle);
    }
  }

  if (!authorHandle) {
    console.warn('[ZuiTi] ⚠️ Failed to extract author handle after all fallbacks!');
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
