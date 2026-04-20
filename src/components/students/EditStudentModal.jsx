import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi"; // API dan foydalanamiz

const EditStudentModal = ({ isOpen, onClose, onSuccess, student }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    groups: "",
    time: "",
    teacher: "",
    date: "",
    coins: 0,
    extra_info: "",
    status: "Faol",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Oyna ochilganda talaba ma'lumotlarini formaga yuklash
  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        full_name: student.full_name || student.name || "",
        phone_number: student.phone_number || student.phone || "",
        groups: student.groups || "",
        time: student.time || "",
        teacher: student.teacher || "",
        date: student.date || "",
        balance: Number(student.balance || 0),
        coins: Number(student.coins || 0),
        extra_info: student.extra_info || student.note || "",
        status: student.status || "Faol",
      });
      setError("");
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!student.id) {
      setError("Talaba ID si topilmadi!");
      return;
    }

    setLoading(true);
    setError("");

    const updateData = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      groups: formData.groups,
      time: formData.time,
      teacher: formData.teacher,
      date: formData.date,
      balance: Number(formData.balance),
      coins: Number(formData.coins),
      extra_info: formData.extra_info,
      status: formData.status,
    };

    try {
      // Yangi API interfeysimiz orqali jo'natamiz
      const response = await studentsApi.updateStudent(student.id, updateData);
      onSuccess(response);
      alert("Ma'lumotlar muvaffaqiyatli saqlandi!");
      onClose();
    } catch (err) {
      console.error("Yangilashda xato:", err);
      setError("Xatolik yuz berdi. Backend talablarini tekshiring.");
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
          <h4 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Talabani tahrirlash</h4>
          <span style={{ cursor: "pointer", fontSize: '24px', color: '#888' }} onClick={onClose}>✕</span>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}

        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Ism va Familiya</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} />

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Telefon raqami</label>
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} />

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Guruh</label>
              <input type="text" name="groups" value={formData.groups} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Vaqt</label>
              <input type="text" name="time" value={formData.time} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>O'qituvchi</label>
          <input type="text" name="teacher" value={formData.teacher} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} />

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Coins</label>
              <input type="number" name="coins" value={formData.coins} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Izoh</label>
          <textarea name="extra_info" value={formData.extra_info} onChange={handleChange} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#F58634', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditStudentModal;