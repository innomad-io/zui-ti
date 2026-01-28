import React from 'react';
import { createRoot } from 'react-dom/client';
import { parseTweet } from './utils';
import { ReplyButton } from './components';

let lastClickedArticle: Element | null = null;

function captureArticleOnReplyClick(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    const replyButton = target.closest('[data-testid="reply"]') || 
                       target.closest('button[data-testid="reply"]');
    
    if (replyButton) {
      let currentElement: Element | null = replyButton;
      while (currentElement) {
        if (currentElement.tagName === 'ARTICLE' && 
            currentElement.getAttribute('data-testid') === 'tweet') {
          lastClickedArticle = currentElement;
          console.log('[ZuiTi Inject] ✓ Captured article at reply click');
          break;
        }
        currentElement = currentElement.parentElement;
      }
    }
  }, true);
}

function observeReplyWindows(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        const replyToolbar = node.querySelector('[data-testid="toolBar"]') || 
                            (node.matches('[data-testid="toolBar"]') ? node : null);
        
        if (replyToolbar && !replyToolbar.querySelector('.zui-btn-container')) {
          console.log('[ZuiTi Inject] ===== TOOLBAR DETECTED =====');
          console.log('[ZuiTi Inject] Current URL:', window.location.href);
          
          const replyButton = replyToolbar.closest('[role="dialog"]')?.querySelector('[data-testid="tweetButton"]')?.parentElement;
          
          if (replyButton) {
            const replyDialog = replyToolbar.closest('[role="dialog"]');
            console.log('[ZuiTi Inject] Reply dialog found:', !!replyDialog);
            
            let originalTweet = lastClickedArticle;
            console.log('[ZuiTi Inject] Using cached article from click:', !!originalTweet);
            
            if (!originalTweet) {
              console.log('[ZuiTi Inject] Fallback: Searching document for article[data-testid="tweet"]...');
              originalTweet = document.querySelector('article[data-testid="tweet"]');
              console.log('[ZuiTi Inject] Found with article[data-testid="tweet"]:', !!originalTweet);
            }
            
            if (!originalTweet) {
              console.log('[ZuiTi Inject] Fallback 2: Trying all articles on page...');
              const allArticles = document.querySelectorAll('article');
              console.log('[ZuiTi Inject] Total articles found:', allArticles?.length);
              
              allArticles?.forEach((art, idx) => {
                const testId = art.getAttribute('data-testid');
                const hasUserName = !!art.querySelector('[data-testid="User-Name"]');
                const hasContent = !!art.querySelector('[data-testid="tweetText"]');
                const hasDraftEditor = !!art.querySelector('.public-DraftEditor-content');
                console.log(`[ZuiTi Inject] Article ${idx}:`, {
                  testId,
                  hasUserName,
                  hasContent,
                  hasDraftEditor
                });
              });
              
              if (allArticles && allArticles.length > 0) {
                originalTweet = allArticles[0];
                console.log('[ZuiTi Inject] Using first article element');
              }
            }
            
            if (originalTweet) {
              const tweet = parseTweet(originalTweet);
              
              const container = document.createElement('div');
              container.className = 'zui-btn-container';
              
              replyButton.before(container);
              
              const root = createRoot(container);
              root.render(
                <React.StrictMode>
                  <ReplyButton tweet={tweet} />
                </React.StrictMode>
              );
            } else {
              console.error('[ZuiTi Inject] ❌ Could not find tweet element - trying with 200ms delay...');
              
              setTimeout(() => {
                console.log('[ZuiTi Inject] === DELAYED SEARCH (200ms) ===');
                let delayedTweet = lastClickedArticle;
                
                if (!delayedTweet) {
                  delayedTweet = document.querySelector('article[data-testid="tweet"]');
                }
                
                if (!delayedTweet) {
                  const allArticles = document.querySelectorAll('article');
                  console.log('[ZuiTi Inject] Delayed: Total articles:', allArticles?.length);
                  
                  if (allArticles && allArticles.length > 0) {
                    delayedTweet = allArticles[0];
                  }
                }
                
                if (delayedTweet) {
                  console.log('[ZuiTi Inject] ✓ Found with delay, parsing...');
                  const tweet = parseTweet(delayedTweet);
                  
                  const container = document.createElement('div');
                  container.className = 'zui-btn-container';
                  
                  replyButton.before(container);
                  
                  const root = createRoot(container);
                  root.render(
                    <React.StrictMode>
                      <ReplyButton tweet={tweet} />
                    </React.StrictMode>
                  );
                } else {
                  console.error('[ZuiTi Inject] ❌ Still no tweet element after 200ms delay!');
                }
              }, 200);
            }
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function init(): void {
  if (!window.location.hostname.includes('x.com') && 
      !window.location.hostname.includes('twitter.com')) {
    return;
  }

  console.log('ZuiTi: Content script loaded');

  captureArticleOnReplyClick();
  observeReplyWindows();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
