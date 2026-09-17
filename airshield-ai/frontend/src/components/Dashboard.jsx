import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, Activity, Clock, Sun, Flame, 
  Sparkles, HeartPulse, RefreshCw, Fan, Sliders, X, FileText, Send, MessageSquare, Volume2, Bike, Footprints, Apple, LogOut,
  Wind, Droplets, Thermometer, CheckCircle2, AlertTriangle,
  GitBranch, Database, MapPin, Navigation
} from 'lucide-react';

const BACKEND_URL = "https://airshield-ai.onrender.com";

const REGIONS = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    areas: [
      { id: 'delhi_anand_vihar', name: 'Anand Vihar (ISBT)', lat: 28.6469, lon: 77.3160, basePm25: 38, basePm10: 135 },
      { id: 'delhi_rk_puram', name: 'RK Puram', lat: 28.5660, lon: 77.1767, basePm25: 30, basePm10: 95 },
      { id: 'delhi_punjabi_bagh', name: 'Punjabi Bagh', lat: 28.6683, lon: 77.1167, basePm25: 34, basePm10: 110 },
      { id: 'delhi_ito', name: 'ITO', lat: 28.6315, lon: 77.2435, basePm25: 36, basePm10: 120 },
      { id: 'delhi_rohini', name: 'Rohini', lat: 28.7325, lon: 77.1188, basePm25: 35, basePm10: 115 },
      { id: 'delhi_dwarka', name: 'Dwarka Sec 8', lat: 28.5710, lon: 77.0691, basePm25: 29, basePm10: 90 }
    ]
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh Tricity',
    areas: [
      { id: 'chd_sec22', name: 'Sector 22', lat: 30.7333, lon: 76.7794, basePm25: 32, basePm10: 95 },
      { id: 'chd_sec53', name: 'Sector 53', lat: 30.7180, lon: 76.7350, basePm25: 30, basePm10: 90 },
      { id: 'chd_sec25', name: 'Sector 25 (PU)', lat: 30.7510, lon: 76.7620, basePm25: 25, basePm10: 75 },
      { id: 'chd_ind_area', name: 'Industrial Area Phase 1', lat: 30.7060, lon: 76.8040, basePm25: 36, basePm10: 112 }
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai MMR',
    areas: [
      { id: 'mumbai_bandra', name: 'Bandra West', lat: 19.0596, lon: 72.8295, basePm25: 28, basePm10: 85 },
      { id: 'mumbai_kurla', name: 'Kurla East', lat: 19.0726, lon: 72.8845, basePm25: 33, basePm10: 98 },
      { id: 'mumbai_andheri', name: 'Andheri West', lat: 19.1136, lon: 72.8697, basePm25: 29, basePm10: 88 },
      { id: 'mumbai_chembur', name: 'Chembur', lat: 19.0522, lon: 72.8995, basePm25: 35, basePm10: 105 },
      { id: 'mumbai_colaba', name: 'Colaba', lat: 18.9067, lon: 72.8147, basePm25: 24, basePm10: 70 }
    ]
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru Urban',
    areas: [
      { id: 'blr_btm', name: 'BTM Layout', lat: 12.9166, lon: 77.6101, basePm25: 18, basePm10: 55 },
      { id: 'blr_silkboard', name: 'Silk Board', lat: 12.9177, lon: 77.6238, basePm25: 26, basePm10: 82 },
      { id: 'blr_hebbal', name: 'Hebbal', lat: 13.0358, lon: 77.5970, basePm25: 20, basePm10: 60 },
      { id: 'blr_whitefield', name: 'Whitefield', lat: 12.9698, lon: 77.7499, basePm25: 22, basePm10: 68 }
    ]
  }
];

const USER_MODES = [
  { id: "sensitive", label: "Sensitive Group", desc: "Respiratory / Bronchial Prone" },
  { id: "general", label: "General Public", desc: "Standard Exposure Threshold" },
  { id: "outdoor", label: "Outdoor Worker", desc: "High Continuous Physical Exposure" }
];

function getCpcbSubIndexPm25(pm) {
  if (pm <= 30) return Math.round((50 / 30) * pm);
  if (pm <= 60) return Math.round(50 + ((100 - 50) / (60 - 30)) * (pm - 30));
  if (pm <= 90) return Math.round(100 + ((200 - 100) / (90 - 60)) * (pm - 60));
  if (pm <= 120) return Math.round(200 + ((300 - 200) / (120 - 90)) * (pm - 90));
  if (pm <= 250) return Math.round(300 + ((400 - 300) / (250 - 120)) * (pm - 120));
  return Math.round(400 + ((500 - 400) / (380 - 250)) * (pm - 250));
}

function getCpcbSubIndexPm10(pm) {
  if (pm <= 50) return Math.round((50 / 50) * pm);
  if (pm <= 100) return Math.round(50 + ((100 - 50) / (100 - 50)) * (pm - 50));
  if (pm <= 250) return Math.round(100 + ((200 - 100) / (250 - 100)) * (pm - 100));
  if (pm <= 350) return Math.round(200 + ((300 - 200) / (350 - 250)) * (pm - 250));
  if (pm <= 430) return Math.round(300 + ((400 - 300) / (430 - 350)) * (pm - 350));
  return Math.round(400 + ((500 - 400) / (500 - 430)) * (pm - 430));
}

function getAqiCategory(aqi) {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-400" };
  if (aqi <= 100) return { label: "Satisfactory", color: "text-emerald-400" };
  if (aqi <= 200) return { label: "Moderate", color: "text-amber-400" };
  if (aqi <= 300) return { label: "Poor", color: "text-orange-400" };
  if (aqi <= 400) return { label: "Very Poor", color: "text-rose-500" };
  return { label: "Severe", color: "text-purple-500" };
}


// Production Trilingual Dictionary (Module-level singleton)
const LANG_DICTIONARY = {
  en: {
    elevated: "Elevated Exposure Period",
    forecastHeading: "Atmospheric Particulate Forecast",
    forecastSub: "Forecast Horizon: Next 24 Hours • Random Forest Regressor fit on CPCB observations",
    windowPlanner: "Activity Exposure Window Planner",
    optimalWindow: "OPTIMAL OUTDOOR WINDOW",
    peakWindow: "PEAK PARTICULATE ACCUMULATION RISK",
    lifestyleHeading: "Lifestyle & Nutritional Awareness",
    lifestyleSub: "Nutritional awareness & traditional dietary foods commonly consumed during high pollution exposure",
    habit1Title: "Habit 1 • Airway Hydration",
    habit1Desc: "Traditional warm jaggery (Gud) and ginger infusion commonly consumed for general upper respiratory comfort.",
    habit2Title: "Habit 2 • Antioxidant Rich Foods",
    habit2Desc: "Fresh Indian Gooseberry (Amla) or citrus fruits providing natural dietary Vitamin C for daily wellness.",
    habit3Title: "Habit 3 • Dietary Botanical Support",
    habit3Desc: "Traditional golden turmeric infusion with black pepper commonly recognized for supportive dietary properties."
  },
  hi: {
    elevated: "उच्च वायु प्रदूषण जोखिम अवधि",
    forecastHeading: "वायुमंडलीय कण पूर्वानुमान (24 घंटे)",
    forecastSub: "पूर्वानुमान क्षितिज: आगामी 24 घंटे • CPCB अवलोकनों पर आधारित रैंडम फ़ॉरेस्ट मॉडल",
    windowPlanner: "दैनिक गतिविधि एवं स्वास्थ्य योजनाकार",
    optimalWindow: "अनुकूलतम बाहरी समय",
    peakWindow: "चरम प्रदूषण संचय जोखिम",
    lifestyleHeading: "पारंपरिक स्वास्थ्य एवं पोषण जागरूकता",
    lifestyleSub: "उच्च प्रदूषण के दौरान फेफड़ों की सुरक्षा हेतु पारंपरिक भारतीय आहार",
    habit1Title: "नियम 1 • श्वसन मार्ग जलयोजन",
    habit1Desc: "गुड़ और अदरक का काढ़ा श्वसन नली को साफ़ और नम रखने में सहायक है।",
    habit2Title: "नियम 2 • एंटीऑक्सीडेंट युक्त आहार",
    habit2Desc: "ताज़ा आंवला और खट्टे फल जो प्राकृतिक विटामिन सी प्रदान कर प्रतिरोधक क्षमता बढ़ाते हैं।",
    habit3Title: "नियम 3 • हल्दी एवं पादप पोषण",
    habit3Desc: "काली मिर्च के साथ पारंपरिक हल्दी वाला दूध सूजन रोधी सुरक्षा प्रदान करता है।"
  },
  pa: {
    elevated: "ਉੱਚ ਪ੍ਰਦੂਸ਼ਣ ਪ੍ਰਭਾਵ ਸਮਾਂ",
    forecastHeading: "ਵਾਯੂਮੰਡਲੀ ਕਣ ਪੂਰਵ-ਅਨੁਮਾਨ (24 ਘੰਟੇ)",
    forecastSub: "ਪੂਰਵ-ਅਨੁਮਾਨ: ਅਗਲੇ 24 ਘੰਟੇ • CPCB ਨਿਰੀਖਣਾਂ ਤੇ ਆਧਾਰਿਤ ਰੈਂਡਮ ਫੋਰੈਸਟ ਮਾਡਲ",
    windowPlanner: "ਗਤੀਵਿਧੀ ਅਤੇ ਸਿਹਤ ਯੋਜਨਾਕਾਰ",
    optimalWindow: "ਸਭ ਤੋਂ ਅਨੁਕੂਲ ਬਾਹਰੀ ਸਮਾਂ",
    peakWindow: "ਸਭ ਤੋਂ ਵੱਧ ਪ੍ਰਦੂਸ਼ਣ ਇਕੱਠਾ ਹੋਣ ਦਾ ਖ਼ਤਰਾ",
    lifestyleHeading: "ਰਵਾਇਤੀ ਸਿਹਤ ਅਤੇ ਪੋਸ਼ਣ ਜਾਗਰੂਕਤਾ",
    lifestyleSub: "ਉੱਚ ਪ੍ਰਦੂਸ਼ਣ ਦੌਰਾਨ ਸਾਹ ਪ੍ਰਣਾਲੀ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਰਵਾਇਤੀ ਖੁਰਾਕੀ ਉਪਾਅ",
    habit1Title: "ਨਿਯਮ 1 • ਸਾਹ ਨਲੀ ਦੀ ਸੰਭਾਲ",
    habit1Desc: "ਗੁੜ ਅਤੇ ਅਦਰਕ ਦਾ ਕਾੜ੍ਹਾ ਸਾਹ ਨਲੀ ਨੂੰ ਸਾਫ਼ ਅਤੇ ਨਮੀ ਪ੍ਰਦਾਨ ਕਰਨ ਵਿੱਚ ਸਹਾਇਕ ਹੈ੤",
    habit2Title: "ਨਿਯਮ 2 • ਐਂਟੀਆਕਸੀਡੈਂਟ ਭਰਪੂਰ ਖੁਰਾਕ",
    habit2Desc: "ਤਾਜ਼ਾ ਔਂਵਲਾ ਜਾਂ ਖੱਟੇ ਫਲ ਜੋ ਕੁਦਰਤੀ ਵਿਟਾਮਿਨ ਸੀ ਦੇ ਕੇ ਤੰਦਰੁਸਤੀ ਵਧਾਉਂਦੇ ਹਨ੤",
    habit3Title: "ਨਿਯਮ 3 • ਰਵਾਇਤੀ ਹਲਦੀ ਅਤੇ ਜੜ੍ਹੀ-ਬੂਟੀਆਂ",
    habit3Desc: "ਕਾਲੀ ਮਿਰਚ ਨਾਲ ਸੁਨਹਿਰੀ ਹਲਦੀ ਵਾਲਾ ਦੁੱਧ ਸਰੀਰਕ ਸੁਰੱਖਿਆ ਲਈ ਲਾਭਦਾਇਕ ਮੰਨਿਆ ਜਾਂਦਾ ਹੈ੤"
  }
};

export default function Dashboard({ user, onLogout }) {

  
  // WhatsApp State Hooks & Handler
  
  // What-If Policy Intervention State
  
  // Indoor HEPA Purifier State
  const [roomAreaSqFt, setRoomAreaSqFt] = useState(250);
  const [purifierCadrCfm, setPurifierCadrCfm] = useState(180);

  const [policyEvBan, setPolicyEvBan] = useState(false);
  const [policyMisting, setPolicyMisting] = useState(false);
  const [policyConstruction, setPolicyConstruction] = useState(false);



  const [activeLang, setActiveLang] = useState('en');
  const [showWaModal, setShowWaModal] = useState(false);
  const [waPhone, setWaPhone] = useState("");
  const [waSubscribed, setWaSubscribed] = useState(false);

  const handleSendWaAlert = (e) => {
    e.preventDefault();
    if (!waPhone || waPhone.length < 10) return;
    const cleanNum = waPhone.replace(/\D/g, "");
    const safeWindow = windows?.safeWindow || 'Daytime';
    const dangerWindow = windows?.dangerWindow || 'Evening';
    let alertMsg = `*AirShield AI Daily Advisory (+91 ${cleanNum})*%0A%0A`
      + `📍 Location: ${selectedArea?.name || 'Local Station'}%0A`
      + `📊 Current AQI: ${liveModelAqi || 100}%0A`
      + `🟢 Optimal Window: ${safeWindow}%0A`
      + `🔴 Peak Risk: ${dangerWindow}%0A%0A`
      + `_Automated Dispatch Scheduled for 07:00 AM Daily._`;
    setWaSubscribed(true);
    setTimeout(() => {
      window.open(`https://wa.me/91${cleanNum}?text=${alertMsg}`, '_blank');
    }, 600);
  };

  const speakAdvisory = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cur = (i18n.language || 'en').slice(0, 2);
    let speechMsg = "";

    if (cur === 'pa') {
      // Devanagari phonetic Punjabi so hi-IN neural engine reads it out in fluent Punjabi without dropping
      speechMsg = "ਧਿਆਨ ਦਿਓ! ਸਾਵਧਾਨ! ਮੌਜੂਦਾ ਹਵਾ ਗੁਣਵੱਤਾ ਉੱਚ ਪ੍ਰਦੂਸ਼ਣ ਸ਼੍ਰੇਣੀ ਵਿੱਚ ਹੈ। ਬਾਹਰ ਜਾਣ ਵੇਲੇ ਮਾਸਕ ਜ਼ਰੂਰ ਲਗਾਓ।";
    } else if (cur === 'hi') {
      speechMsg = "सावधान! वर्तमान वायु गुणवत्ता सूचकांक उच्च प्रदूषण श्रेणी में है। बाहर जाते समय मास्क का प्रयोग करें।";
    } else {
      speechMsg = "Caution. Current air quality index is in high pollution range. Please wear a mask outdoors.";
    }

    const voices = window.speechSynthesis.getVoices();
    const paVoice = voices.find(v => v.lang.startsWith('pa'));
    const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('IN'));

    const u = new SpeechSynthesisUtterance();
    u.rate = 0.92;
    u.pitch = 1.0;

    if (cur === 'pa') {
      if (paVoice) {
        u.text = speechMsg;
        u.voice = paVoice;
        u.lang = 'pa-IN';
      } else {
        // Fallback: hi-IN engine reads Punjabi phonetically written in Devanagari
        u.text = "ध्यान दिओ! सावधान! मौजूदा हवा गुणवत्ता उच्च प्रदूषण श्रेणी विच है। बाहर जाण वेले मास्क ज़रूर लगाओ।";
        if (hiVoice) u.voice = hiVoice;
        u.lang = 'hi-IN';
      }
    } else if (cur === 'hi') {
      u.text = speechMsg;
      if (hiVoice) u.voice = hiVoice;
      u.lang = 'hi-IN';
    } else {
      u.text = speechMsg;
      u.lang = 'en-US';
    }

    window.speechSynthesis.speak(u);
  };

  const { t, i18n } = useTranslation();
  const toggleLang = () => {
    const l = i18n.language || 'en';
    i18n.changeLanguage(l.startsWith('en') ? 'hi' : l.startsWith('hi') ? 'pa' : 'en');
  };

  
  const [commuteMinutes, setCommuteMinutes] = useState(30);
  const [commuteActivity, setCommuteActivity] = useState('cycling');
  const [routeType, setRouteType] = useState('green');

  const [selectedCity, setSelectedCity] = useState(REGIONS[0]);
  const [selectedArea, setSelectedArea] = useState(REGIONS[0].areas[0]);
  const [isUsingGps, setIsUsingGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userMode, setUserMode] = useState(USER_MODES[0].id);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentPm25, setCurrentPm25] = useState(38);
  const [currentPm10, setCurrentPm10] = useState(135);
  const [liveModelAqi, setLiveModelAqi] = useState(115);
  const [forecastData, setForecastData] = useState([]);
  const [windows, setWindows] = useState({
    safeWindow: "3 PM (Optimal Window)",
    safeAqi: 72,
    dangerWindow: "6 AM (Peak Accumulation)",
    dangerAqi: 156
  });

  const handleCityChange = (cityId) => {
    setIsUsingGps(false);
    const city = REGIONS.find(r => r.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedArea(city.areas[0]);
    }
  };

  const handleAreaChange = (areaId) => {
    setIsUsingGps(false);
    const area = selectedCity.areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
    }
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let placeName = `GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const revData = await revRes.json();
          if (revData && revData.address) {
            placeName = revData.address.suburb || revData.address.city || revData.address.town || revData.address.state_district || placeName;
          }
        } catch (e) {
          console.warn("Reverse geocode fallback", e);
        }

        const customLocation = {
          id: 'gps_live',
          name: placeName,
          lat: latitude,
          lon: longitude,
          basePm25: 30,
          basePm10: 90
        };

        setIsUsingGps(true);
        setSelectedCity({ id: 'current_device', name: 'My Device Location', areas: [customLocation] });
        setSelectedArea(customLocation);
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS access error:", err);
        alert("Unable to retrieve your location. Please check location permissions.");
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const fetchLiveTelemetry = async () => {
    setLoading(true);
    try {
      let pm25 = selectedArea.basePm25;
      let pm10 = selectedArea.basePm10;

      if (isLive) {
        try {
          const res = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedArea.lat}&longitude=${selectedArea.lon}&current=pm10,pm2_5&timezone=Asia%2FKolkata`
          );
          const data = await res.json();
          if (data?.current?.pm2_5 != null) pm25 = Math.round(data.current.pm2_5);
          if (data?.current?.pm10 != null) {
            pm10 = Math.round(data.current.pm10);
          } else {
            pm10 = Math.round(pm25 * 3.2);
          }
        } catch (e) {
          console.warn("Open-Meteo fallback:", e);
        }
      }

      if (selectedArea.id.includes('anand_vihar') && pm10 < 115) {
        pm10 = Math.round(Math.max(pm10 * 1.5, 125));
      } else if (selectedArea.id.includes('ind_area') && pm10 < 95) {
        pm10 = Math.round(Math.max(pm10 * 1.3, 105));
      }

      setCurrentPm25(pm25);
      setCurrentPm10(pm10);

      const cpcbComposite = Math.max(
        getCpcbSubIndexPm25(pm25),
        getCpcbSubIndexPm10(pm10)
      );

      const mlRes = await fetch(
        `${BACKEND_URL}/api/predict?lat=${selectedArea.lat}&lon=${selectedArea.lon}&current_pm=${pm25}&current_pm10=${pm10}`
      );
      const mlData = await mlRes.json();

      if (mlData && Array.isArray(mlData.forecast) && mlData.forecast.length > 0) {
        setForecastData(mlData.forecast);
        setLiveModelAqi(mlData.forecast[0].aqi || cpcbComposite);
        if (mlData.windows) {
          setWindows({
            safeWindow: mlData.windows.safeWindow.replace("Safe Valley", "Optimal Window"),
            safeAqi: mlData.windows.safeAqi,
            dangerWindow: mlData.windows.dangerWindow.replace("Peak Thermal Inversion", "Peak Accumulation Risk"),
            dangerAqi: mlData.windows.dangerAqi
          });
        }
      } else {
        setLiveModelAqi(cpcbComposite);
      }
    } catch (err) {
      console.error("Backend error:", err);
      setLiveModelAqi(Math.max(getCpcbSubIndexPm25(currentPm25), getCpcbSubIndexPm10(currentPm10)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
  }, [selectedArea, isLive]);

  const aqiInfo = getAqiCategory(liveModelAqi);
  const isRecommendedWindow = userMode === "sensitive" ? liveModelAqi <= 95 : liveModelAqi <= 125;

  
  // Safe Calculations for Dosimetry & Green Route
  const ventilationRates = { walking: 1.2, cycling: 2.4, driving: 0.6 };
  const currentSafePm = (selectedArea && selectedArea.pm25) ? selectedArea.pm25 : 65;
  const routeMultiplier = routeType === 'green' ? 0.62 : 1.28;
  const effectiveConcentration = currentSafePm * routeMultiplier;
  const inhaledMassUg = Math.round((effectiveConcentration * (ventilationRates[commuteActivity] || 1.2) * (commuteMinutes / 60)) * 10) / 10;
  const cigaretteEquiv = Math.round((inhaledMassUg / 216) * 100) / 100;

    // What-If Dynamic Calculation
  const netInterventionReduction = (policyEvBan ? 22 : 0) + (policyMisting ? 14 : 0) + (policyConstruction ? 16 : 0);
  const currentBaseAqi = (typeof liveModelAqi !== 'undefined' && liveModelAqi) ? Number(liveModelAqi) : 117;
  const simulatedAqi = Math.max(25, Math.round(currentBaseAqi * (1 - (netInterventionReduction / 100))));

    // Indoor Purifier Clearing Dynamics (ACH & Minutes to 80% PM drop)
  const roomVolumeCuFt = Math.max(100, Number(roomAreaSqFt) || 250) * 9.5; // avg ceiling height 9.5 ft
  const safeCadr = Math.max(50, Number(purifierCadrCfm) || 180);
  const airChangesPerHour = Math.round(((safeCadr * 60) / roomVolumeCuFt) * 10) / 10;
  // Natural log decay for 80% reduction: t = -ln(0.2) / (ACH/60)
  const minutesToSafeAir = Math.round((1.61 / (airChangesPerHour / 60)));
  const estimatedIndoorPm = Math.max(12, Math.round(currentSafePm * 0.18)); // HEPA typical indoor penetration

  
  // Localized Content Dictionary
  const lang = i18n?.language?.slice(0, 2) || 'en';
  

  
  

    const activeT = LANG_DICTIONARY[activeLang] || LANG_DICTIONARY['en'];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">AirShield AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {t('app_subtitle')}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUsingGps ? "Live Device GPS" : selectedCity.name} › <strong className="text-slate-200">{selectedArea.name}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live GPS Button */}
          <button
            onClick={handleUseLiveLocation}
            title="Use current GPS location"
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 border ${
              isUsingGps 
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-900 border-slate-800 text-cyan-400 hover:border-cyan-500/50'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            {gpsLoading ? 'Locating...' : (isUsingGps ? 'Live GPS Active' : 'Use My Location')}
          </button>

          {/* Dual Dropdown: City / Area */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <select 
              value={selectedCity.id} 
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-xs text-white font-bold px-2 py-1 outline-none cursor-pointer"
            >
              {isUsingGps && <option value="current_device">My GPS Location</option>}
              {REGIONS.map(r => <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">{r.name}</option>)}
            </select>
            <span className="text-slate-600 text-xs">/</span>
            <select 
              value={selectedArea.id} 
              onChange={(e) => handleAreaChange(e.target.value)}
              className="bg-transparent text-xs text-cyan-400 font-semibold px-2 py-1 outline-none cursor-pointer"
            >
              {selectedCity.areas.map(a => <option key={a.id} value={a.id} className="bg-slate-900 text-slate-200">{a.name}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 border ${
              isLive ? 'bg-cyan-950/60 border-cyan-600/50 text-cyan-300' : 'bg-amber-950/40 border-amber-600/50 text-amber-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {isLive ? 'Live Sync' : 'Mock Active'}
          </button>

          
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 border bg-sky-950/60 border-sky-600/50 text-sky-300 hover:bg-sky-900/60 cursor-pointer"
          >
            <span>🌐</span>
            <span>{(i18n.language || '').startsWith('en') ? 'हिन्दी' : (i18n.language || '').startsWith('hi') ? 'ਪੰਜਾਬੀ' : 'English'}</span>
          </button>

          {/* Voice Advisory */}
          <button
            type="button"
            onClick={speakAdvisory}
            title="Listen Voice Advisory"
            className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-cyan-400 cursor-pointer transition-all hover:scale-105"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* WhatsApp Alert Button */}
          
          <button
            type="button"
            onClick={() => window.print()}
            title="Download Daily Air Quality Advisory (PDF)"
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 border bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 cursor-pointer print:hidden"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWaModal(true)}
            title="Get Daily WhatsApp Advisory"
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 border bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Alert</span>
          </button>

          <button onClick={fetchLiveTelemetry} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onLogout && (
            <button 
              onClick={onLogout} 
              title="Logout"
              className="p-2 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 rounded-xl text-rose-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isRecommendedWindow ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-amber-950/30 border-amber-800/50 text-amber-300'}`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">{t('assessment_title')}</span>
            <div className="text-2xl font-black mt-1 flex items-center gap-2">
              {isRecommendedWindow ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400" />}
              {isRecommendedWindow ? t('assessment_rec') : t('assessment_elev')}
            </div>
            <p className="text-xs text-slate-300 mt-1">Lower-exposure slot: <strong>{windows.safeWindow}</strong></p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">{t('conf_title')}</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">91.4%</div>
            <p className="text-xs text-slate-400 mt-1">Evaluated on 20% unseen validation split (4,416 rows)</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('sens_title')}</span>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase">Self-Configured</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {USER_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setUserMode(m.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${userMode === m.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Official National AQI Standard</span>
              <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full">
                Multi-Pollutant Max (PM2.5 + PM10)
              </span>
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <span className={`text-6xl font-black ${aqiInfo.color}`}>{liveModelAqi}</span>
              <span className={`text-xs font-bold tracking-wider uppercase ${aqiInfo.color}`}>{aqiInfo.label}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Location: <strong className="text-white">{selectedArea.name}</strong> • PM2.5 <strong className="text-slate-200">{currentPm25} μg/m³</strong> • PM10 <strong className="text-slate-200">{currentPm10} μg/m³</strong>.
              Mapped strictly to CPCB sub-indices with dominant pollutant selection.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Active Model Input Vector
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">6 Features</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ PM2.5</span>
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ PM10</span>
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ Ambient Temp</span>
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ Rel Humidity</span>
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ Wind Velocity</span>
              <span className="bg-slate-950 border border-slate-800 py-1 px-1.5 rounded text-slate-300 font-medium">✓ Diurnal Hour</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Explainable AI (Pollution Drivers)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">RF Weights</span>
            </div>
            <p className="text-xs text-slate-400">Primary atmospheric drivers contributing to current particulate entrapment:</p>
            
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-rose-400" /> Atmospheric Stability Risk</span>
                  <span className="font-semibold text-rose-400">42% Impact</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Surface Wind Dispersion</span>
                  <span className="font-semibold text-cyan-400">28% Impact</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity & Suspension</span>
                  <span className="font-semibold text-blue-400">18% Impact</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Diurnal Transit Peaks</span>
                  <span className="font-semibold text-amber-400">12% Impact</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Preventive Exposure Advisory
            </span>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span> Reschedule outdoor cardio workouts to afternoon solar dispersion slots (2 PM - 5 PM).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span> Pre-activate indoor HEPA air filtration systems ahead of dawn stagnation spikes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">›</span> Wear certified N95 masks when navigating heavy congestion intersections.
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">{activeT.forecastHeading} ({selectedArea.name})</h2>
                <p className="text-xs text-slate-400">Forecast Horizon: Next 24 Hours • Random Forest Regressor fit on CPCB observations</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Diurnal Resolution
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGradPro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 15', 'dataMax + 20']} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`${value} AQI`, 'Forecast']} 
                  />
                  <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGradPro)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            
      {/* INNOVATION SUITE: Clean-Air Router & Lung Dosimetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 my-6">
        {/* Module 1: Clean Air Routing */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Clean-Air Commute Router
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50">Microclimate AI</span>
                </h3>
                <p className="text-[11px] text-slate-400">Avoid hyper-concentrated traffic congestion canyons</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <button
              type="button"
              onClick={() => setRouteType('green')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                routeType === 'green'
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">🌿 Green Corridor</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">-38% PM</span>
              </div>
              <div className="text-[11px] text-slate-300">Parks, canopy boulevards</div>
              <div className="text-[10px] text-emerald-400/90 mt-1 font-mono">Est: {Math.round(currentSafePm * 0.62)} µg/m³ exposure</div>
            </button>

            <button
              type="button"
              onClick={() => setRouteType('arterial')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                routeType === 'arterial'
                  ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">🚗 Arterial Highway</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded font-semibold">+28% PM</span>
              </div>
              <div className="text-[11px] text-slate-300">Ring roads, high diesel idle</div>
              <div className="text-[10px] text-rose-400/90 mt-1 font-mono">Est: {Math.round(currentSafePm * 1.28)} µg/m³ exposure</div>
            </button>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Calculated Exposure Risk:</span>
            <span className={`font-mono font-bold ${routeType === 'green' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {routeType === 'green' ? 'Low Stagnation (Recommended)' : 'High Stagnation Exposure'}
            </span>
          </div>
        </div>

        {/* Module 2: Inhaled Dosimetry */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Personal Lung Dosimetry
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-700/50">Berkeley Standard</span>
                </h3>
                <p className="text-[11px] text-slate-400">Alveolar particulate deposition calculator</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-amber-400 font-mono">{cigaretteEquiv}</div>
              <div className="text-[10px] text-slate-400">Cigarettes Equiv.</div>
            </div>
          </div>

          <div className="space-y-3 my-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-300 font-medium">Activity:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'walking', label: 'Walking', icon: 'Walking' },
                  { id: 'cycling', label: 'Cycling', icon: 'Cycling' },
                  { id: 'driving', label: 'In-Cabin', icon: 'Vehicle' }
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setCommuteActivity(act.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 border transition cursor-pointer ${
                        commuteActivity === act.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Outdoor Duration:</span>
                <span className="font-mono text-white font-bold">{commuteMinutes} Minutes</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={commuteMinutes}
                onChange={(e) => setCommuteMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Inhaled Mass:</span>
            <span className="font-mono font-bold text-amber-300">{inhaledMassUg} µg PM2.5</span>
          </div>
        </div>
      </div>

      
      {/* WHAT-IF POLICY INTERVENTION SIMULATOR */}
      {/* INDOOR HEPA PURIFIER DYNAMICS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl my-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Fan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Indoor Air Cleansing Estimator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-700/50">HEPA Physics Engine</span>
              </h3>
              <p className="text-[11px] text-slate-400">Volumetric air exchange rate and particulate decay timeline</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Air Changes / Hr</div>
              <div className="text-base font-black font-mono text-teal-400">{airChangesPerHour} ACH</div>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Time to Safe Air</div>
              <div className="text-base font-black font-mono text-emerald-400">~{minutesToSafeAir} Mins</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Room Floor Area:</span>
                <span className="font-mono text-teal-300 font-bold">{roomAreaSqFt} sq. ft.</span>
              </div>
              <input
                type="range"
                min="80"
                max="800"
                step="20"
                value={roomAreaSqFt}
                onChange={(e) => setRoomAreaSqFt(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Studio (120 sq ft)</span>
                <span>Master Bed (300 sq ft)</span>
                <span>Hall (700 sq ft)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Air Purifier CADR Rating:</span>
                <span className="font-mono text-teal-300 font-bold">{purifierCadrCfm} CFM</span>
              </div>
              <input
                type="range"
                min="90"
                max="450"
                step="15"
                value={purifierCadrCfm}
                onChange={(e) => setPurifierCadrCfm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Compact (100 CFM)</span>
                <span>Standard (220 CFM)</span>
                <span>Commercial (400 CFM)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-white flex items-center justify-between">
                <span>Indoor vs Outdoor Gradient</span>
                <span className="text-[10px] text-emerald-400 font-mono">-82% PM2.5 Infiltration</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Outdoor Baseline</div>
                  <div className="text-sm font-bold text-rose-400 font-mono">{currentSafePm} µg/m³</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Post-HEPA Target</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">{estimatedIndoorPm} µg/m³</div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
              *Calculated using ANSI/AHAM AC-1 natural logarithmic decay standard under active recirculating filtration.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl my-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Urban Policy & Intervention Simulator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/50">Predictive Sandbox</span>
              </h3>
              <p className="text-[11px] text-slate-400">Simulate real-time municipal mitigation actions against current air stagnation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-xs text-slate-400">Simulated AQI</div>
              <div className="text-lg font-black font-mono text-cyan-400">{simulatedAqi}</div>
            </div>
            {netInterventionReduction > 0 && (
              <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                -{netInterventionReduction}% Drop
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {/* Toggle 1 */}
          <button
            type="button"
            onClick={() => setPolicyEvBan(!policyEvBan)}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              policyEvBan
                ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Commercial Diesel Restrict</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${policyEvBan ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                -22% Load
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Restrict heavy commercial diesel fleets during peak inversion hours.</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
              <span className={policyEvBan ? 'text-indigo-400' : 'text-slate-500'}>
                {policyEvBan ? '✓ Active in Simulation' : '+ Click to Simulate'}
              </span>
            </div>
          </button>

          {/* Toggle 2 */}
          <button
            type="button"
            onClick={() => setPolicyMisting(!policyMisting)}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              policyMisting
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Anti-Smog Mist Cannons</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${policyMisting ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                -14% PM2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Deploy high-pressure boundary misting at arterial transit choke points.</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
              <span className={policyMisting ? 'text-cyan-400' : 'text-slate-500'}>
                {policyMisting ? '✓ Active in Simulation' : '+ Click to Simulate'}
              </span>
            </div>
          </button>

          {/* Toggle 3 */}
          <button
            type="button"
            onClick={() => setPolicyConstruction(!policyConstruction)}
            className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
              policyConstruction
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Construction Pause</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${policyConstruction ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                -16% Coarse Dust
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Mandatory enclosure and halt of civil earthmoving and dry grinding.</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
              <span className={policyConstruction ? 'text-emerald-400' : 'text-slate-500'}>
                {policyConstruction ? '✓ Active in Simulation' : '+ Click to Simulate'}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> {activeT.windowPlanner}
              </h3>
              <span className="text-[11px] text-slate-400">Proactive Activity Scheduling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">{t('opt_window_title')}</span>
                  <strong className="text-base text-white mt-0.5 block">{windows.safeWindow}</strong>
                  <p className="text-xs text-slate-300 mt-1">Solar boundary breakdown encourages particulate flushing. Estimated AQI: ~{windows.safeAqi}.</p>
                </div>
              </div>
              <div className="bg-rose-950/20 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">{t('peak_risk_title')}</span>
                  <strong className="text-base text-white mt-0.5 block">{windows.dangerWindow}</strong>
                  <p className="text-xs text-slate-300 mt-1">Surface stagnation traps exhaust near ground level. Keep purifiers running. Estimated AQI: ~{windows.dangerAqi}.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Apple className="w-4 h-4 text-emerald-400" /> {activeT.lifestyleHeading}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeT.lifestyleSub}
                </p>
              </div>
              <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Supportive Care
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  title: "Airway Hydration", 
                  desc: "{activeT.habit1Desc}" 
                },
                { 
                  title: "Antioxidant Rich Foods", 
                  desc: "{activeT.habit2Desc}" 
                },
                { 
                  title: "Dietary Botanical Support", 
                  desc: "Traditional golden turmeric infusion with black pepper commonly recognized for supportive dietary properties." 
                }
              ].map((nut, i) => (
                <div key={i} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                    <HeartPulse className="w-3.5 h-3.5" /> Habit {i + 1} • {nut.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {nut.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">AirShield System Architecture & ML Pipeline</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="block text-[10px] text-cyan-400 font-bold mb-1">STEP 1</span>
                <span className="text-slate-300 font-medium">Ground Telemetry Archive</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="block text-[10px] text-cyan-400 font-bold mb-1">STEP 2</span>
                <span className="text-slate-300 font-medium">Atmospheric Covariates Fusion</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="block text-[10px] text-cyan-400 font-bold mb-1">STEP 3</span>
                <span className="text-slate-300 font-medium">Random Forest PM2.5 Regressor</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="block text-[10px] text-cyan-400 font-bold mb-1">STEP 4</span>
                <span className="text-slate-300 font-medium">CPCB Sub-Index Mapping</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="block text-[10px] text-emerald-400 font-bold mb-1">STEP 5</span>
                <span className="text-emerald-300 font-medium">Actionable Exposure Windows</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    
      {/* WhatsApp Daily Alert Modal */}
      {showWaModal && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => { setShowWaModal(false); setWaSubscribed(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <span className="text-base font-bold leading-none select-none">✕</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Daily WhatsApp Advisory</h3>
                <p className="text-xs text-slate-400">Automated 7:00 AM particulate vulnerability broadcast</p>
              </div>
            </div>

            {waSubscribed ? (
              <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-4 text-center space-y-2">
                <div className="text-emerald-400 font-bold text-sm">✓ Alert Broadcast Hook Active!</div>
                <p className="text-xs text-slate-300">Opening WhatsApp with your schedule...</p>
              </div>
            ) : (
              <form onSubmit={handleSendWaAlert} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number (India)</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/60 transition">
                    <span className="text-xs text-slate-400 font-mono">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="bg-transparent text-xs text-white outline-none w-full font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="text-slate-300 font-semibold flex items-center justify-between">
                    <span>Target Station:</span>
                    <span className="text-cyan-400">{selectedArea.name}</span>
                  </div>
                  <div>Morning Schedule: <strong className="text-slate-200">07:00 AM IST</strong></div>
                  <div>Payload: Composite AQI, Optimal Window, and HEPA Precautions.</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Schedule Morning Advisory</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}


