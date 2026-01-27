import type { AIProvider } from '../types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxTokens: 8192 },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', maxTokens: 8192 },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', maxTokens: 8192 },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 4096 },
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 4096 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096 },
    ],
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 4096 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 4096 },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', maxTokens: 4096 },
    ],
  },
];

export const getProvider = (id: string): AIProvider | undefined => {
  return AI_PROVIDERS.find(p => p.id === id);
};

export const getDefaultModel = (providerId: string): string => {
  const provider = getProvider(providerId);
  return provider?.models[0]?.id || '';
};
