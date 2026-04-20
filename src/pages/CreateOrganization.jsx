import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera } from 'lucide-react'; 

export default function CreateOrganization() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '', // 🌟 Telefon raqam qo'shildi
    description: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone); // 🌟 API ga telefonni ham qo'shib jo'natamiz
      submitData.append('description', formData.description);
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const res = await axios.post('https://hacker99000.pythonanywhere.com/api/v1/organizations/organizations/', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      localStorage.setItem('org_id', res.data.id);
      
      alert("Tashkilotingiz muvaffaqiyatli yaratildi!");
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Tashkilot yaratishda xato:", err);
      if (err.response && err.response.data) {
        const errorMsg = Object.values(err.response.data).flat().join(' ');
        setError(errorMsg || "Tashkilot yaratishda xatolik yuz berdi.");
      } else {
        setError("Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Tashkilot yaratish</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Tizimdan foydalanishni boshlash uchun o'z kompaniyangizni ro'yxatdan o'tkazing
        </p>

        {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center', border: '1px solid #fecaca' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
            <label htmlFor="logoUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative'
              }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={32} color="#94a3b8" />
                )}
              </div>
              <span style={{ fontSize: '13px', color: '#3b82f6', marginTop: '12px', fontWeight: '500' }}>Rasm yuklash +</span>
            </label>
            <input id="logoUpload" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Tashkilot nomi <span style={{color:'red'}}>*</span></label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Masalan: Webbrain Academy"
              style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff';}}
              onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc';}}
            />
          </div>

          {/* 🌟 TELEFON RAQAM QISMI QO'SHILDI 🌟 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Tashkilot telefon raqami <span style={{color:'red'}}>*</span></label>
            <input 
              type="text" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Masalan: +998901234567"
              style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff';}}
              onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc';}}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Tashkilot haqida qisqacha ma'lumot</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Kompaniya faoliyati haqida yozing..."
              style={{ width: '100%', minHeight: '100px', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', resize: 'vertical', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
              onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff';}}
              onBlur={(e) => {e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc';}}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', height: '48px', backgroundColor: '#22c55e', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', 
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Yaratilmoqda...' : 'Tashkilotni saqlash'}
          </button>
        </form>

      </div>
    </div>
  );
}