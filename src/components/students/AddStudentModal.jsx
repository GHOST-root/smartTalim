import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi"; // API ulandi!

// Qo'shimcha maydonlar ro'yxati
const extraFieldsMeta = [
  { id: "phone_number2", type: "text", icon: "fa-solid fa-phone", label: "Qo'shimcha telefon", placeholder: "+998 90 123 45 68" },
  { id: "parent_phone", type: "text", icon: "fa-solid fa-phone-office", label: "Ota-ona tel", placeholder: "+998 90 123 45 00" },
  { id: "password", type: "text", icon: "fa-solid fa-key", label: "Parol", placeholder: "******" },
  { id: "parent_name", type: "text", icon: "fa-regular fa-user", label: "Ota-onasi F.I.Sh", placeholder: "Masalan: Aliyev Vali" },
  { id: "email", type: "email", icon: "fa-regular fa-envelope", label: "Email", placeholder: "example@mail.com" },
  { id: "telegram_username", type: "text", icon: "fa-regular fa-paper-plane", label: "Telegram", placeholder: "@username" },
  { id: "school", type: "text", icon: "fa-solid fa-graduation-cap", label: "O'qish joyi", placeholder: "25-maktab yoki Universitet" },
  { id: "address", type: "text", icon: "fa-solid fa-location-dot", label: "Manzil", placeholder: "Shahar, tuman, ko'cha" },
];

const initialFormData = {
  full_name: "", phone_number: "+998 ", phone_number2: "+998 ", parent_phone: "+998 ",
  birth_date: "", extra_info: "", password: "", parent_name: "", email: "",
  telegram_username: "", school: "", address: "", group_id: "",
};

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeExtraFields, setActiveExtraFields] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [groups, setGroups] = useState([]); // <-- SHU QATOR QO'SHILDI

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setActiveExtraFields([]);
      setErrors({});
      
      // <-- SHU YERDAN BOSHLAB QO'SHING -->
      const fetchGroups = async () => {
        try {
          const res = await studentsApi.getGroupsFromGroups();
          const groupList = res.results || res.data || res || [];
          setGroups(groupList);
        } catch (error) {
          console.error("Guruhlarni yuklashda xato:", error);
        }
      };
      fetchGroups();
      // <-- SHU YERGACHA QO'SHING -->
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Telefon raqamlarni ekranda chiroyli ko'rsatish uchun (+998 XX YYY ZZ VV)
  const formatPhoneForUI = (val) => {
    let digits = val.replace(/\D/g, "");
    if (!digits.startsWith("998")) digits = "998";
    digits = digits.slice(0, 12);
    let formatted = "+998";
    if (digits.length > 3) formatted += " " + digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);
    return formatted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["phone_number", "phone_number2", "parent_phone"].includes(name)) {
      setFormData({ ...formData, [name]: formatPhoneForUI(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleExtraField = (id) => {
    setActiveExtraFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Telefon raqamni backend kutayotgan (998-90-123-45-67) formatiga o'tkazish
  const formatPhoneForBackend = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length !== 12) return null;
    return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10, 12)}`;
  };

  const handleSubmit = async () => {
    const err = {};
    const backendPhone = formatPhoneForBackend(formData.phone_number);

    if (!formData.full_name.trim()) err.full_name = "Ism majburiy";
    if (!backendPhone) err.phone_number = "Telefon to'liq emas";

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setLoading(true);

    // ⚠️ XATOLARNING OLDINI OLISH UCHUN AQLLI PAYLOAD
    const payload = {
      full_name: formData.full_name.trim(),
      phone_number: backendPhone,
      // UUID TUG'RILANDI:
      branch_id: "1",
      organization_id: localStorage.getItem("org_id")
    };

    // FAQATGINA TO'LDIRILGAN MAYDONLARNI QO'SHAMIZ (Bo'sh stringlar uzoqroq tursin!)
    if (formData.birth_date) payload.birth_date = formData.birth_date;
    
    if (activeExtraFields.includes("phone_number2")) {
      const p2 = formatPhoneForBackend(formData.phone_number2);
      if (p2) payload.phone_number2 = p2;
    }
    if (activeExtraFields.includes("parent_phone")) {
      const pp = formatPhoneForBackend(formData.parent_phone);
      if (pp) payload.parent_phone = pp;
    }
    if (activeExtraFields.includes("parent_name") && formData.parent_name.trim()) payload.parent_name = formData.parent_name.trim();
    if (activeExtraFields.includes("address") && formData.address.trim()) payload.address = formData.address.trim();
    if (activeExtraFields.includes("email") && formData.email.trim()) payload.email = formData.email.trim();
    if (activeExtraFields.includes("telegram_username") && formData.telegram_username.trim()) payload.telegram_username = formData.telegram_username.trim();
    if (activeExtraFields.includes("school") && formData.school.trim()) payload.school = formData.school.trim();
    if (activeExtraFields.includes("password") && formData.password.trim()) payload.password = formData.password.trim();
    
    if (formData.extra_info.trim()) payload.extra_info = formData.extra_info.trim();

    try {
      // 1. O'zgartirildi: Natijani newStudent o'zgaruvchisiga oldik
      const newStudent = await studentsApi.createStudent(payload);
      
      // 2. QO'SHILDI: Agar guruh tanlangan bo'lsa, uni shu guruhga qo'shadi
      if (formData.group_id) {
        await studentsApi.addStudentToGroup(newStudent.id, {
          group_id: formData.group_id,
          join_date: new Date().toISOString().split("T")[0]
        });
      }

      alert("Talaba muvaffaqiyatli qo'shildi!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Xato:", err);
      const backendError = err.response?.data;
      if (backendError) {
        alert("Backend xatosi: \n" + JSON.stringify(backendError, null, 2));
      } else {
        alert("Tarmoq yoki server xatosi yuz berdi!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999999,
        display: 'flex', justifyContent: 'flex-end'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '450px', height: '100vh', backgroundColor: '#fff',
          padding: '20px 25px', overflowY: 'auto',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Yangi talaba</h4>
          <span style={{ cursor: "pointer", fontSize: '24px', color: '#888' }} onClick={onClose}>✕</span>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>F.I.Sh (To'liq ism) *</label>
          <input 
            type="text" 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', border: errors.full_name ? '1px solid red' : '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
            placeholder="Masalan: Aliyev Vali" 
          />

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Telefon raqami *</label>
          <input 
            type="text" 
            name="phone_number" 
            value={formData.phone_number} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', border: errors.phone_number ? '1px solid red' : '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
          />

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Tug‘ilgan sana</label>
          <input 
            type="date" 
            name="birth_date" 
            value={formData.birth_date} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', color: formData.birth_date ? '#333' : '#aaa' }} 
          />

          {/* <-- TUG'ILGAN SANA INPUTIDAN KEYIN SHU QISMNI QO'SHING --> */}
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Darhol guruhga biriktirish (Ixtiyoriy)</label>
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              marginBottom: '15px', 
              outline: 'none', 
              backgroundColor: '#fff',
              color: formData.group_id ? '#333' : '#777'
            }}
          >
            <option value="">-- Guruhsiz qoldirish --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name || g.title || g.group_name} {g.teacher_name ? `(${g.teacher_name})` : ""}
              </option>
            ))}
          </select>
          {/* <-- IZOH TEXTAREASIDAN OLDIN TUGAYDI --> */}

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Izoh</label>
          <textarea 
            name="extra_info" 
            value={formData.extra_info} 
            onChange={handleChange} 
            rows="2" 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px', resize: 'none' }} 
            placeholder="Talaba haqida qisqacha..." 
          />

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Qo'shimcha ma'lumotlar qo'shish</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {extraFieldsMeta.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleExtraField(item.id)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                  border: activeExtraFields.includes(item.id) ? 'none' : '1px solid #ddd',
                  backgroundColor: activeExtraFields.includes(item.id) ? '#F58634' : '#f9f9f9',
                  color: activeExtraFields.includes(item.id) ? '#fff' : '#666'
                }}
                title={item.label}
              >
                <i className={item.icon}></i>
              </button>
            ))}
          </div>

          {/* Dinamik ochiladigan inputlar */}
          {activeExtraFields.map((fieldId) => {
            const meta = extraFieldsMeta.find((f) => f.id === fieldId);
            return (
              <div key={fieldId} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#F58634', marginBottom: '5px' }}>{meta.label}</label>
                <input
                  type={meta.type}
                  name={fieldId}
                  value={formData[fieldId]}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder={meta.placeholder}
                />
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#F58634', color: '#fff', 
            border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '20px'
          }}
        >
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </button>

      </div>
    </div>
  );
};

export default AddStudentModal;