import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Stethoscope, Lock, Mail, ChevronLeft } from 'lucide-react';

export default function LoginPage({ onComplete }) {
  const [step, setStep] = useState('auth'); // 'auth' -> login first, then 'profile'
  const [credentials, setCredentials] = useState({ 
    email: 'suyash@airshield.ai', 
    password: '' 
  });
  
  const [profile, setProfile] = useState({
    name: 'Suyash Sharma',
    age: '21',
    location: 'Sector 17, Chandigarh',
    conditions: ['Asthma'],
    severity: 'Moderate'
  });

  const conditionOptions = ["Asthma", "COPD", "Allergic Rhinitis", "Bronchitis", "None / Healthy"];

  const handleConditionToggle = (cond) => {
    if (cond === "None / Healthy") {
      setProfile({ ...profile, conditions: ["None / Healthy"] });
      return;
    }
    const filtered = profile.conditions.filter(c => c !== "None / Healthy");
    if (filtered.includes(cond)) {
      setProfile({ ...profile, conditions: filtered.filter(c => c !== cond) });
    } else {
      setProfile({ ...profile, conditions: [...filtered, cond] });
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setStep('profile');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onComplete({ ...credentials, ...profile });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">AirShield <span className="text-sky-400">AI</span></h1>
            <p className="text-xs text-slate-400">Personal Bio-Defense & Vulnerability Mapping</p>
          </div>
        </div>

        {/* Step 1: Login Credentials */}
        {step === 'auth' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Patient & Clinician Portal</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sign in to access localized sensor telemetry and custom advisories.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.99] cursor-pointer"
            >
              Authenticate & Proceed
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Health Profile Matrix */
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-4 h-4" /> Configure Respiratory Health Matrix
              </div>
              <button
                type="button"
                onClick={() => setStep('auth')}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Patient Full Name</label>
                <input 
                  type="text" 
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Age</label>
                <input 
                  type="number" 
                  required
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Monitoring Location / Ward</label>
              <input 
                type="text" 
                required
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Known Respiratory Conditions</label>
              <div className="flex flex-wrap gap-2">
                {conditionOptions.map((cond) => {
                  const active = profile.conditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleConditionToggle(cond)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        active 
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Symptom Severity</label>
              <select
                value={profile.severity}
                onChange={(e) => setProfile({ ...profile, severity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Mild">Mild (Occasional Cough / Irritation)</option>
                <option value="Moderate">Moderate (Exercise-Induced Wheezing / Daily Inhaler)</option>
                <option value="Severe">Severe (Chronic Asthma / Low Peak Flow)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Activate Shield Advisory
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
