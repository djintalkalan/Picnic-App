import { useCallback } from 'react';
import LocalizedStrings from 'react-native-localization';
import Database, { useDatabase } from 'src/database/Database';
import { en } from './en';
import { es } from './es';

export type LanguageType = 'en' | 'es';
const DefaultLanguage: LanguageType = 'en';
const Language = new LocalizedStrings({
  en,
  es
});
Language.setLanguage(
  Database.getStoredValue('selectedLanguage')?.toString() || DefaultLanguage,
);

export const useLanguage = () => {
  return useDatabase<LanguageType>('selectedLanguage', DefaultLanguage)[0];
};

export const useUpdateLanguage = () => {
  const [language] = useDatabase<LanguageType>('selectedLanguage');

  const updateLanguage = useCallback((language: LanguageType) => {
    Language.setLanguage(language ?? DefaultLanguage);
    Database.setSelectedLanguage(language);
  }, []);
  return updateLanguage;
};

export default Language;
