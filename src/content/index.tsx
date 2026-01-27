import React from 'react';
import { createRoot } from 'react-dom/client';
import { parseTweet } from './utils';
import { ReplyButton } from './components';

function observeReplyWindows(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        const replyToolbar = node.querySelector('[data-testid="toolBar"]') || 
                            (node.matches('[data-testid="toolBar"]') ? node : null);
        
        if (replyToolbar && !replyToolbar.querySelector('.zui-btn-container')) {
          const replyButton = replyToolbar.closest('[role="dialog"]')?.querySelector('[data-testid="tweetButton"]')?.parentElement;
          
          if (replyButton) {
            const replyDialog = replyToolbar.closest('[role="dialog"]');
            const originalTweet = replyDialog?.querySelector('article[data-testid="tweet"]');
            
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

  observeReplyWindows();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
