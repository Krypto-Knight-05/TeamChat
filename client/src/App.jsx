import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/authContext';
import useAuth from './context/authContext';
import Signup from './Pages/Signup';
import Signin from './Pages/Signin';
import Dashboard from './Pages/Dashboard';

const AppRoutes = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/signup"
        element={!isLoggedIn ? <Signup /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signin"
        element={!isLoggedIn ? <Signin /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/signin" replace />}
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/signup'} replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
