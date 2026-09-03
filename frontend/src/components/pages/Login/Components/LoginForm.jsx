import React, { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Date introduse formular:', credentials);
    
    // Aici este magia: anunțăm App.jsx că logarea s-a terminat
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="username">Utilizator</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          value={credentials.username}
          onChange={handleChange}
          placeholder="ex: admin"
          required 
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="password">Parolă</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={credentials.password}
          onChange={handleChange}
          placeholder="Introdu parola"
          required 
        />
      </div>
      
      <button type="submit" className="login-btn">Log In</button>
    </form>
  );
};

export default LoginForm;