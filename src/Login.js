import React, { useState, useEffect } from 'react';
import './Login.css';
import axios from 'axios';

const Login = ({ onLogin, onToggleRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const text = 'Login to play';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => text.substring(0, (i % text.length) + 1));
      i++;
    }, 150); // Speed of typing
    return () => clearInterval(interval);
  }, [text]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      onLogin();
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>{displayText}<span className="cursor">|</span></h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {loading && <div className="progress-bar"><div></div></div>}
      </form>
      <p onClick={onToggleRegister} className="toggle-form">
        New user? Register
      </p>
    </div>
  );
};

export default Login;
