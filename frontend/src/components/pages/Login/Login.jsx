import React from 'react';
import LoginBranding from './Components/LoginBranding'; 
import LoginForm from './Components/LoginForm';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  return (
    <div className="login-page-container">
      <div className="login-card">
        <LoginBranding />
        {/* Pasăm funcția mai departe către formular */}
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;