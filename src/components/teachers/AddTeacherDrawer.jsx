import { useState } from "react";
import { teachersApi } from "../../api/teachersApi";
import "./addTeacher.css";

function AddTeacherDrawer({ onClose, onRefresh }) {
  const [photo, setPhoto] = useState(null); 
  const [photoPreview, setPhotoPreview] = useState(""); 
  
  const [phone, setPhone] = useState("+998 ");
  const [fullName, setFullName] = useState(""); 
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (!digits.startsWith("998")) digits = "998";
    digits = digits.slice(0, 12);
    let formatted = "+998";
    if (digits.length > 3) formatted += " " + digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 8);
    if (digits.length > 8) formatted += " " + digits.slice(8, 10);
    if (digits.length > 10) formatted += " " + digits.slice(10, 12);
    setPhone(formatted);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file); 
    setPhotoPreview(URL.createObjectURL(file)); 
  };

  const save = async () => {
    const err = {};
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (cleanPhone.length !== 12) err.phone = "Telefon to‘liq emas";
    if (!fullName.trim()) err.fullName = "F.I.Sh majburiy"; 
    if (!gender) err.gender = "Jins tanlanmagan";
    if (password.length < 6) err.password = "Parol 6 xonali bo‘lishi kerak";

    setErrors(err);
    if (Object.keys(err).length) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('phone', cleanPhone);
      formData.append('password', password);
      formData.append('email', `${cleanPhone}@edu-system.uz`);
      formData.append('gender', gender === "male" ? "Erkak" : "Ayol");
      formData.append('position', "Teacher"); 

      if (birth) formData.append('birth_date', birth);
      if (photo) formData.append('photo', photo); 

      await teachersApi.createTeacher(formData);
      alert("O'qituvchi muvaffaqiyatli saqlandi!");
      
      if (onRefresh) onRefresh(); 
      onClose();   
    } catch (error) {
      console.error("Saqlashda xato:", error);
      alert("Xatolik yuz berdi. Backend loglarini tekshiring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999999 }} onClick={onClose}>
      
      <div className="custom-drawer" onClick={(e) => e.stopPropagation()}>
        
        <div className="drawer-header">
          <h5 className="drawer-title">Yangi o‘qituvchi</h5>
          <span className="close-icon" onClick={onClose}>✕</span>
        </div>

        <div className="drawer-body">
          
          {/* 🌟 100% O'ZBEKCHA VA O'RTALASHTIRILGAN FOTO INPUT 🌟 */}
          <div className="form-group">
            <label className="custom-label">Foto</label>
            <div className="custom-file-wrapper">
              <input id="photo-upload" type="file" className="hidden-file-input" onChange={handlePhoto} accept="image/*" />
              <label htmlFor="photo-upload" className="custom-file-label">
                <span className="custom-file-btn">Fayl tanlash</span>
                <span className="custom-file-text">{photo ? photo.name : "Fayl tanlanmagan"}</span>
              </label>
            </div>
            {/* Rasm tanlanganda uni o'rtada chiqarish */}
            {photoPreview && (
              <div className="preview-container">
                <img src={photoPreview} alt="Foto" className="preview-img" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="custom-label">Telefon</label>
            <input className={`custom-input ${errors.phone ? "error-border" : ""}`} value={phone} onChange={handlePhoneChange} />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="custom-label">F.I.Sh (To'liq ism)</label>
            <input className={`custom-input ${errors.fullName ? "error-border" : ""}`} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Masalan: Aliyev Vali" />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="custom-label">Lavozimi</label>
            <input type="text" className="custom-input disabled-input" value="O'qituvchi (Teacher)" readOnly disabled />
          </div>

          <div className="form-group">
            <label className="custom-label">Tug‘ilgan sana</label>
            <input type="date" className={`custom-input ${errors.birth ? "error-border" : ""}`} value={birth} onChange={(e) => setBirth(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="custom-label">Jins</label>
            <div className="custom-radio-group">
              <label className="custom-radio-label">
                <input type="radio" checked={gender === "male"} onChange={() => setGender("male")} /> Erkak
              </label>
              <label className="custom-radio-label">
                <input type="radio" checked={gender === "female"} onChange={() => setGender("female")} /> Ayol
              </label>
            </div>
            {errors.gender && <span className="error-msg">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label className="custom-label">Parol</label>
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} className={`custom-input ${errors.password ? "error-border" : ""}`} value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="password-eye" onClick={() => setShowPassword(!showPassword)}>
                 {showPassword ? "🙈" : "👁"}
              </span>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

        </div>

        <div className="drawer-footer">
          <button className="custom-save-btn" onClick={save} disabled={isSubmitting}>
            {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddTeacherDrawer;