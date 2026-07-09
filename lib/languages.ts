// lib/languages.ts

export type SupportedLanguage = 'english' | 'hindi' | 'tanglish';

export const SUPPORTED_LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'hindi', label: 'Hindi' },
  { code: 'tanglish', label: 'Tanglish' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'tanglish';