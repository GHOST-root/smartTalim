import React, { useState, useEffect } from 'react';
import { settingsApi } from "../../api/settingsApi";
import "./styles/imtihonlid.css";

// 🌟 LUG'AT: So'zlarni ortiqcha takrorsiz, qisqa va tushunarli qildik
const labelMap = {
  include_active_students: "Faol talabalarni hisobga oling",
  include_trial_students: "Sinov darsidagi talabalarni hisobga oling",
  include_archived_students: "Arxivlangan talabalarni hisobga oling",
  include_frozen_students: "Muzlatilgan talabalarni hisobga oling",
  include_deleted_students: "O'chirilgan talabalarni hisobga oling"
};

export default function Imtihonlid() {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Saqlash jarayoni uchun

  const ORG_ID = localStorage.getItem('org_id');

  // 1. API dan joriy sozlamalarni tortib kelish
  useEffect(() => {
    const fetchSettings = async () => {
      if (!ORG_ID) return;
      setIsLoading(true);
      try {
        const data = await settingsApi.examSettings.get(ORG_ID);
        const settingsData = data.results ? data.results[0] : data;
        setSettings(settingsData || {});
      } catch (error) {
        console.error("Imtihon sozlamalarini yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [ORG_ID]);

  // Checkbox bosilganda qiymatni o'zgartirish
  const handleChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 2. O'zgarishlarni API ga saqlash
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.examSettings.update(ORG_ID, settings);
      alert('Imtihon sozlamalari muvaffaqiyatli saqlandi!');
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      alert('Sozlamalarni saqlashda xatolik yuz berdi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-card-wrapper">
      <div className="settings-card">
        
        <div className="settings-header">
          <h2>Imtihonlar</h2>
          <p>Talabalarni imtihonlarga qo'shish qoidalari</p>
        </div>

        {isLoading ? (
          <div className="loading-text">Ma'lumotlar yuklanmoqda...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            <div className="checkbox-list">
              {/* API dan kelgan ma'lumotlarni dinamik chizish */}
              {Object.keys(settings).map((key) => {
                // Faqat True/False qatorlarni olamiz (ID larni emas)
                if (typeof settings[key] !== 'boolean') return null;

                const label = labelMap[key] || key; // Lug'atdan qidiramiz

                return (
                  <label key={key} className="custom-checkbox-item">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => handleChange(key)}
                    />
                    {/* CSS da yozilgan maxsus pichka oynasi */}
                    <span className="checkbox-box"></span>
                    <span className="checkbox-label">{label}</span>
                  </label>
                );
              })}

              {Object.keys(settings).length === 0 && (
                 <p className="error-text">Hozircha serverdan sozlamalar topilmadi.</p>
              )}
            </div>

            <button type="submit" className="save-settings-btn" disabled={isSaving}>
              {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            
          </form>
        )}

      </div>
    </div>
  );
}