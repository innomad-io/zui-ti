import type { AIProviderId, ReplyStyleId } from './api';

// 安全等级
export type SafetyLevel = 'relaxed' | 'balanced' | 'strict';

// Gemini 认证方式
export type GeminiAuthType = 'apiKey' | 'oauth';

export interface SafetyConfig {
  maxRepliesPerHour: number;
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
  requireManualConfirm: boolean;
  addRandomVariation: boolean;
}

// 自定义 Prompt 模板
export interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
}

// OAuth Token 信息
export interface OAuthToken {
  accessToken: string;
  expiresAt: number; // timestamp
  refreshToken?: string;
}

// 用户设置
export interface UserSettings {
  // AI 配置
  ai: {
    provider: AIProviderId;
    model: string;
    apiKey: string; // 加密存储
    // Gemini OAuth 配置
    geminiAuthType?: GeminiAuthType;
    geminiOAuthToken?: OAuthToken;
  };

  // 默认回复设置
  reply: {
    defaultStyle: ReplyStyleId;
    defaultLanguage: 'zh' | 'en' | 'auto';
    maxLength: number;
    customPrompt: string;
    generateAlternatives: boolean;
    alternativesCount: number;
  };

  // 安全设置
  safety: {
    level: SafetyLevel;
    customConfig?: SafetyConfig;
  };

  // 自定义 Prompt
  customPrompts: CustomPrompt[];

  // UI 设置
  ui: {
    showFloatingButton: boolean;
    buttonPosition: 'inline' | 'floating';
    theme: 'light' | 'dark' | 'auto';
  };
}

// 默认设置
export const DEFAULT_SETTINGS: UserSettings = {
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    apiKey: '',
    geminiAuthType: 'apiKey',
  },
  reply: {
    defaultStyle: 'friendly',
    defaultLanguage: 'auto',
    maxLength: 280,
    customPrompt: '',
    generateAlternatives: true,
    alternativesCount: 2,
  },
  safety: {
    level: 'balanced',
  },
  ui: {
    showFloatingButton: true,
    buttonPosition: 'inline',
    theme: 'auto',
  },
  customPrompts: [],
};

// 安全等级预设
export const SAFETY_PRESETS: Record<SafetyLevel, SafetyConfig> = {
  relaxed: {
    maxRepliesPerHour: 25,
    minIntervalSeconds: 15,
    maxIntervalSeconds: 60,
    requireManualConfirm: false,
    addRandomVariation: false,
  },
  balanced: {
    maxRepliesPerHour: 15,
    minIntervalSeconds: 30,
    maxIntervalSeconds: 180,
    requireManualConfirm: false,
    addRandomVariation: true,
  },
  strict: {
    maxRepliesPerHour: 8,
    minIntervalSeconds: 60,
    maxIntervalSeconds: 300,
    requireManualConfirm: true,
    addRandomVariation: true,
  },
};
