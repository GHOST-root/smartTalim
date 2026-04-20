import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    contact: '', // Bu yerga tel raqam YOT email yoziladi
    password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Parollar mosligini tekshirish
    if (formData.password !== formData.confirm_password) {
      setError("Parollar bir-biriga mos kelmadi!");
      return;
    }

    setLoading(true);

    try {
      
      let payload = {
        full_name: formData.full_name,
        phone: formData.contact, // email/username shart emas, faqat phone
        password: formData.password
      };

      if (formData.contact.includes('@')) {
        payload.email = formData.contact;
        payload.username = formData.contact; 
      } else {
        payload.phone_number = formData.contact;
        payload.username = formData.contact; 
      }

      await axios.post('https://hacker99000.pythonanywhere.com/api/v1/accounts/register/', payload);

      alert("Arizangiz qabul qilindi! Admin tasdiqlaganidan so'ng tizimdan to'liq foydalanishingiz mumkin.");
      navigate('/login');
      
    } catch (err) {
      console.error("Registratsiya xatosi:", err);
      // Backenddan kelgan aniq xatoni ko'rsatishga harakat qilamiz
      if (err.response && err.response.data) {
         const errorMsg = Object.values(err.response.data).flat().join(' ');
         setError(errorMsg || "Ro'yxatdan o'tishda xatolik yuz berdi.");
      } else {
         setError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontWeight: 'bold', color: '#1e293b', margin: '0 0 10px 0' }}>Ro'yxatdan o'tish</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Tizimdan foydalanish uchun yangi akkaunt yarating
          </p>
        </div>

        {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Ism va Familiya</label>
            <input 
              type="text" 
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Masalan: Alisher Vohidov"
              style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Telefon raqam yoki Email</label>
            <input 
              type="text" 
              name="contact"
              required
              value={formData.contact}
              onChange={handleChange}
              placeholder="+998901234567 yoki email@mail.com"
              style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Parol</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 ta belgi"
              minLength="6"
              style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>Parolni tasdiqlang</label>
            <input 
              type="password" 
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Parolni qayta kiriting"
              minLength="6"
              style={{ width: '100%', height: '42px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', height: '44px', backgroundColor: '#3b82f6', color: 'white', 
              border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Yaratilmoqda...' : 'Akkaunt yaratish'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Allaqachon akkauntingiz bormi? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Tizimga kiring</Link>
          </div>

        </form>
      </div>
    </div>
  );
}