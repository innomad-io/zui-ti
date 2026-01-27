import type { Message, GenerateReplyRequest, RateLimitStatus, UserSettings } from '@/shared/types';
import { apiClient } from './api-client';
import { getSettings, saveSettings, getApiKey } from '@/shared/utils/storage';
import { RateLimiter } from '@/shared/utils/rate-limiter';
import { ReplyVariator } from '@/shared/utils/reply-variator';

// 注意：这个函数必须是同步的，返回 true 表示异步响应
// 不能使用 async 函数，否则会返回 Promise<true> 而不是 true
export function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
): boolean {
  console.log('[Background] Received message:', message.type);
  
  // 异步处理消息
  handleMessageAsync(message)
    .then((result) => {
      console.log('[Background] Sending response:', result);
      sendResponse(result);
    })
    .catch((err) => {
      console.error('[Background] Message handler error:', err);
      sendResponse({ error: err instanceof Error ? err.message : 'Unknown error in background' });
    });
  
  // 必须同步返回 true，告诉 Chrome 我们会异步调用 sendResponse
  return true;
}

async function handleMessageAsync(message: Message): Promise<unknown> {
  console.log('Received message:', message.type);
  
  try {
    switch (message.type) {
      case 'GENERATE_REPLY':
        return await handleGenerateReply(message.payload as GenerateReplyRequest);

      case 'GET_SETTINGS':
        return await getSettings();

      case 'SAVE_SETTINGS':
        await saveSettings(message.payload as Partial<UserSettings>);
        return { success: true };

      case 'CHECK_RATE_LIMIT':
        return await handleCheckRateLimit();

      case 'RECORD_REPLY':
        return await handleRecordReply(message.payload as { reply: string; tweetId?: string });

      default:
        return { error: 'Unknown message type' };
    }
  } catch (err) {
    console.error('Error handling message:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

async function handleGenerateReply(request: GenerateReplyRequest): Promise<unknown> {
  const settings = await getSettings();
  const apiKey = await getApiKey();

  if (!apiKey) {
    return { error: 'API Key not configured. Please set it in the extension options.' };
  }

  // 检查速率限制
  const rateLimiter = new RateLimiter(settings.safety.level, settings.safety.customConfig);
  const rateStatus = await rateLimiter.canReply();
  
  if (!rateStatus.allowed) {
    return { 
      error: `Rate limit exceeded. Please wait ${Math.ceil((rateStatus.waitTime || 0) / 1000)} seconds.`,
      rateLimit: rateStatus,
    };
  }

  // 生成回复
  const result = await apiClient.generateReply(
    request,
    settings.ai.provider,
    settings.ai.model,
    apiKey
  );

  if (result.error) {
    return { error: result.error };
  }

  // 检查并应用变体
  const variator = new ReplyVariator();
  let reply = result.reply;

  if (rateLimiter.shouldAddVariation()) {
    const isSimilar = await variator.isTooSimilar(reply);
    if (isSimilar) {
      reply = variator.addVariation(reply);
    }
  }

  // 生成备选回复
  let alternatives: string[] = [];
  if (settings.reply.generateAlternatives) {
    alternatives = await apiClient.generateAlternatives(
      request,
      settings.ai.provider,
      settings.ai.model,
      apiKey,
      settings.reply.alternativesCount
    );
  }

  return {
    reply,
    alternatives,
    requireConfirm: rateLimiter.shouldRequireConfirm(),
  };
}

async function handleCheckRateLimit(): Promise<RateLimitStatus> {
  const settings = await getSettings();
  const rateLimiter = new RateLimiter(settings.safety.level, settings.safety.customConfig);
  return rateLimiter.canReply();
}

async function handleRecordReply(payload: { reply: string; tweetId?: string }): Promise<unknown> {
  const settings = await getSettings();
  const rateLimiter = new RateLimiter(settings.safety.level, settings.safety.customConfig);
  const variator = new ReplyVariator();

  await rateLimiter.recordReply(payload.tweetId);
  await variator.recordReply(payload.reply);

  return { success: true };
}
