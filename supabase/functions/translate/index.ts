// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as z from "@zod/zod";
import { HfInference } from "@huggingface/inference";

const hfToken = Deno.env.get("HF_TOKEN");
const inference = new HfInference(hfToken);

const RequestBodySchema = z.object({
  text: z.string().min(1),
  source: z.enum(["en", "es"]),
  target: z.enum(["en", "es"]),
}).refine(({ source, target }) => source !== target, {
  message: "source and target must be different",
  path: ["target"],
});

const MODEL_BY_PAIR = {
  "en-es": "Helsinki-NLP/opus-mt-en-es",
  "es-en": "Helsinki-NLP/opus-mt-es-en",
} as const;

type Pair = keyof typeof MODEL_BY_PAIR;

type InferenceTranslationOutput = {
  translation_text?: string;
};

const extractTranslatedText = (
  output: InferenceTranslationOutput | InferenceTranslationOutput[] | string,
): string => {
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    const first = output[0];
    return typeof first?.translation_text === "string"
      ? first.translation_text
      : "";
  }

  return typeof output.translation_text === "string"
    ? output.translation_text
    : "";
};

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    if (!hfToken) {
      return Response.json({ error: "Missing HF_TOKEN" }, { status: 500 });
    }

    // Called by another service with a secret key
    // ctx.supabaseAdmin bypasses RLS — use for privileged operations
    /*
    if (ctx.authMode === "secret") {
      const { user_id } = await req.json();
      const { data } = await ctx.supabaseAdmin.auth.admin.getUserById(user_id);

      return Response.json({
        email: data?.user?.email,
      });
    }
    */

    const requestBody = RequestBodySchema.safeParse(await req.json());
    if (!requestBody.success) {
      return Response.json({ error: "Bad request" }, { status: 400 });
    }

    const { text, source, target } = requestBody.data;
    const pair = `${source}-${target}` as Pair;

    if (!(pair in MODEL_BY_PAIR)) {
      return Response.json({ error: "Unsupported language pair" }, {
        status: 400,
      });
    }

    const model = MODEL_BY_PAIR[pair];
    const output = await inference.translation({
      model,
      inputs: text,
      endpointUrl: `https://router.huggingface.co/hf-inference/models/${model}`,
    });

    const translatedText = extractTranslatedText(output);

    if (!translatedText) {
      return Response.json({ error: "Translation failed" }, { status: 502 });
    }

    return Response.json({
      source,
      target,
      model,
      translation: translatedText,
    });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/translate' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"text":"How are you?","source":"en","target":"es"}'

*/
