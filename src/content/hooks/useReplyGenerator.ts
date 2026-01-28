import { useState, useCallback } from 'react';
import type { GenerateReplyRequest, ReplyStyleId } from '@/shared/types';

interface UseReplyGeneratorOptions {
  onSuccess?: (reply: string, alternatives?: string[]) => void;
  onError?: (error: string) => void;
}

interface GenerateOptions {
  tweetContent: string;
  tweetAuthor: string;
  style: ReplyStyleId;
  customPrompt?: string;
  maxLength?: number;
  context?: string;
}

export function useReplyGenerator(options: UseReplyGeneratorOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requireConfirm, setRequireConfirm] = useState(false);

  const generate = useCallback(async (opts: GenerateOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateReplyRequest = {
        tweetContent: opts.tweetContent,
        tweetAuthor: opts.tweetAuthor,
        style: opts.style,
        customPrompt: opts.customPrompt,
        maxLength: opts.maxLength,
        context: opts.context,
        language: 'auto',
      };

      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: request,
      });

      // 检查 response 是否存在
      if (!response) {
        setError('No response from background service');
        options.onError?.('No response from background service');
        return;
      }

      if (response.error) {
        setError(response.error);
        options.onError?.(response.error);
        return;
      }

      setReply(response.reply);
      setAlternatives(response.alternatives || []);
      setRequireConfirm(response.requireConfirm || false);
      options.onSuccess?.(response.reply, response.alternatives);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate reply';
      setError(message);
      options.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const selectAlternative = useCallback((index: number) => {
    if (index >= 0 && index < alternatives.length) {
      // 将当前回复加入备选
      const newAlternatives = [...alternatives];
      newAlternatives[index] = reply;
      setReply(alternatives[index]);
      setAlternatives(newAlternatives);
    }
  }, [reply, alternatives]);

  const updateReply = useCallback((newReply: string) => {
    setReply(newReply);
  }, []);

  const recordReply = useCallback(async (tweetId?: string) => {
    if (reply) {
      await chrome.runtime.sendMessage({
        type: 'RECORD_REPLY',
        payload: { reply, tweetId },
      });
    }
  }, [reply]);

  const reset = useCallback(() => {
    setReply('');
    setAlternatives([]);
    setError(null);
    setRequireConfirm(false);
  }, []);

  return {
    isLoading,
    reply,
    alternatives,
    error,
    requireConfirm,
    generate,
    selectAlternative,
    updateReply,
    recordReply,
    reset,
  };
}
