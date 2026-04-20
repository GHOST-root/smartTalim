import React, { useState, useEffect } from "react";
import { settingsApi } from "../../api/settingsApi";
import "./styles/tolovlar.css";

const ORG_ID = localStorage.getItem('org_id');

// 🌟 LUG'AT: Backend qanday nomda yuborishidan qat'i nazar o'zbekcha chiroyli matnlar
const labelMap = {
  // Matn/Raqamli sozlamalar
  uzum_settings: "Uzum sozlamalari",
  payment_mode: "Talabalar uchun to'lov rejimi",
  
  // Ish haqi bo'yicha sozlamalar (Booleans)
  ignore_trial_salary: "Ish haqi: sinov darsidagi talabalarni hisobga olmang",
  ignore_archived_salary: "Ish haqi: arxivlangan talabalarni hisobga olmang",
  include_discount_salary: "Ish haqi: talaba chegirmasini hisobga oling",
  salary_with_discount: "O'qituvchining maoshida o'quvchi chegirmasini hisobga oling",
  salary_for_archived: "Arxivlangan o'quvchilarga maosh hisoblang",
  link_salary_attendance: "O'qituvchining maoshini davomatga ulang",
  salary_only_teacher_marks: "Faqatgina guruh ustoz belgilagan davomatlarga maosh hisoblash",
  salary_only_attended: "Faqatgina o'quvchi kelgan darslarga maosh hisoblash",
  salary_trial_students: "Sinov darsi holatidagi o'quvchilar uchun maosh hisoblash",
  salary_frozen_students: "Muzlatilgan o'quvchilarni hisobga olish",

  // Boshqa sozlamalar (Booleans)
  allow_teacher_sms: "O'qituvchilarga talabalarga SMS yuborishga ruxsat bering",
  hide_student_data: "O'qituvchilarga talabalar ma'lumotlarini yashirish",
  attendance_during_lesson: "O'qituvchilar: davomotni faqat dars davomida belgilash",
  allow_group_overlap: "Jadval: guruhlarni bitta kabinet/o'qituvchi bilan kesib o'tishga ruxsat bering",
  show_group_balance: "Guruh balansini ko'rsatish"
};

// Kalit so'zni chiroyli formatlash (Lug'atda topilmasa ishlaydi)
const formatUnknownKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function STolovlar() {
  const [settings, setSettings] = useState({});
  const [settingId, setSettingId] = useState(null); // Backend yangilash uchun id kerak bo'ladi
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. API dan ma'lumotlarni tortib kelish
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await settingsApi.subscriptions.get(ORG_ID);
        // Backend array qaytarsa birinchisini, obyekt qaytarsa o'zini olamiz
        const resObj = data.results ? data.results[0] : (Array.isArray(data) ? data[0] : data);
        
        if (resObj) {
          setSettings(resObj);
          if (resObj.id || resObj.uuid) setSettingId(resObj.id || resObj.uuid);
        }
      } catch (error) {
        console.error("Sozlamalarni yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. Form o'zgarishlarini ushlash
  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 3. API ga Saqlash
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settingId) {
        await settingsApi.subscriptions.update(ORG_ID, settingId, settings);
      } else {
        await settingsApi.subscriptions.create(ORG_ID, settings);
      }
      alert("Sozlamalar muvaffaqiyatli saqlandi!");
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      alert("Saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Sozlamalarni toifalarga ajratish (UI da chiroyli chiqarish uchun)
  const booleanSettings = Object.keys(settings).filter(k => typeof settings[k] === 'boolean');
  const stringSettings = Object.keys(settings).filter(k => typeof settings[k] === 'string' && k !== 'id' && k !== 'uuid' && k !== 'created_at');

  return (
    <div className="container my-5 hisob-wrapper">
      <h4 className="mb-4">Hisob va to'lovlar</h4>

      <div className="card settings-card shadow-sm p-4 border-0">
        
        {isLoading ? (
          <div className="text-center py-5 text-muted">
             <div className="spinner-border text-warning mb-2" role="status"></div>
             <p>Sozlamalar yuklanmoqda...</p>
          </div>
        ) : Object.keys(settings).length === 0 ? (
          <div className="text-center py-4 text-muted">
             Serverdan sozlamalar topilmadi.
          </div>
        ) : (
          <>
            {/* 🌟 1-QISM: MATNLI / TANLOV SOZLAMALARI */}
            {stringSettings.length > 0 && (
              <div className="mb-4">
                <h6 className="settings-group-title"><i className="fa-solid fa-sliders me-2"></i> Asosiy Sozlamalar</h6>
                <div className="row">
                  {stringSettings.map(key => (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label text-muted fw-medium small">
                        {labelMap[key] || formatUnknownKey(key)}
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={settings[key] || ''} 
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🌟 2-QISM: YOQISH / O'CHIRISH SOZLAMALARI (SWITCHES) */}
            {booleanSettings.length > 0 && (
              <div>
                <h6 className="settings-group-title mt-2"><i className="fa-solid fa-toggle-on me-2"></i> Ruxsatlar va Qoidalar</h6>
                <div className="row mt-3">
                  {booleanSettings.map(key => (
                    <div className="col-lg-6" key={key}>
                      <div className="form-check form-switch mb-3 d-flex align-items-center">
                        <input
                          className="form-check-input flex-shrink-0"
                          type="checkbox"
                          role="switch"
                          id={key}
                          checked={settings[key]}
                          onChange={() => handleToggle(key)}
                        />
                        <label className="form-check-label" htmlFor={key}>
                          {labelMap[key] || formatUnknownKey(key)}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SAQLASH TUGMASI */}
            <div className="mt-4 pt-3 border-top text-end">
              <button
                className="btn save-btn px-5 text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span> Saqlanmoqda...</>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}