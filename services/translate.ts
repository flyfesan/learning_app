import { TranslateRequestSchema } from '@contracts/translate';

export type TranslateInput = {
  text: string;
  source: string;
  target: string;
};

export type TranslateResult = {
  result: string;
};

export async function translateText(input: TranslateInput): Promise<TranslateResult> {
  const parsed = TranslateRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Bad request');
  }

  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/translate`;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: `${supabaseKey}`,
    },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { translation?: string };
  if (typeof data.translation !== 'string') {
    throw new Error('Translation failed: missing result');
  }

  return { result: data.translation };
}
