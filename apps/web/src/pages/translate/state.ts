import { atom } from "nanostores";

type TranslationState = {
    kind: "success";
    translation: string;
} | {
    kind: "error";
    error: string;
} | {
    kind: "idle";
};

export const state = atom<TranslationState>({
    kind: "idle",
});
