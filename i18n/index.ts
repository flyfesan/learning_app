import type { UIStrings } from './types';
import en from './lang/en';

export { tplStr } from './format';

const translations: Record<string, UIStrings> = {
  en,
};

/** Returns UI strings for the given locale, falling back to English. */
export function useTranslations(locale: string = 'en'): UIStrings {
  return translations[locale] ?? translations['en'];
}
