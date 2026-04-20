import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css'; // Sizning papkangizdagi yo'l

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://hacker99000.pythonanywhere.com/api/token/', {
        username: username,
        password: password
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      try {
        const orgRes = await axios.get('https://hacker99000.pythonanywhere.com/api/v1/organizations/organizations/', {
          headers: { Authorization: `Bearer ${access}` }
        });

        const organizations = orgRes.data.results || orgRes.data;

        if (organizations && organizations.length > 0) {
          localStorage.setItem('org_id', organizations[0].id);
          navigate('/dashboard'); 
        } else {
          navigate('/create-organization');
        }
      } catch (orgErr) {
        console.error("Tashkilotni tekshirishda xato:", orgErr);
        navigate('/create-organization');
      }
      
    } catch (err) {
      console.error("Login xatosi:", err);
      setError("Login yoki parol noto'g'ri! Iltimos, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        <div className="login-header" style={{textAlign: 'center'}}>
          <h2>Tizimga kirish</h2>
          <p>Xush kelibsiz! Davom etish uchun ma'lumotlaringizni kiriting.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          
          <div className="custom-input-group">
            <label className="custom-label">Foydalanuvchi nomi (Username)</label>
            <input 
              type="text" 
              className="custom-input" 
              placeholder="Masalan: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="custom-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="custom-label" style={{ margin: 0 }}>Parol</label>
              <Link to="/forgot-password" className="link-text">
                Parolni unutdingizmi?
              </Link>
            </div>
            
            <input 
              type="password" 
              className="custom-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Kirilmoqda..." : "Tizimga kirish"}
          </button>

          <div className="register-prompt">
            Akkauntingiz yo'qmi? <Link to="/register" className="link-text">Ro'yxatdan o'tish</Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;