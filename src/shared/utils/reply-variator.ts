const RECENT_REPLIES_KEY = 'zui-recent-replies';
const MAX_HISTORY = 50;

export class ReplyVariator {
  // 计算 Jaccard 相似度
  private calculateSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    
    const intersection = [...wordsA].filter(x => wordsB.has(x)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    
    return intersection / union;
  }

  // 检查是否与历史回复过于相似
  async isTooSimilar(reply: string): Promise<boolean> {
    const history = await this.getHistory();
    return history.some(r => this.calculateSimilarity(r, reply) > 0.7);
  }

  // 添加轻微变体以降低重复度
  addVariation(reply: string): string {
    let result = reply;

    // 随机添加/移除开头的语气词
    if (Math.random() > 0.7) {
      const starters = ['Well, ', 'Honestly, ', 'Actually, ', ''];
      const starter = starters[Math.floor(Math.random() * starters.length)];
      result = result.replace(/^(Well,?\s*|Honestly,?\s*|Actually,?\s*)?/i, starter);
    }

    // 随机调整结尾标点
    if (Math.random() > 0.6) {
      if (result.endsWith('!')) {
        result = result.slice(0, -1) + (Math.random() > 0.5 ? '.' : '!');
      } else if (result.endsWith('.') && !result.endsWith('...')) {
        result = result.slice(0, -1) + (Math.random() > 0.7 ? '!' : '.');
      }
    }

    // 轻微的同义词替换
    const synonyms: Record<string, string[]> = {
      'great': ['great', 'awesome', 'fantastic', 'excellent', 'wonderful'],
      'good': ['good', 'nice', 'solid', 'decent'],
      'interesting': ['interesting', 'fascinating', 'intriguing', 'compelling'],
      'think': ['think', 'believe', 'feel', 'reckon'],
      'really': ['really', 'truly', 'genuinely', 'definitely'],
      'love': ['love', 'adore', 'appreciate', 'enjoy'],
      'agree': ['agree', 'concur', 'second this', 'feel the same'],
    };

    Object.entries(synonyms).forEach(([word, alternatives]) => {
      if (Math.random() > 0.7) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        result = result.replace(regex, replacement);
      }
    });

    return result;
  }

  // 记录回复
  async recordReply(reply: string): Promise<void> {
    const history = await this.getHistory();
    history.push(reply);
    
    // 只保留最近的记录
    while (history.length > MAX_HISTORY) {
      history.shift();
    }
    
    await chrome.storage.local.set({ [RECENT_REPLIES_KEY]: history });
  }

  private async getHistory(): Promise<string[]> {
    try {
      const result = await chrome.storage.local.get(RECENT_REPLIES_KEY);
      return result[RECENT_REPLIES_KEY] || [];
    } catch {
      return [];
    }
  }
}
