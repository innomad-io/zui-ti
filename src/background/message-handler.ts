import type { Message, GenerateReplyRequest, RateLimitStatus, UserSettings } from '@/shared/types';
import { apiClient } from './api-client';
import { getSettings, saveSettings, getApiKey } from '@/shared/utils/storage';
import { getValidOAuthToken, signInWithGoogle, signOutGoogle, isGoogleSignedIn } from '@/shared/utils/google-oauth';
import { RateLimiter } from '@/shared/utils/rate-limiter';
import { ReplyVariator } from '@/shared/utils/reply-variator';
import { GeminiModelRotator } from '@/shared/utils/gemini-model-rotator';

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

      // Google OAuth 相关消息
      case 'GOOGLE_SIGN_IN':
        return await handleGoogleSignIn();

      case 'GOOGLE_SIGN_OUT':
        return await handleGoogleSignOut();

      case 'CHECK_GOOGLE_AUTH':
        return await handleCheckGoogleAuth();

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
  
  const useOAuth = settings.ai.provider === 'gemini' && settings.ai.geminiAuthType === 'oauth';
  let apiKey = '';
  let oauthToken: string | undefined;

  if (useOAuth) {
    const token = await getValidOAuthToken();
    if (!token) {
      return { error: 'Google OAuth token expired. Please sign in again in the extension options.' };
    }
    oauthToken = token;
  } else {
    apiKey = await getApiKey();
    if (!apiKey) {
      return { error: 'API Key not configured. Please set it in the extension options.' };
    }
  }

  const rateLimiter = new RateLimiter(settings.safety.level, settings.safety.customConfig);
  const rateStatus = await rateLimiter.canReply();
  
  if (!rateStatus.allowed) {
    return { 
      error: `Rate limit exceeded. Please wait ${Math.ceil((rateStatus.waitTime || 0) / 1000)} seconds.`,
      rateLimit: rateStatus,
    };
  }

  let modelToUse = settings.ai.model;
  const rotator = new GeminiModelRotator();

  if (settings.ai.provider === 'gemini') {
    modelToUse = await rotator.getAvailableModel(settings.ai.model);
    console.log(`[Gemini Rotator] Selected model: ${modelToUse} (preferred: ${settings.ai.model})`);
  }

  const result = await apiClient.generateReply(
    request,
    settings.ai.provider,
    modelToUse,
    apiKey,
    useOAuth,
    oauthToken
  );

  if (result.error) {
    return { error: result.error };
  }

  if (settings.ai.provider === 'gemini') {
    await rotator.recordUsage(modelToUse);
  }

  const variator = new ReplyVariator();
  let reply = result.reply;

  if (rateLimiter.shouldAddVariation()) {
    const isSimilar = await variator.isTooSimilar(reply);
    if (isSimilar) {
      reply = variator.addVariation(reply);
    }
  }

  let alternatives: string[] = [];
  if (settings.reply.generateAlternatives) {
    alternatives = await apiClient.generateAlternatives(
      request,
      settings.ai.provider,
      modelToUse,
      apiKey,
      settings.reply.alternativesCount,
      useOAuth,
      oauthToken
    );
  }

  return {
    reply,
    alternatives,
    requireConfirm: rateLimiter.shouldRequireConfirm(),
    usedModel: modelToUse,
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

// Google OAuth 处理函数
async function handleGoogleSignIn(): Promise<unknown> {
  try {
    const token = await signInWithGoogle();
    // 更新设置为 OAuth 模式
    const settings = await getSettings();
    await saveSettings({
      ai: {
        ...settings.ai,
        geminiAuthType: 'oauth',
      },
    });
    return { success: true, token };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to sign in with Google' };
  }
}

async function handleGoogleSignOut(): Promise<unknown> {
  try {
    await signOutGoogle();
    // 更新设置回 API Key 模式
    const settings = await getSettings();
    await saveSettings({
      ai: {
        ...settings.ai,
        geminiAuthType: 'apiKey',
      },
    });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to sign out' };
  }
}

async function handleCheckGoogleAuth(): Promise<unknown> {
  try {
    const isSignedIn = await isGoogleSignedIn();
    return { isSignedIn };
  } catch (err) {
    return { isSignedIn: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
