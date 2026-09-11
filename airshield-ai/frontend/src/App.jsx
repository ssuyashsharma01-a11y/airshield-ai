import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  // Default fallback user so page never crashes on hard refresh
  const [userProfile, setUserProfile] = useState({
    name: 'Suyash Sharma',
    age: '21',
    location: 'Sector 17, Chandigarh',
    conditions: ['Asthma'],
    severity: 'Moderate'
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <>
      {!isAuthenticated ? (
        <LoginPage 
          onComplete={(profile) => {
            setUserProfile(profile);
            setIsAuthenticated(true);
          }} 
        />
      ) : (
        <Dashboard 
          user={userProfile} 
          onLogout={() => setIsAuthenticated(false)} 
        />
      )}
    </>
  );
}
