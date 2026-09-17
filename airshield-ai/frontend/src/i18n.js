import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app_subtitle: "PM2.5 Forecast & Exposure Intelligence",
      loc_device: "Live Device GPS",
      loc_button: "Use My Location",
      loc_locating: "Locating...",
      loc_active: "Live GPS Active",
      live_sync: "Live Sync",
      mock_active: "Mock Active",
      assessment_title: "Current Outdoor Assessment",
      assessment_rec: "Recommended Outdoor Window",
      assessment_elev: "Elevated Exposure Period",
      lower_slot: "Lower-exposure slot",
      conf_title: "Prediction Confidence",
      conf_desc: "Evaluated on 20% unseen validation split (4,416 rows)",
      sens_title: "Sensitivity Profile",
      sens_badge: "Self-Configured",
      mode_sensitive: "Sensitive Group",
      mode_general: "General Public",
      mode_outdoor: "Outdoor Worker",
      opt_window_title: "Optimal Outdoor Window",
      opt_window_desc: "Solar boundary breakdown encourages particulate flushing.",
      peak_risk_title: "Peak Particulate Accumulation Risk",
      peak_risk_desc: "Surface stagnation traps exhaust near ground level. Keep purifiers running."
    }
  },
  hi: {
    translation: {
      app_subtitle: "वायु गुणवत्ता पूर्वानुमान एवं व्यक्तिगत सुरक्षा",
      loc_device: "लाइव डिवाइस जीपीएस",
      loc_button: "मेरी लाइव लोकेशन",
      loc_locating: "स्थान खोज रहे हैं...",
      loc_active: "जीपीएस सक्रिय",
      live_sync: "लाइव सिंक",
      mock_active: "मॉक एक्टिव",
      assessment_title: "वर्तमान बाहरी वायु आकलन",
      assessment_rec: "बाहर जाने का सुरक्षित समय",
      assessment_elev: "उच्च प्रदूषण स्तर (सावधानी बरतें)",
      lower_slot: "सुरक्षित समय स्लॉट",
      conf_title: "पूर्वानुमान सटीकता",
      conf_desc: "20% अलग डेटा (4,416 सैंपल्स) पर जांचा गया",
      sens_title: "संवेदनस्थिलता स्तर",
      sens_badge: "स्वयं निर्धारित",
      mode_sensitive: "संवेदनशील वर्ग",
      mode_general: "सामान्य नागरिक",
      mode_outdoor: "बाहर काम करने वाले",
      opt_window_title: "बाहर जाने का सबसे सुरक्षित समय",
      opt_window_desc: "धूप और गर्म हवा से प्रदूषण वातावरण में बिखर जाता है।",
      peak_risk_title: "प्रदूषण का सबसे खतरनाक समय",
      peak_risk_desc: "ठंड के कारण धुआं जमीन के पास जमा होकर रुक जाता है। प्यूरीफायर चलाकर रखें।"
    }
  },
  pa: {
    translation: {
      app_subtitle: "ਵਾਯੂ ਗੁਣਵੱਤਾ ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਨਿੱਜੀ ਸੁਰੱਖਿਆ",
      loc_device: "ਲਾਇਵ ਡਿਵਾਇਸ ਜੀਪੀਐੱਸ",
      loc_button: "ਮੇਰੀ ਲਾਇਵ ਲੋਕੇਸ਼ਨ",
      loc_locating: "ਸਥਾਨ ਖੋਜ ਰਹੇ ਹਾਂ...",
      loc_active: "ਜੀਪੀਐੱਸ ਚਾਲੂ",
      live_sync: "ਲਾਇਵ ਸਿੰਕ",
      mock_active: "ਮ੉ਕ ਚਾਲੂ",
      assessment_title: "ਮੌਜੂਦਾ ਬਾਹਰੀ ਵਾਯੂ ਅੰਦਾਜ਼ਾ",
      assessment_rec: "ਬਾਹਰ ਜਾਣ ਦਾ ਸੁਰੱਖਿਅਤ ਸਮਾਂ",
      assessment_elev: "ਉੱਚ ਪ੍ਰਦੂਸ਼ਣ ਪੱਧਰ (ਸਾਵਧਾਨੀ ਰੱਖੋ)",
      lower_slot: "ਸੁਰੱਖਿਅਤ ਸਮਾਂ ਸਲ੉ਟ",
      conf_title: "ਪੂਰਵ-ਅਨੁਮਾਨ ਸਟੀਕਤਾ",
      conf_desc: "20% ਵੱਖਰੇ ਡੇਟਾ (4,416 ਸੈਂਪਲ) ਤੇ ਜਾਂਚਿਆ ਗਿਆ",
      sens_title: "ਸੰਵੇਦਨਸ਼ੀਲਤਾ ਪੱਧਰ",
      sens_badge: "ਖ਼ੁਦ ਨਿਰਧਾਰਤ",
      mode_sensitive: "ਸੰਵੇਦਨਸ਼ੀਲ ਵਰਗ",
      mode_general: "ਆਮ ਜਨਤਾ",
      mode_outdoor: "ਬਾਹਰ ਕੰਮ ਕਰਨ ਵਾਲੇ",
      opt_window_title: "ਬਾਹਰ ਜਾਣ ਦਾ ਸਭ ਤੋਂ ਸੁਰੱਖਿਅਤ ਸਮਾਂ",
      opt_window_desc: "ਧੁੱਪ ਅਤੇ ਗਰਮ ਹਵਾ ਨਾਲ ਪ੍ਰਦੂਸ਼ਣ ਵਾਤਾਵਰਣ ਵਿੱਚ ਖਿੰਡ ਜਾਂਦਾ ਹੈ੤",
      peak_risk_title: "ਪ੍ਰਦੂਸ਼ਣ ਦਾ ਸਭ ਤੋਂ ਖ਼ਤਰਨਾਕ ਸਮਾਂ",
      peak_risk_desc: "ਠੰਡ ਕਾਰਨ ਧੂਂਆਂ ਜ਼ਮੀਨ ਕੋਲ ਜੰਮ ਕੇ ਰੁਕ ਜਾਂਦਾ ਹੈ੤ ਪਿਊਰੀਫਾਇਅਰ ਚਲਾ ਕੇ ਰੱਖੋ੤"
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
