import { z } from "zod";

const EnvSchema = z.object({
    supabase: z.url(),
    supabase_pub: z.string().min(1),
    hf_pub: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;

export const getEnv = (): Env => {
    const supabase = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabase_pub = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY;
    const hf_pub = process.env.EXPO_PUBLIC_HF_TOKEN;

    if (!supabase) {
        throw new Error("Missing environment variable: EXPO_PUBLIC_SUPABASE_URL");
    }

    if (!supabase_pub) {
        throw new Error("Missing environment variable: EXPO_PUBLIC_SUPABASE_PUBLIC_KEY");
    }

    if (!hf_pub) {
        throw new Error("Missing environment variable: EXPO_PUBLIC_HF_TOKEN");
    }

    return EnvSchema.parse({
        supabase,
        supabase_pub,
        hf_pub,
    } as const);
};