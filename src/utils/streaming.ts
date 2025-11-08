/**
 * Streaming Response Support for AI Models
 * Provides better UX for long-running queries
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface StreamChunk {
  content: string;
  model: string;
  done: boolean;
  metadata?: {
    usage?: {
      inputTokens: number;
      outputTokens: number;
    };
  };
}

export type StreamCallback = (chunk: StreamChunk) => void;

/**
 * Stream response from Claude
 */
export async function streamClaude(
  client: Anthropic,
  messages: any[],
  systemPrompt: string,
  onChunk: StreamCallback
): Promise<string> {
  let fullResponse = '';
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    system: systemPrompt,
    messages: messages,
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta;
      if ('text' in delta) {
        fullResponse += delta.text;
        onChunk({
          content: delta.text,
          model: 'claude',
          done: false,
        });
      }
    } else if (event.type === 'message_start') {
      inputTokens = event.message.usage.input_tokens;
    } else if (event.type === 'message_delta') {
      if ('usage' in event) {
        outputTokens = event.usage.output_tokens;
      }
    }
  }

  // Final chunk with metadata
  onChunk({
    content: '',
    model: 'claude',
    done: true,
    metadata: {
      usage: {
        inputTokens,
        outputTokens,
      },
    },
  });

  return fullResponse;
}

/**
 * Stream response from OpenAI (GPT-4o, O1)
 */
export async function streamOpenAI(
  client: OpenAI,
  messages: any[],
  model: 'gpt-4o' | 'o1-preview',
  onChunk: StreamCallback
): Promise<string> {
  let fullResponse = '';

  const stream = await client.chat.completions.create({
    model: model,
    messages: messages,
    max_completion_tokens: model === 'gpt-4o' ? 8192 : undefined,
    temperature: model === 'gpt-4o' ? 0.7 : undefined,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullResponse += delta;
      onChunk({
        content: delta,
        model: model === 'gpt-4o' ? 'gpt4' : 'o1',
        done: false,
      });
    }
  }

  onChunk({
    content: '',
    model: model === 'gpt-4o' ? 'gpt4' : 'o1',
    done: true,
  });

  return fullResponse;
}

/**
 * Stream response from Google Gemini
 */
export async function streamGemini(
  client: GoogleGenerativeAI,
  prompt: string,
  modelName: 'gemini-2.0-flash-exp' | 'gemini-1.5-pro',
  onChunk: StreamCallback
): Promise<string> {
  const model = client.getGenerativeModel({ model: modelName });
  let fullResponse = '';

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullResponse += text;
    onChunk({
      content: text,
      model: modelName === 'gemini-2.0-flash-exp' ? 'gemini' : 'gemini-pro',
      done: false,
    });
  }

  onChunk({
    content: '',
    model: modelName === 'gemini-2.0-flash-exp' ? 'gemini' : 'gemini-pro',
    done: true,
  });

  return fullResponse;
}

/**
 * Stream response from Perplexity
 * Perplexity uses OpenAI-compatible API
 */
export async function streamPerplexity(
  client: OpenAI, // Perplexity uses OpenAI client
  messages: any[],
  onChunk: StreamCallback
): Promise<string> {
  let fullResponse = '';

  const stream = await client.chat.completions.create({
    model: 'sonar-pro',
    messages: messages,
    max_tokens: 4096,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullResponse += delta;
      onChunk({
        content: delta,
        model: 'perplexity',
        done: false,
      });
    }
  }

  onChunk({
    content: '',
    model: 'perplexity',
    done: true,
  });

  return fullResponse;
}

/**
 * MCP-compatible streaming wrapper
 * MCP doesn't natively support streaming, so we collect chunks and send periodic updates
 */
export class MCPStreamCollector {
  private chunks: string[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private onUpdate: (text: string) => void;

  constructor(
    onUpdate: (text: string) => void,
    updateFrequencyMs: number = 500
  ) {
    this.onUpdate = onUpdate;

    // Send updates every 500ms
    this.updateInterval = setInterval(() => {
      if (this.chunks.length > 0) {
        this.flush();
      }
    }, updateFrequencyMs);
  }

  addChunk(chunk: StreamChunk): void {
    if (chunk.content) {
      this.chunks.push(chunk.content);
    }

    if (chunk.done) {
      this.flush();
      this.stop();
    }
  }

  private flush(): void {
    if (this.chunks.length > 0) {
      const combined = this.chunks.join('');
      this.onUpdate(combined);
    }
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

/**
 * Progress indicators for long-running operations
 */
export class ProgressIndicator {
  private steps: string[] = [];
  private currentStep = 0;

  constructor(private onProgress: (message: string) => void) {}

  addStep(step: string): void {
    this.steps.push(step);
  }

  start(): void {
    this.currentStep = 0;
    this.emit('🚀 Starting...');
  }

  next(): void {
    if (this.currentStep < this.steps.length) {
      const step = this.steps[this.currentStep];
      this.emit(`⏳ ${step}...`);
      this.currentStep++;
    }
  }

  complete(): void {
    this.emit('✅ Complete!');
  }

  error(message: string): void {
    this.emit(`❌ Error: ${message}`);
  }

  private emit(message: string): void {
    this.onProgress(message);
  }
}

/**
 * Council Discussion Streaming
 * Provides real-time updates during multi-round discussions
 */
export class CouncilStreamHandler {
  constructor(private onUpdate: (message: string) => void) {}

  startRound(round: number, total: number): void {
    this.onUpdate(`\n${'='.repeat(50)}`);
    this.onUpdate(`📊 Round ${round}/${total} Starting...`);
    this.onUpdate(`${'='.repeat(50)}\n`);
  }

  startModelResponse(model: string, emoji: string): void {
    this.onUpdate(`\n${emoji} **${model}** is thinking...\n`);
  }

  addModelChunk(model: string, content: string): void {
    this.onUpdate(content);
  }

  completeModel(model: string): void {
    this.onUpdate(`\n\n✅ ${model} completed\n`);
  }

  startSynthesis(): void {
    this.onUpdate(`\n${'='.repeat(50)}`);
    this.onUpdate(`\n🎯 **Claude** is synthesizing final answer...`);
    this.onUpdate(`\n${'='.repeat(50)}\n\n`);
  }

  complete(): void {
    this.onUpdate(`\n\n✨ Council discussion complete!`);
  }
}
