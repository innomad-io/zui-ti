import { findTweets, SELECTORS } from './tweet-parser';

type TweetCallback = (tweet: Element) => void;

export class TweetObserver {
  private observer: MutationObserver;
  private callback: TweetCallback;
  private processedTweets = new WeakSet<Element>();

  constructor(callback: TweetCallback) {
    this.callback = callback;
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  start(): void {
    // 处理已存在的推文
    this.processExistingTweets();

    // 监听 DOM 变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  stop(): void {
    this.observer.disconnect();
  }

  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          this.processNewTweets(node);
        }
      }
    }
  }

  private processExistingTweets(): void {
    const tweets = findTweets(document);
    for (const tweet of tweets) {
      this.processTweet(tweet);
    }
  }

  private processNewTweets(container: HTMLElement): void {
    // 检查容器本身是否是推文
    if (container.matches(SELECTORS.tweet)) {
      this.processTweet(container);
      return;
    }

    // 查找容器内的推文
    const tweets = findTweets(container);
    for (const tweet of tweets) {
      this.processTweet(tweet);
    }
  }

  private processTweet(tweet: Element): void {
    // 避免重复处理
    if (this.processedTweets.has(tweet)) {
      return;
    }

    // 检查是否已经注入过按钮
    if (tweet.querySelector('.zui-reply-btn')) {
      return;
    }

    this.processedTweets.add(tweet);
    this.callback(tweet);
  }
}
