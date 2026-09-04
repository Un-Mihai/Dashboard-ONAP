import React, { useState } from 'react';
import { loginUser } from '../../../../api'; 
import { useAuth } from '../../../../context/AuthContext'; 

const LoginForm = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // const response = await loginUser(credentials.username, credentials.password);
      // const token = response.data.access_token || response.data.token;
      // const role = response.data.role || 'admin';

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.username !== 'admin' || credentials.password !== '1234') {
         throw new Error('Parolă greșită');
      }
      
      const token = 'token-fals-jws-pentru-testare-frontend';
      const role = 'admin';

      if (role !== 'admin') {
        setError('Acces interzis. Doar administratorii pot accesa acest dashboard.');
        setIsLoading(false);
        return;
      }

      login(token, role);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Nume de utilizator sau parolă incorecte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '15px', fontSize: '13px', textAlign: 'center', backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '8px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
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
      
      <button type="submit" className="login-btn" disabled={isLoading}>
        {isLoading ? 'Se procesează...' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;