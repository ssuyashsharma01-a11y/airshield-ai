import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {!user ? (
        <LoginPage onComplete={(userData) => setUser(userData || { name: "Suyash Sharma", age: 21, condition: "Asthma • Moderate" })} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}
