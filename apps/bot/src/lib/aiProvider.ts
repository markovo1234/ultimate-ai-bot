import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt, type AIConfig } from '@ultimate/database';

// Shared provider dispatch so command files don't each re-implement decrypt + the
// OpenAI/Anthropic/Gemini branching (used by /ai and /summarize).
export async function askAI(aiConfig: AIConfig, prompt: string): Promise<string> {
  const apiKey = decrypt(aiConfig.encryptedKey);

  if (aiConfig.provider === 'openai') {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-turbo',
    });
    return completion.choices[0].message.content || 'No response';
  }

  if (aiConfig.provider === 'anthropic') {
    const anthropic = new Anthropic({ apiKey });
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = msg.content[0];
    return block && block.type === 'text' ? block.text : 'No response';
  }

  if (aiConfig.provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  }

  throw new Error(`Unknown AI provider: ${aiConfig.provider}`);
}
