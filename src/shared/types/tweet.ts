export interface ParsedTweet {
  id: string;
  content: string;
  author: string;
  authorHandle: string;
  timestamp: string;
  isReply: boolean;
  parentTweet?: ParsedTweet;
  mediaUrls?: string[];
  element?: Element;
}
