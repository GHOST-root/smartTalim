import React, { useState } from 'react';

const Worklyhisob = () => {
  const [activeMenu, setActiveMenu] = useState('Integrations');
  const [formData, setFormData] = useState({
    clientId: '',
    secret: '',
    username: '',
    password: ''
  });

  const menuItems = [
    "General settings", "Sign in", "Lead form", "Payment methods", 
    "Communication", "Integrations", "Exams", "Check", 
    "Accrual and payment", "Landing page"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderContent = () => {
    if (activeMenu === 'Integrations') {
      return (
        <div style={{ flex: 1, paddingLeft: '50px' }}>
          <h4 style={{ fontSize: '15px', color: '#2d3748', marginBottom: '20px', fontWeight: '600' }}>Integrations</h4>
          <div style={{ maxWidth: '400px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#cbd5e0', marginBottom: '12px', textTransform: 'uppercase' }}>Workly</p>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Workly client id</label>
              <input type="text" name="clientId" value={formData.clientId} style={inputStyle} onChange={handleChange} />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Workly secret</label>
              <input type="password" name="secret" value={formData.secret} style={inputStyle} onChange={handleChange} />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Workly username</label>
              <input type="text" name="username" value={formData.username} style={inputStyle} onChange={handleChange} />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Workly password</label>
              <input type="password" name="password" value={formData.password} style={inputStyle} onChange={handleChange} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, paddingLeft: '50px', color: '#a0aec0' }}>
        <h4 style={{ color: '#2d3748', fontSize: '15px' }}>{activeMenu}</h4>
        <p style={{ fontSize: '12px' }}>Tez kunda bu bo'lim ishga tushadi...</p>
      </div>
    );
  };
 
  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '24px', fontFamily: '"Inter", sans-serif' }}>

      <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a202c', marginBottom: '20px' }}>Workly hisobotlari</h1>

      <div style={mainCardStyle}>
        <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#2d3748', marginBottom: '6px' }}>Workly bilan aloqa o'rnatish</h3>
        <p style={{ fontSize: '13px', color: '#718096', marginBottom: '25px' }}>
         Workly-ga ulanish uchun, quyidagi ma'lumotlarni Sozlamalar $ <br />
         Integratsiyalar bo'limiga kiritishingiz kerak :
        </p>


<div style={{ display: 'flex', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
          
          <div style={{ width: '200px', borderRight: '1px solid #f0f0f0' }}>
            {menuItems.map((item) => (
              <div 
                key={item} 
                onClick={() => setActiveMenu(item)}
                style={{ 
                  padding: '10px 0', 
                  fontSize: '13px', 
                  color: item === activeMenu ? "#3182ce" : "#a0aec0",
                  fontWeight: item === activeMenu ? "600" : "400",
                  cursor: 'pointer',
                  borderRight: item === activeMenu ? '2px solid #3182ce' : 'none',
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {renderContent()}

        </div>
      </div>
      
      <div style={{ textAlign: 'right', marginTop: '30px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>mod<span style={{color: '#f56565'}}>me</span></span>
      </div>
    </div>
  );
};

// --- YANGILANGAN IXCHAM STILLAR ---

const topBarStyle = {
  backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '20px', border: '1px solid #edf2f7'
};

const payButtonStyle = {
  backgroundColor: '#ed8936', color: 'white', border: 'none',
  padding: '6px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px'
};

const mainCardStyle = {
  backgroundColor: '#fff', borderRadius: '10px', padding: '30px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0'
};

const formGroupStyle = { 
  marginBottom: '8px' // Inputlar orasidagi masofa qisqardi
};

const labelStyle = { 
  display: 'block', 
  fontSize: '11px', // Kichikroq label
  color: '#a0aec0', 
  marginBottom: '2px' 
};

const inputStyle = {
  width: '100%',
  padding: '4px 10px', // Ichki bo'shliq minimal darajada
  border: '1px solid #e2e8f0',
  borderRadius: '4px',
  fontSize: '12px', // Kichikroq harflar
  color: '#4a5568',
  outline: 'none',
  backgroundColor: '#fff',
  height: '28px' // Balandlik 38px dan 28px ga tushdi (anchagina ozg'in)
};

export default Worklyhisob;