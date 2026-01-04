import type { LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

type ProviderId = 'google' | 'openai';

type ProviderConfig = {
  envKeys: string[];
  defaultModel: string;
  label: string;
  createClient: (apiKey: string) => (model: string) => LanguageModel;
};

type LanguageModelResult =
  | { model: LanguageModel }
  | { error: string; status: number };

const providerConfigs: Record<ProviderId, ProviderConfig> = {
  google: {
    envKeys: ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
    defaultModel: 'models/gemini-2.5-flash',
    label: 'Gemini',
    createClient: (apiKey) => createGoogleGenerativeAI({ apiKey }),
  },
  openai: {
    envKeys: ['OPENAI_API_KEY'],
    defaultModel: 'gpt-4o-mini',
    label: 'OpenAI',
    createClient: (apiKey) => createOpenAI({ apiKey }),
  },
};

const normalizeProvider = (input?: string): ProviderId | null => {
  const trimmed = input?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed === 'google' || trimmed === 'openai') {
    return trimmed;
  }

  return null;
};

export const registry = {
  languageModel: (input?: {
    provider?: string;
    model?: string;
  }): LanguageModelResult => {
    const providerFromInput = normalizeProvider(input?.provider);
    const modelInput = input?.model?.trim() ?? '';

    let provider = providerFromInput;
    let model = modelInput;

    if (modelInput.includes(':')) {
      const [prefix, modelName] = modelInput.split(':', 2);
      if (!provider) {
        provider = normalizeProvider(prefix);
      }
      model = modelName;
    }

    if (!provider) {
      provider = 'google';
    }

    if (!(provider in providerConfigs)) {
      return { error: 'Unsupported provider', status: 400 };
    }

    const config = providerConfigs[provider];
    const apiKey =
      config.envKeys.map((key) => process.env[key]).find((value) => value) ?? '';

    if (!apiKey) {
      return { error: `Missing ${config.label} API key`, status: 500 };
    }

    const client = config.createClient(apiKey);
    return {
      model: client(model || config.defaultModel),
    };
  },
};
