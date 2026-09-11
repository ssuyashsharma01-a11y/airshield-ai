export const getHealthAdvisory = (profile) => {
  const isAsthmatic = profile.conditions.includes("Asthma");
  const hasCopd = profile.conditions.includes("COPD");
  const isChild = Number(profile.age) < 14;
  const isSenior = Number(profile.age) >= 60;

  let riskLevel = "Moderate Watch";
  let riskColor = "text-amber-400 bg-amber-950/60 border-amber-800";
  let inhalerAlert = false;
  let actions = [];
  let nutrition = [];

  if (isAsthmatic || hasCopd || isSenior) {
    riskLevel = "Critical Bio-Alert";
    riskColor = "text-red-400 bg-red-950/70 border-red-700";
    inhalerAlert = true;
    actions = [
      "Keep rescue bronchodilator / inhaler primed and within reach.",
      "Seal all room ventilators; run indoor HEPA purifier on Turbo by 4 PM.",
      "Strict outdoor ban during morning and evening particulate inversions."
    ];
    nutrition = [
      "Ginger & Tulsi decoction with black pepper to relieve bronchial spasm.",
      "10g organic jaggery post-meal to aid upper airway particulate clearance.",
      "Soaked walnuts & almonds for high anti-inflammatory omega-3 defense."
    ];
  } else if (isChild) {
    riskLevel = "High Pediatric Watch";
    riskColor = "text-rose-400 bg-rose-950/60 border-rose-800";
    actions = [
      "Strict sports restrictions between 5:00 PM and 9:00 PM.",
      "Mandatory snug-fit pediatric N95 mask for school commute.",
      "Monitor for dry cough, wheezing, or nighttime throat clearing."
    ];
    nutrition = [
      "Warm turmeric milk with black pepper for systemic cellular immunity.",
      "1 spoon Amla honey puree for bioavailable Vitamin C airway shield.",
      "Hydration: Warm basil-infused water throughout the day."
    ];
  } else {
    actions = [
      "Limit high-intensity outdoor running during peak vehicle hours.",
      "Use certified particulate filtration mask during highway commute.",
      "Keep bedroom windows closed from 7 PM to 7 AM."
    ];
    nutrition = [
      "Green tea or moringa infusion for high antioxidant polyphenol count.",
      "Citrus fruits and sprouted legumes to neutralize oxidant stress.",
      "Electrolyte replenishment with natural lemon water post-workout."
    ];
  }

  return { riskLevel, riskColor, inhalerAlert, actions, nutrition };
};

export const forecastData = [
  { time: '10 AM', aqi: 180 },
  { time: '1 PM', aqi: 210 },
  { time: '4 PM', aqi: 290 },
  { time: '7 PM', aqi: 385 },
  { time: '10 PM', aqi: 340 },
  { time: '1 AM', aqi: 260 },
  { time: '4 AM', aqi: 220 },
  { time: '7 AM', aqi: 310 },
];
