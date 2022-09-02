import { useCallback } from 'react';
import LocalizedStrings, { GlobalStrings } from 'react-native-localization';
import Localize from 'react-native-localize';
import Database, { useDatabase } from 'src/database/Database';
import { en } from './en';
import { es } from './es';
export type LanguageType = 'en' | 'es';
export type ILanguages = GlobalStrings<typeof en>

export const DefaultLanguage: LanguageType = ((Localize?.getLocales()?.[0].languageCode as LanguageType) || "")?.includes('es') ? 'es' : 'en' || 'en' // 'en';
export const DefaultLanguages: ILanguages = {
  en,
  es
}
const allLanguages = Database?.getStoredValue<ILanguages>("allLanguages") ?? DefaultLanguages
const Language = new LocalizedStrings(allLanguages);
Language.setLanguage(
  Database.getStoredValue('selectedLanguage')?.toString() || DefaultLanguage,
);

export const useLanguage = () => {
  return useDatabase<LanguageType>('selectedLanguage', DefaultLanguage)[0];
};

export const updateLanguageDirect = (language: LanguageType) => {
  Language.setLanguage(language ?? DefaultLanguage);
  Database.setSelectedLanguage(language);
}

export const useUpdateLanguage = () => {
  const [language] = useDatabase<LanguageType>('selectedLanguage');
  const updateLanguage = useCallback(updateLanguageDirect, [])

  return (updateLanguage);
};

export default Language;
