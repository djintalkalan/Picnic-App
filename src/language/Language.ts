import { useCallback, useMemo } from 'react';
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

export const useSystemMessageTemplate = () => {
  const language = useLanguage()
  return useMemo(() => {
    return {
      has_removed: Language?.has_removed,
      from_the_group: Language?.from_the_group,
      has_joined_the_group: Language?.has_joined_the_group,
      has_deleted_post_from: Language?.has_deleted_post_from,
      has_created_the_group: Language?.has_created_the_group,
      from_the_event: Language?.from_the_event,
      has_joined_the_event: Language?.has_joined_the_event,
      has_created_the_event: Language?.has_created_the_event,
      directions_at_below: Language?.directions_at_below,
    }
  }, [language])
}

export default Language;
