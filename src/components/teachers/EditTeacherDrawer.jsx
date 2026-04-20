import { useState, useEffect } from "react";
import { teachersApi } from "../../api/teachersApi";

function EditTeacherDrawer({ teacher, onClose, onRefresh }) {
  const [photo, setPhoto] = useState(null); 
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    phone: "+998", fullName: "", birth: "", gender: "male", password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (teacher) {
      setForm({
        phone: teacher.phone || "+998 ",
        fullName: teacher.name || "", // Bitta yagona ism
        birth: teacher.birth_date || teacher.birth || "",
        gender: (teacher.gender === "Ayol") ? "female" : "male",
        password: "" 
      });
      setPhotoPreview(teacher.photo || ""); // Bazadan kelgan eski rasm
    }
  }, [teacher]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file); 
    setPhotoPreview(URL.createObjectURL(file)); 
  };

  const validate = () => {
    const e = {};
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 12) e.phone = "To'liq kiriting";
    if (!form.fullName.trim()) e.fullName = "F.I.Sh zarur";
    if (form.password && form.password.length < 6) e.password = "Parol 6 xonadan kam";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const cleanPhone = form.phone.replace(/\D/g, "");
      
      const formData = new FormData();
      formData.append('full_name', form.fullName.trim());
      formData.append('phone', cleanPhone);
      formData.append('email', `${cleanPhone}@edu-system.uz`);
      formData.append('gender', form.gender === "male" ? "Erkak" : "Ayol");
      formData.append('position', "Teacher");

      if (form.birth) formData.append('birth_date', form.birth);
      if (form.password) formData.append('password', form.password);
      
      // Faqat yangi rasm tanlangan bo'lsa, bazaga jo'natamiz
      if (photo) formData.append('photo', photo); 

      await teachersApi.updateTeacher(teacher.id, formData);
      alert("O'qituvchi muvaffaqiyatli yangilandi!");
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error("Yangilashda xato:", error);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', 
        zIndex: 9999999,
        display: 'flex', justifyContent: 'flex-end'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '420px', height: '100vh', backgroundColor: '#fff',
          padding: '20px 25px', overflowY: 'auto',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.2)'
        }}
      >
        <div className="d-flex justify-content-between mb-4 align-items-center">
          <h5 className="mb-0">O‘qituvchini tahrirlash</h5>
          <span style={{ cursor: "pointer", fontSize: '24px', color: '#888' }} onClick={onClose}>✕</span>
        </div>

        <label>Foto</label>
        <input type="file" className="form-control mb-2" onChange={handlePhoto} accept="image/*" />
        {photoPreview && <img src={photoPreview} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} className="mb-3" />}

        <label>Telefon</label>
        <input
          className={`form-control mb-2 ${errors.phone ? "border-danger" : ""}`}
          value={form.phone}
          onChange={(e) => {
            let v = e.target.value.replace(/[^\d]/g, "");
            if (!v.startsWith("998")) v = "998";
            v = v.slice(0, 12);
            let formatted = "+998";
            if (v.length > 3) formatted += " " + v.slice(3, 5);
            if (v.length > 5) formatted += " " + v.slice(5, 8);
            if (v.length > 8) formatted += " " + v.slice(8, 10);
            if (v.length > 10) formatted += " " + v.slice(10, 12);
            setForm({ ...form, phone: formatted });
          }}
        />
        {errors.phone && <small className="text-danger d-block mb-2">{errors.phone}</small>}

        <label className="mt-2">F.I.Sh (To'liq ism)</label>
        <input className={`form-control ${errors.fullName ? "border-danger" : ""}`} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        {errors.fullName && <small className="text-danger d-block mt-1">{errors.fullName}</small>}

        <label className="mt-3">Lavozimi</label>
        <input type="text" className="form-control mb-2 bg-light text-muted" value="O'qituvchi (Teacher)" readOnly />

        <label className="mt-2">Tug‘ilgan sana</label>
        <input type="date" className="form-control mb-2" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />

        <label className="mt-2">Jins</label>
        <div className="d-flex gap-3 mb-2">
          <label><input type="radio" checked={form.gender === "male"} onChange={() => setForm({ ...form, gender: "male" })} /> Erkak</label>
          <label><input type="radio" checked={form.gender === "female"} onChange={() => setForm({ ...form, gender: "female" })} /> Ayol</label>
        </div>

        <label className="mt-2">Parol <span style={{fontSize: '11px', color: '#888'}}>(faqat o'zgartirish uchun)</span></label>
        <div className="position-relative">
          <input type={showPass ? "text" : "password"} className={`form-control ${errors.password ? "border-danger" : ""}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <span onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: 10, cursor: "pointer" }}>👁</span>
        </div>
        {errors.password && <small className="text-danger">{errors.password}</small>}

        <button className="btn btn-warning w-100 text-white mt-4 fw-bold" onClick={save} disabled={isSubmitting}>
          {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}

export default EditTeacherDrawer;