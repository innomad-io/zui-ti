// AI Provider 类型
export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'deepseek';

export interface AIProvider {
  id: AIProviderId;
  name: string;
  baseUrl: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
}

// API 请求/响应类型
export interface GenerateReplyRequest {
  tweetContent: string;
  tweetAuthor: string;
  context?: string;
  style: ReplyStyleId;
  customPrompt?: string;
  language: 'zh' | 'en' | 'auto';
  maxLength?: number;
}

export interface GenerateReplyResponse {
  reply: string;
  alternatives?: string[];
  tokensUsed?: number;
  error?: string;
}

// 回复风格类型
export type ReplyStyleId = 
  | 'professional'
  | 'friendly'
  | 'humorous'
  | 'insightful'
  | 'supportive'
  | 'questioning'
  | 'concise'
  | 'custom';

export interface ReplyStyle {
  id: ReplyStyleId;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  promptHint: string;
}

// 消息类型
export type MessageType =
  | 'GENERATE_REPLY'
  | 'REPLY_GENERATED'
  | 'GET_SETTINGS'
  | 'SAVE_SETTINGS'
  | 'SETTINGS_UPDATED'
  | 'CHECK_RATE_LIMIT'
  | 'RATE_LIMIT_STATUS'
  | 'RECORD_REPLY'
  | 'GOOGLE_SIGN_IN'
  | 'GOOGLE_SIGN_OUT'
  | 'CHECK_GOOGLE_AUTH'
  | 'ERROR';

export interface Message<T = unknown> {
  type: MessageType;
  payload: T;
}

export interface RateLimitStatus {
  allowed: boolean;
  waitTime?: number;
  repliesInLastHour: number;
}
