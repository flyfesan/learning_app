import { z } from "zod";

export const TranslateRequestSchema = z.object({
    text: z.string().min(1),
    source: z.enum(["en", "es"]),
    target: z.enum(["en", "es"]),
}).refine(({ source, target }) => source !== target, {
    message: "source and target must be different",
});

export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
