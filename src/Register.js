import React, { useState, useEffect } from 'react';
import './Register.css';
import axios from 'axios';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const text = 'Register to play';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => text.substring(0, (i % text.length) + 1));
      i++;
    }, 150); 
    return () => clearInterval(interval);
  }, [text]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('avatar', avatar);
      
      const response = await axios.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const loginResponse = await axios.post('/login', { username, password });
      localStorage.setItem('token', loginResponse.data.token);
      setSuccess(true);
      setTimeout(() => {
        onRegister({ avatar: loginResponse.data.avatar, username: loginResponse.data.username });
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {success ? (
        <h2>Successfully registered! Redirecting...</h2>
      ) : (
        <form onSubmit={handleRegister}>
          <h2>{displayText}<span className="cursor">|</span></h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
<div className="upload-container">
  <label htmlFor="avatar-upload" className="upload-label">Upload Avatar</label>
  <input
    id="avatar-upload"
    type="file"
    accept="image/*"
    onChange={(e) => setAvatar(e.target.files[0])}
    required
  />
</div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
          {loading && <div className="progress-bar"><div></div></div>}
        </form>
      )}
    </div>
  );
};

export default Register;
