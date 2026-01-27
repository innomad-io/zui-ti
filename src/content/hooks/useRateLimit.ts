import { useState, useEffect, useCallback } from 'react';
import type { RateLimitStatus } from '@/shared/types';

export function useRateLimit() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkLimit = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_RATE_LIMIT',
        payload: null,
      });
      setStatus(response as RateLimitStatus);
    } catch {
      setStatus(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkLimit();
    // 每分钟检查一次
    const interval = setInterval(checkLimit, 60000);
    return () => clearInterval(interval);
  }, [checkLimit]);

  const formatWaitTime = useCallback((ms?: number) => {
    if (!ms) return '';
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  }, []);

  return {
    status,
    isChecking,
    checkLimit,
    formatWaitTime,
    canReply: status?.allowed ?? true,
    waitTime: status?.waitTime,
    repliesInLastHour: status?.repliesInLastHour ?? 0,
  };
}
