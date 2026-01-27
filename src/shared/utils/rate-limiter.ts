import type { SafetyConfig, SafetyLevel } from '../types';
import { SAFETY_PRESETS } from '../types';

const REPLY_HISTORY_KEY = 'zui-reply-history';

interface ReplyRecord {
  timestamp: number;
  tweetId?: string;
}

export class RateLimiter {
  private config: SafetyConfig;

  constructor(level: SafetyLevel = 'balanced', customConfig?: SafetyConfig) {
    this.config = customConfig || SAFETY_PRESETS[level];
  }

  async canReply(): Promise<{ allowed: boolean; waitTime?: number; repliesInLastHour: number }> {
    const history = await this.getHistory();
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // 清理过期记录
    const recentReplies = history.filter(r => r.timestamp > oneHourAgo);

    // 检查是否超过每小时限制
    if (recentReplies.length >= this.config.maxRepliesPerHour) {
      const oldestReply = recentReplies[0];
      return {
        allowed: false,
        waitTime: oldestReply.timestamp + 3600000 - now,
        repliesInLastHour: recentReplies.length,
      };
    }

    // 检查最小间隔
    const lastReply = recentReplies[recentReplies.length - 1];
    if (lastReply) {
      const elapsed = now - lastReply.timestamp;
      const minInterval = this.config.minIntervalSeconds * 1000;
      
      if (elapsed < minInterval) {
        return {
          allowed: false,
          waitTime: minInterval - elapsed,
          repliesInLastHour: recentReplies.length,
        };
      }
    }

    return {
      allowed: true,
      repliesInLastHour: recentReplies.length,
    };
  }

  async recordReply(tweetId?: string): Promise<void> {
    const history = await this.getHistory();
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // 只保留一小时内的记录
    const recentReplies = history.filter(r => r.timestamp > oneHourAgo);
    recentReplies.push({ timestamp: now, tweetId });

    await chrome.storage.local.set({ [REPLY_HISTORY_KEY]: recentReplies });
  }

  getRandomDelay(): number {
    const min = this.config.minIntervalSeconds * 1000;
    const max = this.config.maxIntervalSeconds * 1000;
    return Math.floor(Math.random() * (max - min) + min);
  }

  shouldRequireConfirm(): boolean {
    return this.config.requireManualConfirm;
  }

  shouldAddVariation(): boolean {
    return this.config.addRandomVariation;
  }

  private async getHistory(): Promise<ReplyRecord[]> {
    try {
      const result = await chrome.storage.local.get(REPLY_HISTORY_KEY);
      return result[REPLY_HISTORY_KEY] || [];
    } catch {
      return [];
    }
  }
}
