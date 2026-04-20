import React, { useState } from 'react';

const Jiringhisob = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('All');

  const callTypes = [
    "Chiquvchi", "Kiruvchi", "O'tkazib yuborilgan", 
    "Javob berilmagan (bog'lanildi)", "Javob berilmagan (bog'lanilmadi)", 
    "Javob berilmagan", "Local"
  ];

  return (
    <div style={containerStyle}>
      {/* 1. Litsenziya ogohlantirish paneli */}

      {/* 2. Sahifa sarlavhasi */}
      <h1 style={titleStyle}>Qo'ng'iroqlar jurnali</h1>

      {/* 3. Asosiy oq blok */}
      <div style={cardStyle}>
        
        {/* FILTRLAR QISMI */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', position: 'relative' }}>
          {/* Sana tanlash (Ozg'in input) */}
          <div style={{ position: 'relative', width: '220px' }}>
            <input 
              type="text" 
              placeholder="Sana tanlanmadi" 
              style={smallInputStyle} 
              readOnly
            />
            <span style={calendarIconStyle}>📅</span>
          </div>

          {/* Call Type Dropdown (Rasm 16.jpg dagi kabi) */}
          <div style={{ position: 'relative', width: '220px' }}>
            <div   
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ ...smallInputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>{selectedType}</span>
              <span style={{ fontSize: '10px', color: '#bfbfbf' }}>▼</span>
            </div>

            {showDropdown && (
              <div style={dropdownListStyle}>
                <div style={dropdownItemStyle} onClick={() => {setSelectedType('All'); setShowDropdown(false)}} >All</div>
                {callTypes.map(type => (
                  <div 
                    key={type} 
                    style={dropdownItemStyle}
                    onClick={() => {setSelectedType(type); setShowDropdown(false)}}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* JADVAL SARLAVHALARI (Rasm 15.jpg) */}
      <div className="bg-white py-4 pb-5">
          <div style={tableHeaderStyle} >
            <div style={{ flex: 1 }}>Turi</div>
            <div style={{ flex: 1 }}>Audio</div>
            <div style={{ flex: 1 }}>Vaqti</div>
            <div style={{ flex: 1 }}>Kim</div>
            <div style={{ flex: 1 }}>Kimga</div>
            <div style={{ flex: 1 }}>Shlyuz</div>
            <div style={{ flex: 1.5 }}>Qo'ng'iroq</div>
            <div style={{ flex: 1 }}>Davomiyligi</div>
            <div style={{ flex: 1 }}>Natija</div>
          </div><div className="text-center py-3">
          Ko'rsatiladigan ma'lumotlar yo'q
        </div>
      </div>

        {/* MA'LUMOT YO'QLIGI (Empty State) */}
         

      </div>
    </div>
  );
};

// --- STILLAR (Pixel-Perfect) ---

const containerStyle = {
  padding: '20px',
  backgroundColor: '#f5f6f8',
  minHeight: '100%'
};

const topBarStyle = {
  backgroundColor: '#fff', padding: '10px 20px', borderRadius: '4px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', border: '1px solid #f0f0f0'
};

const alertTextStyle = { fontSize: '13px', color: '#595959', display: 'flex', alignItems: 'center' };


const payButtonStyle = {
  backgroundColor: '#faad14', color: '#fff', border: 'none',
  padding: '5px 20px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px'
};

const titleStyle = { fontSize: '20px', fontWeight: '400', color: '#262626', marginBottom: '20px' };

const cardStyle = {
  backgroundColor: '', borderRadius: '4px', padding: '24px',
  border: '1px solid #f0f0f0', minHeight: '500px'
};

const smallInputStyle = {
  width: '100%', height: '28px', padding: '0 10px',
  border: '1px solid #d9d9d9', borderRadius: '4px',
  fontSize: '12px', color: '#595959', backgroundColor: '#fff',
  outline: 'none'
};

const calendarIconStyle = {
  position: 'absolute', right: '10px', top: '5px', fontSize: '14px', color: '#bfbfbf'
};

const dropdownListStyle = {
  position: 'absolute', top: '32px', left: 0, width: '100%',
  backgroundColor: '#fff', border: '1px solid #f0f0f0',
  borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10
};

const dropdownItemStyle = {
  padding: '8px 12px', fontSize: '12px', color: '#595959',
  cursor: 'pointer', borderBottom: '1px solid #f9f9f9'
};

const tableHeaderStyle = {
  display: 'flex', padding: '12px 0', borderBottom: '1px solid #f0f0f0',
  fontSize: '12px', fontWeight: '600', color: '#262626', textAlign: 'center'
};

const emptyDataStyle = {
  textAlign: 'center', padding: '100px 0', color: '#8c8c8c', fontSize: '14px'
};

export default Jiringhisob;