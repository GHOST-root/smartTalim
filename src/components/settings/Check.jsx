import React, { useState } from 'react';
import "./styles/check.css"; // CSS yo'lini o'zingizga qarab sozlang

export default function Check() {
  // Checkboxlar holatini saqlash (Hammasi dastlab ko'rinib turadi, ya'ni false)
  const [settings, setSettings] = useState({
    hideLogo: false,
    hideTextField: false,
    hideCheckNumber: false,
    hideCompany: false,
    hideBranch: false,
    hideStudent: false,
    hidePhone: false,
    hideBalance: false,
  });

  // Checkbox bosilganda qiymatini teskarisiga o'zgartirish
  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // API tayyor bo'lganda shu yerda jo'natiladi
    console.log("Saqlash uchun tayyor ma'lumotlar:", settings);
    alert("Chek sozlamalari saqlandi! (Hozircha tizimga ulanmagan)");
  };

  // Dinamik checkbox chizish uchun ro'yxat
  const checkboxes = [
    { id: 'hideLogo', label: 'Logotipni yashirish' },
    { id: 'hideTextField', label: 'Matn maydonini (Text field) yashirish' },
    { id: 'hideCheckNumber', label: 'Chek raqamini yashirish' },
    { id: 'hideCompany', label: 'Tashkilot nomini yashirish' },
    { id: 'hideBranch', label: 'Filial nomini yashirish' },
    { id: 'hideStudent', label: 'Talaba ismini yashirish' },
    { id: 'hidePhone', label: 'Telefon raqamni yashirish' },
    { id: 'hideBalance', label: 'Balansni yashirish' },
  ];

  return (
    <div className="check-settings-wrapper">
      <div className="check-settings-card">
        
        <div className="check-header">
          <h2>Chek Sozlamalari</h2>
          <p>Mijozlarga beriladigan to'lov cheki ko'rinishini sozlang.</p>
        </div>

        <form onSubmit={handleSave}>
          
          {/* Rasm (Logotip) yuklash qismi */}
          <div className="file-upload-group">
            <label>Chek uchun rasm (Image field)</label>
            <input 
              type="file" 
              className="custom-file-input" 
              accept="image/*"
            />
          </div>

          <div className="check-header" style={{ border: 'none', padding: 0 }}>
            <p style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: '600' }}>Quyidagi maydonlarni chekda ko'rsatmaslik:</p>
          </div>

          {/* Checkboxlar ro'yxati */}
          <div className="checkbox-list-container">
            {checkboxes.map((item) => (
              <label key={item.id} className="custom-orange-checkbox">
                <input
                  type="checkbox"
                  checked={settings[item.id]}
                  onChange={() => handleToggle(item.id)}
                />
                <span className="orange-checkbox-box"></span>
                <span className="orange-checkbox-label">{item.label}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="save-orange-btn">
            Sozlamalarni saqlash
          </button>

        </form>
      </div>
    </div>
  );
}