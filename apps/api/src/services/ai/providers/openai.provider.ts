import OpenAI from 'openai';
import { logger } from '@/utils/logger';
import { IAIProvider, AIGeneratedContent, AIAnalysis } from '../types';

export class OpenAIProvider implements IAIProvider {
  private client: OpenAI | null = null;
  private apiKey: string;
  private model: string = 'gpt-4o-mini';
  private temperature: number = 0.7;
  private maxTokens: number = 2000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  getProviderName(): string {
    return 'OpenAI ChatGPT';
  }

  isAvailable(): boolean {
    return !!this.client && !!this.apiKey;
  }

  estimateCost(tokens: number): number {
    // GPT-4o mini: ~$0.00015 per 1K input tokens
    return (tokens / 1000) * 0.00015;
  }

  async generateContent(
    prompt: string,
    context?: Record<string, any>
  ): Promise<AIGeneratedContent> {
    if (!this.client) {
      throw new Error('OpenAI provider not initialized');
    }

    try {
      const systemMessage =
        context?.system ||
        'You are a helpful assistant for Wissen-Haus Empowerment Foundation, a youth-focused non-profit organization.';

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      return {
        content,
        type: 'text',
        tokens_used: response.usage?.total_tokens || 0,
      };
    } catch (error: any) {
      logger.error('OpenAI API error:', error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async analyzeData(
    data: Record<string, any>[],
    analysisType: string
  ): Promise<AIAnalysis> {
    if (!this.client) {
      throw new Error('OpenAI provider not initialized');
    }

    const dataStr = JSON.stringify(data, null, 2);
    const prompt = `You are an expert data analyst for a non-profit organization.

Analyze the following ${analysisType} data and provide:
1. A brief summary
2. Key insights (as bullet points)
3. Actionable recommendations

Data:
${dataStr}

Provide your response in the following JSON format:
{
  "summary": "...",
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No content in response');
      }

      return JSON.parse(responseText);
    } catch (error: any) {
      logger.error('OpenAI analysis error:', error.message);
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI provider not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      return content;
    } catch (error: any) {
      logger.error('OpenAI chat error:', error.message);
      throw new Error(`OpenAI chat failed: ${error.message}`);
    }
  }
}
