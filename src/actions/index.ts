import { TranslateRequestSchema } from "@contracts/translate";
import { defineAction } from "astro:actions";

export const server = {
    translate: defineAction({
        accept: "form",
        input: TranslateRequestSchema,
        handler: async ({ text, source, target }) => {
            const url =
                `${import.meta.env.SUPABASE_URL}/functions/v1/translate`;
            const supabaseKey = import.meta.env.SUPABASE_PUBLIC_KEY;
            console.log("Supabase URL:", url);
            const response = await fetch(
                url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        apiKey: `${supabaseKey}`,
                    },
                    body: JSON.stringify({ text, source, target }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Action failed: ${response.statusText}`,
                );
            }

            const data = await response.json();
            return { result: data.translation };
        },
    }),
};
