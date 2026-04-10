import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/utils/logger';
import { IAIProvider, AIGeneratedContent, AIAnalysis } from '../types';

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private model: string = 'gemini-1.5-pro';
  private temperature: number = 0.7;
  private maxTokens: number = 2000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  getProviderName(): string {
    return 'Google Gemini';
  }

  isAvailable(): boolean {
    return !!this.client && !!this.apiKey;
  }

  estimateCost(tokens: number): number {
    // Gemini 1.5 Pro: ~$0.00075 per 1K input tokens (free tier generous)
    return (tokens / 1000) * 0.00075;
  }

  async generateContent(
    prompt: string,
    context?: Record<string, any>
  ): Promise<AIGeneratedContent> {
    if (!this.client) {
      throw new Error('Gemini provider not initialized');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });

      const systemInstruction =
        context?.system ||
        'You are a helpful assistant for Wissen-Haus Empowerment Foundation, a youth-focused non-profit organization.';

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
        systemInstruction,
      });

      const result = response.response;
      const content = result.text();

      // Estimate tokens (Gemini doesn't return token count in basic API)
      const estimatedTokens = Math.ceil(content.length / 4) + Math.ceil(prompt.length / 4);

      return {
        content,
        type: 'text',
        tokens_used: estimatedTokens,
      };
    } catch (error: any) {
      logger.error('Gemini API error:', error.message);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async analyzeData(
    data: Record<string, any>[],
    analysisType: string
  ): Promise<AIAnalysis> {
    if (!this.client) {
      throw new Error('Gemini provider not initialized');
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
      const model = this.client.getGenerativeModel({ model: this.model });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      const responseText = response.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Could not parse JSON response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      logger.error('Gemini analysis error:', error.message);
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini provider not initialized');
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.model });

      // Convert messages to Gemini format
      const geminiMessages = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const response = await model.generateContent({
        contents: geminiMessages,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      return response.response.text();
    } catch (error: any) {
      logger.error('Gemini chat error:', error.message);
      throw new Error(`Gemini chat failed: ${error.message}`);
    }
  }
}
