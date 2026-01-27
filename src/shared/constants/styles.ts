import type { ReplyStyle, ReplyStyleId } from '../types';

export const REPLY_STYLES: Record<ReplyStyleId, ReplyStyle> = {
  professional: {
    id: 'professional',
    name: '专业认真',
    nameEn: 'Professional',
    emoji: '💼',
    description: '正式、专业的回复风格',
    promptHint: 'Reply in a professional and formal tone. Be respectful and well-structured.',
  },
  friendly: {
    id: 'friendly',
    name: '友好亲切',
    nameEn: 'Friendly',
    emoji: '😊',
    description: '温暖、友好的回复风格',
    promptHint: 'Reply in a warm and friendly tone. Be approachable and personable.',
  },
  humorous: {
    id: 'humorous',
    name: '幽默风趣',
    nameEn: 'Humorous',
    emoji: '😄',
    description: '轻松、幽默的回复风格',
    promptHint: 'Reply with humor and wit. Be clever but not offensive. Light-hearted tone.',
  },
  insightful: {
    id: 'insightful',
    name: '深度见解',
    nameEn: 'Insightful',
    emoji: '🧠',
    description: '提供深入分析和独特见解',
    promptHint: 'Reply with deep insights and unique perspectives. Add value to the conversation with thoughtful analysis.',
  },
  supportive: {
    id: 'supportive',
    name: '支持鼓励',
    nameEn: 'Supportive',
    emoji: '💪',
    description: '给予支持和鼓励',
    promptHint: 'Reply with encouragement and support. Be empathetic and uplifting.',
  },
  questioning: {
    id: 'questioning',
    name: '启发提问',
    nameEn: 'Questioning',
    emoji: '🤔',
    description: '通过提问引发思考',
    promptHint: 'Reply with thought-provoking questions. Encourage deeper thinking and discussion.',
  },
  concise: {
    id: 'concise',
    name: '简洁精炼',
    nameEn: 'Concise',
    emoji: '✨',
    description: '言简意赅的回复',
    promptHint: 'Reply concisely and to the point. Maximum impact with minimum words.',
  },
  custom: {
    id: 'custom',
    name: '自定义',
    nameEn: 'Custom',
    emoji: '🎨',
    description: '使用自定义 Prompt',
    promptHint: '',
  },
};

export const STYLE_LIST = Object.values(REPLY_STYLES);
