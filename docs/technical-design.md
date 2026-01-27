# X Auto Reply Chrome Extension - 技术方案设计

## 1. 项目概述

### 1.1 产品目标
开发一个 Chrome 扩展，为 X (Twitter) 平台提供 AI 驱动的智能回复生成功能，帮助用户快速、高质量地参与社交互动。

### 1.2 核心功能
- AI 自动生成回复（支持 Gemini、OpenAI 等多种模型）
- 多种回复风格选择
- 防风控策略
- 用户自定义 API Key

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Popup     │  │  Options    │  │   Content Script    │  │
│  │   (React)   │  │   Page      │  │   (X Page Inject)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                   ┌──────▼──────┐                            │
│                   │  Background │                            │
│                   │  Service    │                            │
│                   │  Worker     │                            │
│                   └──────┬──────┘                            │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                          │                                   │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│    ┌─────────┐    ┌───────────┐    ┌───────────┐            │
│    │ Gemini  │    │  OpenAI   │    │  Claude   │            │
│    │   API   │    │    API    │    │    API    │            │
│    └─────────┘    └───────────┘    └───────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选择

| 模块 | 技术选型 | 理由 |
|------|----------|------|
| 框架 | TypeScript + React | 类型安全，组件化开发 |
| 构建工具 | Vite + CRXJS | 快速热更新，专为 Chrome 扩展优化 |
| 状态管理 | Zustand | 轻量级，支持持久化 |
| 样式 | Tailwind CSS | 快速开发，避免样式冲突 |
| 存储 | Chrome Storage API | 同步用户配置 |
| UI 组件 | Shadcn/ui | 美观、可定制 |

### 2.3 目录结构

```
zui-ti/
├── src/
│   ├── background/
│   │   ├── index.ts              # Service Worker 入口
│   │   ├── api-client.ts         # AI API 统一调用层
│   │   └── message-handler.ts    # 消息处理
│   │
│   ├── content/
│   │   ├── index.tsx             # Content Script 入口
│   │   ├── components/
│   │   │   ├── ReplyButton.tsx   # 注入的回复按钮
│   │   │   ├── ReplyModal.tsx    # 回复生成弹窗
│   │   │   └── StyleSelector.tsx # 风格选择器
│   │   ├── hooks/
│   │   │   ├── useTweetContext.ts
│   │   │   └── useReplyGenerator.ts
│   │   └── utils/
│   │       ├── dom-observer.ts   # DOM 变化监听
│   │       ├── tweet-parser.ts   # 推文内容解析
│   │       └── reply-injector.ts # 回复注入
│   │
│   ├── popup/
│   │   ├── index.tsx
│   │   └── Popup.tsx
│   │
│   ├── options/
│   │   ├── index.tsx
│   │   └── Options.tsx           # 设置页面
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── api.ts
│   │   │   ├── reply.ts
│   │   │   └── settings.ts
│   │   ├── constants/
│   │   │   ├── prompts.ts        # 预设 Prompt 模板
│   │   │   └── styles.ts         # 回复风格定义
│   │   ├── store/
│   │   │   └── settings-store.ts
│   │   └── utils/
│   │       ├── storage.ts
│   │       └── crypto.ts         # API Key 加密
│   │
│   └── assets/
│       └── icons/
│
├── public/
│   └── manifest.json
│
├── docs/
│   └── technical-design.md
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. 核心功能设计

### 3.1 AI API 集成层

#### 3.1.1 统一接口设计

```typescript
// src/shared/types/api.ts
interface AIProvider {
  id: 'gemini' | 'openai' | 'claude' | 'deepseek';
  name: string;
  baseUrl: string;
  models: string[];
}

interface GenerateReplyRequest {
  tweetContent: string;
  tweetAuthor: string;
  context?: string;        // 上下文（对话线程）
  style: ReplyStyle;
  language: 'zh' | 'en' | 'auto';
  maxLength?: number;
}

interface GenerateReplyResponse {
  reply: string;
  alternatives?: string[]; // 备选回复
  tokensUsed: number;
}

// src/background/api-client.ts
class AIApiClient {
  private providers: Map<string, AIProvider>;
  
  async generateReply(
    request: GenerateReplyRequest,
    providerId: string,
    apiKey: string
  ): Promise<GenerateReplyResponse> {
    const provider = this.providers.get(providerId);
    // 根据不同 provider 调用对应 API
  }
}
```

#### 3.1.2 支持的 AI 服务商

| 服务商 | 模型 | 特点 |
|--------|------|------|
| Google Gemini | gemini-2.0-flash, gemini-1.5-pro | 免费额度大，速度快 |
| OpenAI | gpt-4o-mini, gpt-4o | 质量稳定 |
| Anthropic Claude | claude-3-haiku, claude-3.5-sonnet | 理解力强 |
| DeepSeek | deepseek-chat | 性价比高，中文优秀 |

### 3.2 回复风格系统

#### 3.2.1 预设风格

```typescript
// src/shared/constants/styles.ts
export const REPLY_STYLES = {
  professional: {
    id: 'professional',
    name: '专业认真',
    emoji: '💼',
    description: '正式、专业的回复风格',
    promptHint: 'Reply in a professional and formal tone.',
  },
  friendly: {
    id: 'friendly', 
    name: '友好亲切',
    emoji: '😊',
    description: '温暖、友好的回复风格',
    promptHint: 'Reply in a warm and friendly tone.',
  },
  humorous: {
    id: 'humorous',
    name: '幽默风趣',
    emoji: '😄',
    description: '轻松、幽默的回复风格',
    promptHint: 'Reply with humor and wit.',
  },
  insightful: {
    id: 'insightful',
    name: '深度见解',
    emoji: '🧠',
    description: '提供深入分析和独特见解',
    promptHint: 'Reply with deep insights and unique perspectives.',
  },
  supportive: {
    id: 'supportive',
    name: '支持鼓励',
    emoji: '💪',
    description: '给予支持和鼓励',
    promptHint: 'Reply with encouragement and support.',
  },
  questioning: {
    id: 'questioning',
    name: '启发提问',
    emoji: '🤔',
    description: '通过提问引发思考',
    promptHint: 'Reply with thought-provoking questions.',
  },
  concise: {
    id: 'concise',
    name: '简洁精炼',
    emoji: '✨',
    description: '言简意赅的回复',
    promptHint: 'Reply concisely and to the point.',
  },
  custom: {
    id: 'custom',
    name: '自定义',
    emoji: '🎨',
    description: '使用自定义 Prompt',
    promptHint: '', // 用户自定义
  },
} as const;
```

#### 3.2.2 Prompt 模板

```typescript
// src/shared/constants/prompts.ts
export const SYSTEM_PROMPT = `You are an AI assistant helping users craft thoughtful replies on X (Twitter).

RULES:
1. Keep replies under 280 characters unless specified otherwise
2. Match the language of the original tweet
3. Be authentic and human-like, avoid robotic phrasing
4. Never use hashtags unless absolutely necessary
5. Avoid starting with "I" too often
6. No excessive punctuation or emojis
7. Be contextually relevant to the conversation

ANTI-SPAM GUIDELINES:
- Vary sentence structure and length
- Use natural conversational patterns
- Avoid repetitive phrases
- Include subtle personality quirks
`;

export const generateUserPrompt = (
  tweet: string,
  author: string,
  style: ReplyStyle,
  context?: string
) => `
Original Tweet by @${author}:
"${tweet}"

${context ? `Conversation Context:\n${context}\n` : ''}

Style: ${style.promptHint}

Generate a natural, engaging reply that fits the style and context.
`;
```

### 3.3 Content Script 设计

#### 3.3.1 推文检测与按钮注入

```typescript
// src/content/utils/dom-observer.ts
class TweetObserver {
  private observer: MutationObserver;
  
  constructor() {
    this.observer = new MutationObserver(this.handleMutations);
  }
  
  private handleMutations = (mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          this.processNewTweets(node);
        }
      });
    });
  };
  
  private processNewTweets(container: HTMLElement) {
    // 选择器需要根据 X 的实际 DOM 结构调整
    const tweets = container.querySelectorAll('[data-testid="tweet"]');
    tweets.forEach(tweet => {
      if (!tweet.hasAttribute('data-zui-enhanced')) {
        this.injectReplyButton(tweet);
        tweet.setAttribute('data-zui-enhanced', 'true');
      }
    });
  }
  
  private injectReplyButton(tweet: Element) {
    // 找到回复按钮组，注入我们的按钮
    const actionBar = tweet.querySelector('[role="group"]');
    if (actionBar) {
      const container = document.createElement('div');
      container.id = `zui-reply-${Date.now()}`;
      actionBar.appendChild(container);
      // 使用 React 渲染按钮
      createRoot(container).render(<ReplyButton tweet={tweet} />);
    }
  }
}
```

#### 3.3.2 推文内容解析

```typescript
// src/content/utils/tweet-parser.ts
interface ParsedTweet {
  id: string;
  content: string;
  author: string;
  authorHandle: string;
  timestamp: string;
  isReply: boolean;
  parentTweet?: ParsedTweet;
  mediaUrls?: string[];
}

export function parseTweet(tweetElement: Element): ParsedTweet {
  // 解析推文内容
  const contentEl = tweetElement.querySelector('[data-testid="tweetText"]');
  const content = contentEl?.textContent || '';
  
  // 解析作者信息
  const authorEl = tweetElement.querySelector('[data-testid="User-Name"]');
  const authorLink = authorEl?.querySelector('a[href^="/"]');
  const authorHandle = authorLink?.getAttribute('href')?.slice(1) || '';
  
  // 解析时间戳
  const timeEl = tweetElement.querySelector('time');
  const timestamp = timeEl?.getAttribute('datetime') || '';
  
  return {
    id: tweetElement.getAttribute('data-tweet-id') || crypto.randomUUID(),
    content,
    author: authorEl?.textContent?.split('@')[0]?.trim() || '',
    authorHandle,
    timestamp,
    isReply: !!tweetElement.closest('[data-testid="reply"]'),
  };
}
```

---

## 4. 防风控策略

### 4.1 风控触发因素分析

X 平台可能检测以下异常行为：

| 风险因素 | 描述 | 风险等级 |
|----------|------|----------|
| 高频操作 | 短时间内大量回复 | 高 |
| 内容重复 | 相似或重复的回复内容 | 高 |
| 行为模式 | 机械化的操作时间间隔 | 中 |
| 内容特征 | AI 生成内容的典型特征 | 中 |
| 新账号 | 新注册账号高频互动 | 高 |

### 4.2 防风控措施

#### 4.2.1 速率限制

```typescript
// src/shared/utils/rate-limiter.ts
interface RateLimitConfig {
  maxRepliesPerHour: number;
  minIntervalMs: number;
  maxIntervalMs: number;
  cooldownAfterBurst: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRepliesPerHour: 15,      // 每小时最多 15 条回复
  minIntervalMs: 30000,        // 最小间隔 30 秒
  maxIntervalMs: 180000,       // 最大间隔 3 分钟
  cooldownAfterBurst: 600000,  // 连续回复后冷却 10 分钟
};

class RateLimiter {
  private replyHistory: number[] = [];
  private config: RateLimitConfig;
  
  canReply(): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // 清理过期记录
    this.replyHistory = this.replyHistory.filter(t => t > oneHourAgo);
    
    if (this.replyHistory.length >= this.config.maxRepliesPerHour) {
      const oldestReply = this.replyHistory[0];
      return { 
        allowed: false, 
        waitTime: oldestReply + 3600000 - now 
      };
    }
    
    const lastReply = this.replyHistory[this.replyHistory.length - 1];
    if (lastReply) {
      const elapsed = now - lastReply;
      const randomInterval = this.getRandomInterval();
      if (elapsed < randomInterval) {
        return { allowed: false, waitTime: randomInterval - elapsed };
      }
    }
    
    return { allowed: true };
  }
  
  private getRandomInterval(): number {
    // 随机化间隔，模拟人类行为
    return Math.floor(
      Math.random() * (this.config.maxIntervalMs - this.config.minIntervalMs) 
      + this.config.minIntervalMs
    );
  }
  
  recordReply() {
    this.replyHistory.push(Date.now());
  }
}
```

#### 4.2.2 内容去重与变体

```typescript
// src/background/reply-variator.ts
class ReplyVariator {
  private recentReplies: string[] = [];
  private maxHistory = 50;
  
  // 检查相似度
  private calculateSimilarity(a: string, b: string): number {
    // 使用 Jaccard 相似度或 Levenshtein 距离
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
  }
  
  // 检查是否与历史回复过于相似
  isTooSimilar(reply: string): boolean {
    return this.recentReplies.some(
      r => this.calculateSimilarity(r, reply) > 0.7
    );
  }
  
  // 添加轻微变体以降低重复度
  addVariation(reply: string): string {
    const variations = [
      // 添加/移除语气词
      (s: string) => s.replace(/^(Well,?\s*)?/, () => Math.random() > 0.5 ? 'Well, ' : ''),
      // 调整标点
      (s: string) => s.replace(/!$/, () => Math.random() > 0.5 ? '.' : '!'),
      // 同义词替换（示例）
      (s: string) => s.replace(/great/gi, () => 
        ['great', 'awesome', 'fantastic', 'excellent'][Math.floor(Math.random() * 4)]
      ),
    ];
    
    let result = reply;
    variations.forEach(v => {
      if (Math.random() > 0.7) {
        result = v(result);
      }
    });
    return result;
  }
  
  recordReply(reply: string) {
    this.recentReplies.push(reply);
    if (this.recentReplies.length > this.maxHistory) {
      this.recentReplies.shift();
    }
  }
}
```

#### 4.2.3 人性化输入模拟

```typescript
// src/content/utils/human-typer.ts
class HumanTyper {
  private baseDelay = 50;   // 基础打字延迟 (ms)
  private variance = 30;    // 延迟变化范围
  
  async typeText(element: HTMLElement, text: string) {
    element.focus();
    
    for (const char of text) {
      // 随机延迟
      const delay = this.baseDelay + (Math.random() * this.variance * 2 - this.variance);
      await this.sleep(delay);
      
      // 模拟按键事件
      const event = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: char,
        inputType: 'insertText',
      });
      
      element.textContent += char;
      element.dispatchEvent(event);
      
      // 偶尔暂停（模拟思考）
      if (Math.random() < 0.05) {
        await this.sleep(200 + Math.random() * 300);
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 4.2.4 用户行为建议

在 UI 中向用户展示安全提示：

```typescript
// src/content/components/SafetyTips.tsx
const SAFETY_TIPS = [
  '建议每小时回复不超过 10-15 条',
  '避免连续回复多条推文',
  '生成后建议稍作修改再发送',
  '保持正常的浏览和阅读行为',
  '不要只回复，也要点赞和转发',
];
```

### 4.3 风控等级配置

```typescript
// src/shared/types/settings.ts
interface SafetySettings {
  level: 'relaxed' | 'balanced' | 'strict';
  customConfig?: {
    maxRepliesPerHour: number;
    minIntervalSeconds: number;
    requireManualConfirm: boolean;
    addRandomVariation: boolean;
  };
}

const SAFETY_PRESETS = {
  relaxed: {
    maxRepliesPerHour: 25,
    minIntervalSeconds: 15,
    requireManualConfirm: false,
    addRandomVariation: false,
  },
  balanced: {
    maxRepliesPerHour: 15,
    minIntervalSeconds: 30,
    requireManualConfirm: false,
    addRandomVariation: true,
  },
  strict: {
    maxRepliesPerHour: 8,
    minIntervalSeconds: 60,
    requireManualConfirm: true,
    addRandomVariation: true,
  },
};
```

---

## 5. 用户设置与 API Key 管理

### 5.1 API Key 安全存储

```typescript
// src/shared/utils/crypto.ts
class SecureStorage {
  private encryptionKey: CryptoKey | null = null;
  
  async init() {
    // 使用 Web Crypto API 生成设备唯一密钥
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(await this.getDeviceId()),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('zui-ti-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encryptApiKey(apiKey: string): Promise<string> {
    if (!this.encryptionKey) await this.init();
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      new TextEncoder().encode(apiKey)
    );
    
    // 返回 Base64 编码的 iv + encrypted
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }
  
  async decryptApiKey(encrypted: string): Promise<string> {
    if (!this.encryptionKey) await this.init();
    
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  }
  
  private async getDeviceId(): Promise<string> {
    // 从 chrome.storage 获取或生成设备 ID
    const result = await chrome.storage.local.get('deviceId');
    if (result.deviceId) return result.deviceId;
    
    const newId = crypto.randomUUID();
    await chrome.storage.local.set({ deviceId: newId });
    return newId;
  }
}
```

### 5.2 设置页面功能

```typescript
// src/shared/types/settings.ts
interface UserSettings {
  // AI 配置
  ai: {
    provider: 'gemini' | 'openai' | 'claude' | 'deepseek';
    model: string;
    apiKey: string; // 加密存储
  };
  
  // 默认回复设置
  reply: {
    defaultStyle: string;
    defaultLanguage: 'zh' | 'en' | 'auto';
    maxLength: number;
    generateAlternatives: boolean;
    alternativesCount: number;
  };
  
  // 安全设置
  safety: SafetySettings;
  
  // 自定义 Prompt
  customPrompts: {
    id: string;
    name: string;
    prompt: string;
  }[];
  
  // UI 设置
  ui: {
    showFloatingButton: boolean;
    buttonPosition: 'inline' | 'floating';
    theme: 'light' | 'dark' | 'auto';
  };
}
```

---

## 6. 用户界面设计

### 6.1 交互流程

```
用户浏览推文
     │
     ▼
看到 AI 回复按钮 (闪电图标 ⚡)
     │
     ▼
点击按钮 ─────────────────────────┐
     │                            │
     ▼                            │
弹出回复生成面板                   │
  ├─ 风格选择（横向滚动标签）        │
  ├─ 语言选择                      │
  └─ 可选：自定义提示               │
     │                            │
     ▼                            │
点击"生成回复"                     │
     │                            │
     ▼                            │
显示生成的回复                      │
  ├─ 主回复                        │
  ├─ 备选回复（可切换）              │
  └─ 操作按钮                      │
       ├─ 编辑                     │
       ├─ 重新生成                 │
       ├─ 复制                     │
       └─ 直接发送                 │
     │                            │
     ▼                            │
确认发送 ──────────────────────────┘
     │
     ▼
回复成功，显示提示
```

### 6.2 UI 组件

#### 6.2.1 回复生成按钮

```tsx
// src/content/components/ReplyButton.tsx
const ReplyButton: React.FC<{ tweet: Element }> = ({ tweet }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        className="zui-reply-btn"
        onClick={() => setIsOpen(true)}
        title="AI 生成回复"
      >
        <ZapIcon size={18} />
      </button>
      
      {isOpen && (
        <ReplyModal 
          tweet={parseTweet(tweet)} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
};
```

#### 6.2.2 回复生成面板

```tsx
// src/content/components/ReplyModal.tsx
const ReplyModal: React.FC<Props> = ({ tweet, onClose }) => {
  const [style, setStyle] = useState('friendly');
  const [reply, setReply] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerate = async () => {
    setIsLoading(true);
    const result = await generateReply({
      tweetContent: tweet.content,
      tweetAuthor: tweet.authorHandle,
      style: REPLY_STYLES[style],
    });
    setReply(result.reply);
    setAlternatives(result.alternatives || []);
    setIsLoading(false);
  };
  
  return (
    <div className="zui-modal">
      <div className="zui-modal-header">
        <h3>AI 回复生成</h3>
        <button onClick={onClose}>×</button>
      </div>
      
      {/* 原推文预览 */}
      <div className="zui-tweet-preview">
        <span className="author">@{tweet.authorHandle}</span>
        <p>{tweet.content}</p>
      </div>
      
      {/* 风格选择 */}
      <div className="zui-style-selector">
        {Object.values(REPLY_STYLES).map(s => (
          <button
            key={s.id}
            className={`style-btn ${style === s.id ? 'active' : ''}`}
            onClick={() => setStyle(s.id)}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
      
      {/* 生成按钮 */}
      <button 
        className="zui-generate-btn"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? '生成中...' : '生成回复'}
      </button>
      
      {/* 生成结果 */}
      {reply && (
        <div className="zui-reply-result">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          
          {/* 备选回复 */}
          {alternatives.length > 0 && (
            <div className="zui-alternatives">
              <span>备选：</span>
              {alternatives.map((alt, i) => (
                <button key={i} onClick={() => setReply(alt)}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="zui-actions">
            <button onClick={handleGenerate}>🔄 重新生成</button>
            <button onClick={() => navigator.clipboard.writeText(reply)}>
              📋 复制
            </button>
            <button className="primary" onClick={handleSend}>
              发送回复
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 7. 数据流与通信

### 7.1 消息通信架构

```typescript
// src/shared/types/messages.ts
type Message =
  | { type: 'GENERATE_REPLY'; payload: GenerateReplyRequest }
  | { type: 'REPLY_GENERATED'; payload: GenerateReplyResponse }
  | { type: 'GET_SETTINGS'; payload: null }
  | { type: 'SETTINGS_UPDATED'; payload: UserSettings }
  | { type: 'CHECK_RATE_LIMIT'; payload: null }
  | { type: 'RATE_LIMIT_STATUS'; payload: { allowed: boolean; waitTime?: number } }
  | { type: 'ERROR'; payload: { code: string; message: string } };

// Content Script -> Background
async function sendToBackground<T>(message: Message): Promise<T> {
  return chrome.runtime.sendMessage(message);
}

// Background -> Content Script
function sendToContentScript(tabId: number, message: Message) {
  chrome.tabs.sendMessage(tabId, message);
}
```

### 7.2 状态管理

```typescript
// src/shared/store/settings-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'zui-settings',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const result = await chrome.storage.sync.get(name);
          return result[name] || null;
        },
        setItem: async (name, value) => {
          await chrome.storage.sync.set({ [name]: value });
        },
        removeItem: async (name) => {
          await chrome.storage.sync.remove(name);
        },
      })),
    }
  )
);
```

---

## 8. 开发与部署

### 8.1 开发环境设置

```bash
# 安装依赖
pnpm install

# 开发模式（热更新）
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

### 8.2 manifest.json

```json
{
  "manifest_version": 3,
  "name": "X AI Reply Assistant",
  "version": "1.0.0",
  "description": "AI-powered reply generation for X (Twitter)",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://x.com/*",
    "https://twitter.com/*",
    "https://api.openai.com/*",
    "https://generativelanguage.googleapis.com/*",
    "https://api.anthropic.com/*",
    "https://api.deepseek.com/*"
  ],
  
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["https://x.com/*", "https://twitter.com/*"],
      "js": ["src/content/index.tsx"],
      "css": ["src/content/styles.css"]
    }
  ],
  
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "options_page": "src/options/index.html",
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 9. 安全与隐私

### 9.1 数据处理原则

1. **API Key 本地加密存储**：永不上传到任何服务器
2. **推文内容仅用于生成**：不存储、不分析用户浏览的推文
3. **无遥测数据收集**：不收集用户使用数据
4. **开源透明**：代码公开，接受社区审查

### 9.2 权限最小化

- 仅请求必要的权限
- 仅在 X 域名下激活
- API 调用直接从用户设备发起

---

## 10. 后续迭代计划

### Phase 1 (MVP)
- [x] 基础架构搭建
- [ ] Gemini API 集成
- [ ] 基础回复生成功能
- [ ] 简单的风格选择
- [ ] API Key 配置

### Phase 2
- [ ] OpenAI/Claude 支持
- [ ] 完善防风控系统
- [ ] 回复历史记录
- [ ] 自定义 Prompt 模板

### Phase 3
- [ ] 批量回复功能
- [ ] 回复效果分析
- [ ] 多语言 UI
- [ ] Chrome Web Store 发布

---

## 11. 参考资料

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin/)
- [X/Twitter DOM Structure](https://github.com/nicolevanderhoeven/obsidian-twitter)
- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
