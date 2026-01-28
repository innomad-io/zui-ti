import type { AIProviderId, GenerateReplyRequest, GenerateReplyResponse } from '@/shared/types';
import { SYSTEM_PROMPT, generateUserPrompt, generateAlternativesPrompt, REPLY_STYLES } from '@/shared/constants';
import { getProvider } from '@/shared/constants/providers';

export type RateLimitType = 'RPM' | 'RPD' | 'UNKNOWN';

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly rateLimitType: RateLimitType,
    public readonly model: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class AIApiClient {
  // 生成回复
  async generateReply(
    request: GenerateReplyRequest,
    providerId: AIProviderId,
    model: string,
    apiKey: string,
    useOAuth: boolean = false,
    oauthToken?: string
  ): Promise<GenerateReplyResponse> {
    const provider = getProvider(providerId);
    if (!provider) {
      return { reply: '', error: `Unknown provider: ${providerId}` };
    }

    const styleHint = request.customPrompt || this.getStyleHint(request.style);
    const userPrompt = generateUserPrompt(
      request.tweetContent,
      request.tweetAuthor,
      styleHint,
      request.context,
      request.customPrompt,
      request.maxLength,
      request.language
    );

    try {
      const reply = await this.callApi(providerId, model, apiKey, userPrompt, useOAuth, oauthToken);
      return { reply: reply.trim() };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { reply: '', error: message };
    }
  }

  // 生成备选回复
  async generateAlternatives(
    request: GenerateReplyRequest,
    providerId: AIProviderId,
    model: string,
    apiKey: string,
    count: number = 2,
    useOAuth: boolean = false,
    oauthToken?: string
  ): Promise<string[]> {
    const styleHint = this.getStyleHint(request.style);
    const prompt = generateAlternativesPrompt(
      request.tweetContent,
      request.tweetAuthor,
      styleHint,
      count
    );

    try {
      const response = await this.callApi(providerId, model, apiKey, prompt, useOAuth, oauthToken);
      const parsed = JSON.parse(response.trim());
      if (Array.isArray(parsed)) {
        return parsed.map(s => String(s).trim());
      }
      return [];
    } catch {
      return [];
    }
  }

  private getStyleHint(styleId: string): string {
    return REPLY_STYLES[styleId as keyof typeof REPLY_STYLES]?.promptHint || '';
  }

  private async callApi(
    providerId: AIProviderId,
    model: string,
    apiKey: string,
    userPrompt: string,
    useOAuth: boolean = false,
    oauthToken?: string
  ): Promise<string> {
    switch (providerId) {
      case 'gemini':
        return this.callGemini(model, apiKey, userPrompt, useOAuth, oauthToken);
      case 'openai':
      case 'deepseek':
        return this.callOpenAICompatible(providerId, model, apiKey, userPrompt);
      case 'claude':
        return this.callClaude(model, apiKey, userPrompt);
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }

  private async callGemini(
    model: string,
    apiKey: string,
    userPrompt: string,
    useOAuth: boolean = false,
    oauthToken?: string
  ): Promise<string> {
    let url: string;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useOAuth && oauthToken) {
      // 使用 OAuth token 调用 Gemini API
      // OAuth 方式使用不同的端点和认证头
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      headers['Authorization'] = `Bearer ${oauthToken}`;
      console.log('[Gemini] 🔐 Using OAuth authentication');
    } else {
      // 使用 API Key 调用
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log('[Gemini] 🔑 Using API Key authentication');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Parse 429 rate limit errors to distinguish RPM vs RPD
      if (response.status === 429) {
        const rateLimitType = this.parseGemini429Error(errorText);
        console.error(`[Gemini] 429 Rate Limit: ${rateLimitType}`, errorText);
        throw new RateLimitError(
          `Gemini rate limit exceeded (${rateLimitType})`,
          rateLimitType,
          model
        );
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // 检查是否被截断
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'MAX_TOKENS') {
      console.warn('[Gemini] Response was truncated due to max tokens');
    }
    
    return candidate?.content?.parts?.[0]?.text || '';
  }

  private async callOpenAICompatible(
    providerId: AIProviderId,
    model: string,
    apiKey: string,
    userPrompt: string
  ): Promise<string> {
    const provider = getProvider(providerId);
    const baseUrl = provider?.baseUrl || 'https://api.openai.com/v1';
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${providerId} API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callClaude(model: string, apiKey: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  private parseGemini429Error(errorText: string): RateLimitType {
    const lowerError = errorText.toLowerCase();
    
    if (lowerError.includes('per minute') || lowerError.includes('rpm') || lowerError.includes('requests per minute')) {
      return 'RPM';
    }
    
    if (lowerError.includes('per day') || lowerError.includes('rpd') || lowerError.includes('requests per day') || lowerError.includes('daily')) {
      return 'RPD';
    }
    
    return 'UNKNOWN';
  }
}

export const apiClient = new AIApiClient();
