import { Preferences } from '@capacitor/preferences';
import i18n from '../i18n';

const LANG_KEY = 'app_language';

export async function loadSavedLanguage(): Promise<void> {
  const { value } = await Preferences.get({ key: LANG_KEY });
  if (value) {
    await i18n.changeLanguage(value);
  }
}

export async function setLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
  await Preferences.set({ key: LANG_KEY, value: lang });
}

export function getCurrentLanguage(): string {
  return i18n.language;
}
