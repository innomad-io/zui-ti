interface ModelUsage {
  [modelId: string]: {
    count: number;
    resetAt: number;
  };
}

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash-preview',
] as const;

const MODEL_DAILY_LIMIT = 20;
const USAGE_KEY = 'gemini_model_usage';

export class GeminiModelRotator {
  async getAvailableModel(preferredModel?: string): Promise<string> {
    const usage = await this.getUsage();
    const now = Date.now();

    if (preferredModel && this.isModelAvailable(preferredModel, usage, now)) {
      return preferredModel;
    }

    for (const model of GEMINI_MODELS) {
      if (this.isModelAvailable(model, usage, now)) {
        console.log(`[Gemini Rotator] Model ${model} is available`);
        return model;
      }
    }

    const leastUsedModel = this.getLeastUsedModel(usage, now);
    console.log(`[Gemini Rotator] All models at limit, using least used: ${leastUsedModel}`);
    return leastUsedModel;
  }

  async recordUsage(model: string): Promise<void> {
    const usage = await this.getUsage();
    const now = Date.now();
    const today = this.getResetTimestamp();

    if (!usage[model] || usage[model].resetAt < now) {
      usage[model] = {
        count: 1,
        resetAt: today,
      };
    } else {
      usage[model].count++;
    }

    await chrome.storage.local.set({ [USAGE_KEY]: usage });
    console.log(`[Gemini Rotator] Recorded usage for ${model}: ${usage[model].count}/20`);
  }

  async getUsageStats(): Promise<{ model: string; count: number; remaining: number }[]> {
    const usage = await this.getUsage();
    const now = Date.now();

    return GEMINI_MODELS.map(model => {
      const modelUsage = usage[model];
      const count = modelUsage && modelUsage.resetAt > now ? modelUsage.count : 0;
      return {
        model,
        count,
        remaining: Math.max(0, MODEL_DAILY_LIMIT - count),
      };
    });
  }

  private isModelAvailable(model: string, usage: ModelUsage, now: number): boolean {
    const modelUsage = usage[model];
    if (!modelUsage || modelUsage.resetAt < now) {
      return true;
    }
    return modelUsage.count < MODEL_DAILY_LIMIT;
  }

  private getLeastUsedModel(usage: ModelUsage, now: number): string {
    const modelCounts = GEMINI_MODELS.map(model => {
      const modelUsage = usage[model];
      const count = modelUsage && modelUsage.resetAt > now ? modelUsage.count : 0;
      return { model, count };
    });

    modelCounts.sort((a, b) => a.count - b.count);
    return modelCounts[0].model;
  }

  private async getUsage(): Promise<ModelUsage> {
    const result = await chrome.storage.local.get(USAGE_KEY);
    return (result[USAGE_KEY] as ModelUsage) || {};
  }

  private getResetTimestamp(): number {
    const now = new Date();
    const pstOffset = -8 * 60;
    const localOffset = now.getTimezoneOffset();
    const offsetDiff = localOffset - pstOffset;
    
    const pstNow = new Date(now.getTime() + offsetDiff * 60 * 1000);
    
    const pstMidnight = new Date(pstNow);
    pstMidnight.setHours(24, 0, 0, 0);
    
    const utcMidnight = new Date(pstMidnight.getTime() - offsetDiff * 60 * 1000);
    return utcMidnight.getTime();
  }
}
