import { InferenceClient } from '@huggingface/inference';

import { z } from "zod";

export type TranslateInput = {
  text: string;
  source: string;
  target: string;
};

type InferenceTranslationOutput = {
  translation_text?: string;
};

export const TranslateRequestSchema = z.object({
    text: z.string().min(1),
    source: z.enum(["en", "es"]),
    target: z.enum(["en", "es"]),
}).refine(({ source, target }) => source !== target, {
    message: "source and target must be different",
});

export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;

const MODEL_BY_PAIR = {
  "en-es": "Helsinki-NLP/opus-mt-en-es",
  "es-en": "Helsinki-NLP/opus-mt-es-en",
} as const;

export type TranslateResult = {
  kind: 'success';
  result: string;
} | {
  kind: 'error';
  error: string;
};

const extractTranslatedText = (
  output: InferenceTranslationOutput | InferenceTranslationOutput[] | string,
): string | null => {
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    const first = output[0];
    return typeof first?.translation_text === "string"
      ? first.translation_text
      : null;
  }

  return typeof output.translation_text === "string"
    ? output.translation_text
    : null;
};

export async function translateText(input: TranslateInput): Promise<TranslateResult> {
  const hfToken = process.env.EXPO_PUBLIC_HF_TOKEN;
  if (!hfToken) {
    return { kind: 'error', error: 'Missing provider' };
  }

  const inference = new InferenceClient(hfToken);

  const parsed = TranslateRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { kind: 'error', error: parsed.error.message };
  }

  const pair = `${parsed.data.source}-${parsed.data.target}` as keyof typeof MODEL_BY_PAIR;
  const model = MODEL_BY_PAIR[pair];
  const text = parsed.data.text;

  const output = await inference.translation({
    model,
    inputs: text,
  });

    const translatedText = extractTranslatedText(output);


  return { kind: 'success', result: translatedText ?? '' };
}
