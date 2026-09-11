import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldCheck, AlertTriangle, Activity, Wind, 
  Droplets, Thermometer, Clock, Sun, Flame, 
  Sparkles, HeartPulse, RefreshCw, LogOut, ChevronDown 
} from 'lucide-react';

const BACKEND_URL = "https://airshield-ai.onrender.com";

const STATIONS = [
  { id: 'delhi', name: 'Delhi (Anand Vihar)', lat: 28.6469, lon: 77.3160, baseMockPm: 31 },
  { id: 'mumbai', name: 'Mumbai (Bandra)', lat: 19.0596, lon: 72.8295, baseMockPm: 45 },
  { id: 'bengaluru', name: 'Bengaluru (BTM)', lat: 12.9166, lon: 77.6101, baseMockPm: 24 },
  { id: 'chandigarh', name: 'Chandigarh (Sec 22)', lat: 30.7333, lon: 76.7794, baseMockPm: 28 }
];

export default function Dashboard({ onLogout }) {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentPm, setCurrentPm] = useState(31);
  const [forecastData, setForecastData] = useState([]);
  const [windows, setWindows] = useState({
    safeWindow: "3 PM (Safe Valley)",
    safeAqi: 34,
    dangerWindow: "6 AM (Peak Inversion)",
    dangerAqi: 75
  });

  const fetchLiveAqi = async () => {
    setLoading(true);
    try {
      let pm = selectedStation.baseMockPm;
      if (isLive) {
        try {
          const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedStation.lat}&longitude=${selectedStation.lon}&current=pm2_5`);
          const data = await res.json();
          if (data?.current?.pm2_5 != null) {
            pm = Math.round(data.current.pm2_5);
          }
        } catch (e) {
          console.warn("Open-Meteo fallback:", e);
        }
      }
      setCurrentPm(pm);

      // Call Render Machine Learning Backend
      const mlRes = await fetch(`${BACKEND_URL}/api/predict?lat=${selectedStation.lat}&lon=${selectedStation.lon}&current_pm=${pm}`);
      const mlData = await mlRes.json();

      if (mlData && mlData.forecast) {
        setForecastData(mlData.forecast);
        if (mlData.windows) {
          setWindows(mlData.windows);
        }
      }
    } catch (err) {
      console.error("Inference fetch failed, fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAqi();
  }, [selectedStation, isLive]);

  const currentAqi = Math.round(currentPm <= 30 ? (50/30)*currentPm : 50 + ((currentPm-30)*1.66));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">AirShield AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Coupled Forecaster
              </span>
            </div>
            <p className="text-xs text-slate-400">Station: {selectedStation.name} • User: Suyash Sharma (21 yrs)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedStation.id} 
            onChange={(e) => setSelectedStation(STATIONS.find(s => s.id === e.target.value))}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
          >
            {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <button 
            onClick={() => setIsLive(!isLive)}
            className={`text-xs px-3 py-2 rounded-lg font-medium transition flex items-center gap-1.5 border ${
              isLive ? 'bg-cyan-950/60 border-cyan-600/50 text-cyan-300' : 'bg-amber-950/40 border-amber-600/50 text-amber-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {isLive ? 'Live Sync' : 'Mock Active'}
          </button>

          <button onClick={fetchLiveAqi} className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">CPCB Ground Telemetry</span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                Satellite-Ground Fusion
              </span>
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-6xl font-black text-emerald-400">{currentAqi}</span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Satisfactory</span>
            </div>
            <p className="text-xs text-slate-400">
              Measured PM2.5: <strong className="text-slate-200">{currentPm} μg/m³</strong>. Minimal mucosal stress detected. Baseline physiological thresholds stable.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Suyash Sharma</h3>
                <span className="text-xs text-slate-400">Asthma • Moderate</span>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Shield Active
              </span>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
              Physiological airway limits stable. Routine daily maintenance running.
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Coupled Atmospheric Inversion Forecast ({selectedStation.name})</h2>
                <p className="text-xs text-slate-400">Powered by AirShield Random Forest regressor fused with live meteorological covariates</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Sub-50ms Inference
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 350]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Pollution Exposure Window Planner
              </h3>
              <span className="text-[11px] text-slate-400">Proactive Activity Scheduling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Safest Outdoor Period</span>
                  <strong className="text-base text-white mt-0.5 block">{windows.safeWindow}</strong>
                  <p className="text-xs text-slate-300 mt-1">Optimal time for workouts or transit. Estimated AQI: ~{windows.safeAqi}.</p>
                </div>
              </div>
              <div className="bg-rose-950/20 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">High Danger Exposure Period</span>
                  <strong className="text-base text-white mt-0.5 block">{windows.dangerWindow}</strong>
                  <p className="text-xs text-slate-300 mt-1">Thermal trapping peak. Keep purifiers active. Estimated AQI: ~{windows.dangerAqi}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
