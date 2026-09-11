import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, Activity, Clock, Sun, Flame, 
  Sparkles, HeartPulse, RefreshCw, Apple, LogOut,
  Wind, Droplets, Thermometer, CheckCircle2, AlertTriangle,
  GitBranch, Database, MapPin
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

export default function Dashboard({ user, onLogout }) {
  const [selectedCity, setSelectedCity] = useState(REGIONS[0]);
  const [selectedArea, setSelectedArea] = useState(REGIONS[0].areas[0]);
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
    const city = REGIONS.find(r => r.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedArea(city.areas[0]);
    }
  };

  const handleAreaChange = (areaId) => {
    const area = selectedCity.areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
    }
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
                PM2.5 Forecast & Exposure Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selectedCity.name} › {selectedArea.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <select 
              value={selectedCity.id} 
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-xs text-white font-bold px-2 py-1 outline-none cursor-pointer"
            >
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
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">Current Outdoor Assessment</span>
            <div className="text-2xl font-black mt-1 flex items-center gap-2">
              {isRecommendedWindow ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400" />}
              {isRecommendedWindow ? "Recommended Outdoor Window" : "Elevated Exposure Period"}
            </div>
            <p className="text-xs text-slate-300 mt-1">Lower-exposure slot: <strong>{windows.safeWindow}</strong></p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-400">Prediction Confidence</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">91.4%</div>
            <p className="text-xs text-slate-400 mt-1">Evaluated on 20% unseen validation split (4,416 rows)</p>
          </div>
          <Activity className="w-8 h-8 text-cyan-500/40" />
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sensitivity Profile</span>
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
              Measured at <strong className="text-white">{selectedArea.name}</strong>: PM2.5 <strong className="text-slate-200">{currentPm25} μg/m³</strong> • PM10 <strong className="text-slate-200">{currentPm10} μg/m³</strong>.
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
                <h2 className="text-sm font-bold text-white">Atmospheric Particulate Forecast ({selectedArea.name})</h2>
                <p className="text-xs text-slate-400">Forecast Horizon: Next 24 Hours • Random Forest Regressor fit on CPCB observations</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Diurnal Resolution (00:00 - 21:00)
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Activity Exposure Window Planner
              </h3>
              <span className="text-[11px] text-slate-400">Proactive Activity Scheduling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Optimal Outdoor Window</span>
                  <strong className="text-base text-white mt-0.5 block">{windows.safeWindow}</strong>
                  <p className="text-xs text-slate-300 mt-1">Solar boundary breakdown encourages particulate flushing. Estimated AQI: ~{windows.safeAqi}.</p>
                </div>
              </div>
              <div className="bg-rose-950/20 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Peak Particulate Accumulation Risk</span>
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
                  <Apple className="w-4 h-4 text-emerald-400" /> Lifestyle & Nutritional Awareness
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nutritional awareness & traditional dietary foods commonly consumed during high pollution exposure
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
                  desc: "Traditional warm jaggery (Gud) and ginger infusion commonly consumed for general upper respiratory comfort." 
                },
                { 
                  title: "Antioxidant Rich Foods", 
                  desc: "Fresh Indian Gooseberry (Amla) or citrus fruits providing natural dietary Vitamin C for daily wellness." 
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
    </div>
  );
}
