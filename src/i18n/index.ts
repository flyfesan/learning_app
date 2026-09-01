import type { UIStrings } from '@/i18n/types';
import en from '@/i18n/lang/en';

export { tplStr } from '@/i18n/format';

const translations: Record<string, UIStrings> = {
  en,
};

/** Returns UI strings for the given locale, falling back to English. */
export function useTranslations(locale: string = 'en'): UIStrings {
  return translations[locale] ?? translations['en'];
}
