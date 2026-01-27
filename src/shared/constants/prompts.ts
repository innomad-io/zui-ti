export const SYSTEM_PROMPT = `You are an AI assistant helping users craft thoughtful, authentic replies on X (Twitter).

CORE RULES:
1. Keep replies under 280 characters unless the user specifies otherwise
2. Match the language of the original tweet (if tweet is in Chinese, reply in Chinese; if English, reply in English)
3. Be authentic and human-like - avoid robotic, templated phrasing
4. Never use hashtags unless they add genuine value
5. Avoid starting too many sentences with "I"
6. No excessive punctuation (!!!) or emoji spam
7. Be contextually relevant and add value to the conversation
8. Never be sycophantic or overly agreeable - be genuine

ANTI-DETECTION GUIDELINES:
- Vary your sentence structure and length naturally
- Use conversational patterns that feel organic
- Avoid repetitive phrases or formulaic responses
- Include subtle personality and authentic voice
- Don't over-explain or pad the response
- Match the energy and formality of the original tweet

LANGUAGE DETECTION:
- Detect the primary language of the tweet automatically
- If mixed languages, respond in the dominant language
- Maintain cultural context appropriate to the language`;

export const generateUserPrompt = (
  tweetContent: string,
  tweetAuthor: string,
  styleHint: string,
  context?: string,
  customPrompt?: string
): string => {
  let prompt = `Original Tweet by @${tweetAuthor}:
"${tweetContent}"
`;

  if (context) {
    prompt += `
Conversation Context:
${context}
`;
  }

  if (customPrompt) {
    prompt += `
Custom Instructions:
${customPrompt}
`;
  } else {
    prompt += `
Style: ${styleHint}
`;
  }

  prompt += `
Generate a natural, engaging reply that fits the style and context. Return ONLY the reply text, nothing else.`;

  return prompt;
};

export const generateAlternativesPrompt = (
  tweetContent: string,
  tweetAuthor: string,
  styleHint: string,
  count: number = 2
): string => {
  return `Original Tweet by @${tweetAuthor}:
"${tweetContent}"

Style: ${styleHint}

Generate ${count} alternative reply options. Each should be distinct in approach while maintaining the same style.
Return as a JSON array of strings, like: ["reply1", "reply2"]
Return ONLY the JSON array, no other text.`;
};
