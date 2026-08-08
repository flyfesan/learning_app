export const LANGUAGES = [
  { code: 'ja', name: 'Japanese' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];
