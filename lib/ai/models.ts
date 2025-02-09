import { anthropic } from "@ai-sdk/anthropic";
import { fireworks } from '@ai-sdk/fireworks';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'openai-small';

export const myProvider = customProvider({
  languageModels: {
    'openai-small': openai('gpt-4o-mini'),
    'openai-large': openai('gpt-4o'),
    'openai-reasoning': openai('o1-mini'),
    'openseek-reasoning': wrapLanguageModel({
      model: fireworks('accounts/fireworks/models/deepseek-r1'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': openai('gpt-4-turbo'),
    'block-model': openai('gpt-4o-mini'),
    'coding-model': anthropic('claude-3-5-sonnet'),
    'google-flashmodel': google('gemini-2.0-flash'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'openai-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'openai-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'openai-reasoning',
    name: 'OpenAI Reasoning model',
    description: 'Large reasoning model for complex, multi-step tasks',
  },
  {
    id: 'openseek-reasoning',
    name: 'OpenSeek R1 model',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'coding-model',
    name: 'Coding model',
    description: 'Uses advanced coding',
  },
  {
    id: 'google-flashmodel',
    name: 'Google flash model',
    description: 'Fast, lightweight model',
  },
];
