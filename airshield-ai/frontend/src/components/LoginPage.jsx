import React, { useState } from 'react';
import { ShieldAlert, UserCheck } from 'lucide-react';

export default function LoginPage({ onComplete, onLogin }) {
  const [formData, setFormData] = useState({
    name: "Suyash Sharma",
    age: "21",
    location: "Delhi (Anand Vihar)",
    condition: "Asthma • Moderate"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitFn = onComplete || onLogin;
    if (typeof submitFn === 'function') {
      submitFn(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">AirShield AI</h1>
            <p className="text-xs text-slate-400">Clinical Respiratory Defense Portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Patient Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Primary Condition</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Asthma • Moderate">Asthma</option>
                <option value="COPD">COPD</option>
                <option value="Allergic Rhinitis">Allergic Rhinitis</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" /> Initialize Shield Telemetry
          </button>
        </form>
      </div>
    </div>
  );
}
