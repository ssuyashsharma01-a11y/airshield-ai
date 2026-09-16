import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      optimal_window: "Optimal Outdoor Window",
      peak_risk: "Peak Particulate Accumulation Risk"
    }
  },
  hi: {
    translation: {
      optimal_window: "बाहर जाने का सबसे सुरक्षित समय",
      peak_risk: "प्रदूषण का सबसे खतरनाक समय"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
