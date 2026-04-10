import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/utils/logger';
import { IAIProvider, AIGeneratedContent, AIAnalysis } from '../types';

export class AnthropicProvider implements IAIProvider {
  private client: Anthropic | null = null;
  private apiKey: string;
  private model: string = 'claude-3-5-sonnet-20241022';
  private temperature: number = 0.7;
  private maxTokens: number = 2000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (this.apiKey) {
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
  }

  getProviderName(): string {
    return 'Anthropic Claude';
  }

  isAvailable(): boolean {
    return !!this.client && !!this.apiKey;
  }

  estimateCost(tokens: number): number {
    // Approximate cost per token (varies by model)
    // Claude 3.5 Sonnet: ~$0.003 per 1K input tokens
    return (tokens / 1000) * 0.003;
  }

  async generateContent(
    prompt: string,
    context?: Record<string, any>
  ): Promise<AIGeneratedContent> {
    if (!this.client) {
      throw new Error('Anthropic provider not initialized');
    }

    try {
      const systemPrompt =
        context?.system ||
        'You are a helpful assistant for Wissen-Haus Empowerment Foundation, a youth-focused non-profit organization.';

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        type: 'text',
        tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      };
    } catch (error: any) {
      logger.error('Anthropic API error:', error.message);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  async analyzeData(
    data: Record<string, any>[],
    analysisType: string
  ): Promise<AIAnalysis> {
    if (!this.client) {
      throw new Error('Anthropic provider not initialized');
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
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = response.content[0];
      if (responseText.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = responseText.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Anthropic analysis error:', error.message);
      throw new Error(`Claude analysis failed: ${error.message}`);
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic provider not initialized');
    }

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return content.text;
    } catch (error: any) {
      logger.error('Anthropic chat error:', error.message);
      throw new Error(`Claude chat failed: ${error.message}`);
    }
  }
}
