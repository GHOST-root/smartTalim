import React, { useState, useRef, useEffect } from 'react';
import { employeesApi } from '../../../api/employeesApi';

const AddEmployeeDrawer = ({ isOpen, onClose, onRefresh, editingEmployee }) => {
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  
  const initialFormState = {
    name: '', phone: '', password: '', position: '',
    roles: [], birthDate: '', gender: 'Erkak', photoName: '', photoFile: null
  };

  const [formData, setFormData] = useState(initialFormState);

  // Agar tahrirlash (Edit) rejimida bo'lsak, formani eski ma'lumotlar bilan to'ldiramiz
  useEffect(() => {
    if (editingEmployee && isOpen) {
      // Backenddan kelgan formatni formadagi state formatimizga tushiramiz
      // Telefon raqamdan +998 ni va bo'shliqlarni olib tashlaymiz
      let cleanPhone = editingEmployee.phone ? editingEmployee.phone.replace('+998', '').replace(/\s+/g, '') : '';
      
      // Roles ni ajratib olish (agar u string bo'lib vergul bilan kelgan bo'lsa)
      let currentRoles = [];
      if (editingEmployee.position) {
         currentRoles = editingEmployee.position.split(', ').filter(role => 
            ['CEO', 'Branch Director', 'Administrator', 'Administrator2', 'Limited Administrator', 'Teacher', 'Marketer', 'Cashier'].includes(role)
         );
      }

      setFormData({
        name: editingEmployee.full_name || '',
        phone: cleanPhone,
        password: '', // Tahrirlashda parolni ko'rsatmaymiz (xavfsizlik). O'zgartirmoqchi bo'lsa yangi yozadi.
        position: editingEmployee.position || '',
        roles: currentRoles,
        birthDate: editingEmployee.birth_date || '',
        gender: editingEmployee.gender || 'Erkak',
        photoName: editingEmployee.photo ? 'Joriy rasm yuklangan' : '',
        photoFile: null
      });
    } else if (isOpen) {
       // Yangi qo'shish rejimi (drawer ochilganda toza bo'lishi kerak)
       setFormData(initialFormState);
       setErrors({});
    }
  }, [editingEmployee, isOpen]);


  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 9) val = val.slice(0, 9); 
    
    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + ' ' + val.slice(2);
    if (val.length > 5) formatted = formatted.slice(0, 6) + ' ' + val.slice(5);
    if (val.length > 7) formatted = formatted.slice(0, 9) + ' ' + val.slice(7);
    
    setFormData({ ...formData, phone: formatted });
  };

  const handleRoleChange = (role) => {
    const newRoles = formData.roles.includes(role) 
        ? formData.roles.filter(r => r !== role) 
        : [...formData.roles, role];
    setFormData({ ...formData, roles: newRoles });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photoName: file.name, photoFile: file });
    }
  };

  const handleSave = async () => {
    // Tahrirlashda parol yozilmagan bo'lishi mumkin (eskisi qolishi uchun), shuning uchun faqat Ism va Telefonni qattiq tekshiramiz
    const phoneCleanLength = formData.phone.replace(/\s+/g, '').length;
    
    if (!formData.name || phoneCleanLength !== 9 || (!editingEmployee && formData.password.length < 6)) {
      setErrors({ 
        name: !formData.name, 
        phone: phoneCleanLength !== 9, 
        password: !editingEmployee && formData.password.length < 6 
      });
      return;
    }

    try {
      const formattedPhone = formData.phone.replace(/\s+/g, '');
      const autoPosition = formData.roles.length > 0 ? formData.roles.join(', ') : 'Xodim';

      const payload = {
        full_name: formData.name, 
        phone: formattedPhone,
        position: autoPosition,
        email: `${formattedPhone}@edu-system.uz`, 
        gender: formData.gender
      };

      if (formData.birthDate) payload.birth_date = formData.birthDate; 
      // Agar yangi parol yozilgan bo'lsa (tahrirlashda) yoki umuman yangi xodim bo'lsa
      if (formData.password) payload.password = formData.password;

      if (editingEmployee) {
         // TAHRIRLASH REJIMI
         // Esda tuting: employeesApi.js faylingizda updateTeacher degan funksiya PATCH yoki PUT metodi bilan yozilgan bo'lishi shart!
         await employeesApi.updateTeacher(editingEmployee.id, payload);
         alert("Xodim ma'lumotlari muvaffaqiyatli yangilandi!");
      } else {
         // YANGI QO'SHISH REJIMI
         await employeesApi.createTeacher(payload);
         alert("Xodim muvaffaqiyatli saqlandi!");
      }
      
      setFormData(initialFormState);
      if (typeof onRefresh === 'function') onRefresh();
      onClose();

    } catch (error) {
      console.error("Saqlashda xato:", error);
      alert("Xatolik yuz berdi. Backend talablariga mos kelmayotgan bo'lishi mumkin.");
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 999999,
        display: 'flex', justifyContent: 'flex-end'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px', height: '100vh', backgroundColor: '#fff',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-5px 0 25px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontWeight: 500, color: '#444', fontSize: '18px' }}>
             {editingEmployee ? "Xodimni tahrirlash" : "Yangi xodimni qo'shish"}
          </h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>
        
        <div style={{ padding: '20px 25px', flex: 1, overflowY: 'auto' }}>
          
          <div className="field">
            <label>Ism</label>
            <input 
              type="text" 
              className={errors.name ? 'err-inp' : ''} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className="field">
            <label>Telefon</label>
            <div className={`input-group ${errors.phone ? 'err-inp' : ''}`}>
              <span className="prefix" style={{color: '#2d9cdb', fontWeight: '500'}}>+998</span>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={handlePhoneChange} 
              />
            </div>
          </div>

          <div className="field" style={{ position: 'relative' }}>
            <label>Parol {editingEmployee && <span style={{fontSize: '11px', color: '#888'}}>(O'zgartirish uchun yangi parol yozing)</span>}</label>
            <div className={`input-group ${errors.password ? 'err-inp' : ''}`} style={errors.password ? {borderColor: '#eb5757'} : {}}>
              <input 
                type={showPass ? "text" : "password"} 
                maxLength="20" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder={editingEmployee ? "Yangi parolni kiriting..." : ""}
              />
              <span onClick={() => setShowPass(!showPass)} style={{ padding: '0 10px', cursor: 'pointer', fontSize: '18px' }}>
                {showPass ? '🙈' : '🐵'} 
              </span>
            </div>
            {errors.password && (
              <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #f27a21', padding: '2px 15px', borderRadius: '4px', fontSize: '12px', color: '#555', zIndex: 10 }}>
                Zarur
              </div>
            )}
          </div>

          <div className="field">
            <label>Rol</label>
            <div className="roles-container">
              {['CEO', 'Branch Director', 'Administrator', 'Administrator2', 'Limited Administrator', 'Teacher', 'Marketer', 'Cashier'].map(r => (
                <label key={r} className="checkbox-item">
                  <input type="checkbox" checked={formData.roles.includes(r)} onChange={() => handleRoleChange(r)} />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Tug'ilgan sana</label>
            <input 
              type="date" 
              value={formData.birthDate} 
              onChange={e => setFormData({...formData, birthDate: e.target.value})} 
              style={{ color: formData.birthDate ? '#333' : '#aaa' }}
            />
          </div>

          <div className="field">
            <label>Jins</label>
            <div className="gender-row">
              <label className="radio-label  d-flex gap-2">
                <input type="radio" name="gender" value="Erkak" checked={formData.gender === 'Erkak'} onChange={e => setFormData({...formData, gender: e.target.value})} />
                Erkak
              </label>
              <label className="radio-label d-flex gap-2">
                <input type="radio" name="gender" value="Ayol" checked={formData.gender === 'Ayol'} onChange={e => setFormData({...formData, gender: e.target.value})} />
                Ayol
              </label>
            </div>
          </div>

          <div className="field mb-4">
            <label>Foto</label>
            <div className="file-box">
              <input type="text" readOnly value={formData.photoName} placeholder="Hech qanday fayl tanlanmadi" />
              <button type="button" onClick={() => fileInputRef.current.click()}>Browse</button>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            </div>
          </div>

        </div>

        <div style={{ padding: '20px 25px', borderTop: '1px solid #eee' }}>
          <button className="btn-save" onClick={handleSave} style={{ width: '120px' }}>
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeDrawer;