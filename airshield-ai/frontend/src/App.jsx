import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData || { name: "Suyash Sharma", age: 21, condition: "Asthma • Moderate" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {!user ? (
        <LoginPage onComplete={handleLogin} onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
