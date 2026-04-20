import React, { useState, useEffect } from "react";
import { settingsApi } from "../../api/settingsApi"; // Yo'lni tekshiring

export default function UmumiySozlamalar() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tashkilot ID-si (Sizda UUID bo'lsa, backend dasturchi int:pk ni uuid:pk ga o'zgartirishi kerak)

  const [form, setForm] = useState({
    companyType: "",
    centerName: "",
    logo: null,
    logoPreview: null,
    color: "#8e44ad",
    animation: true,
    startTime: "09:00",
    endTime: "21:00",
  });

  // 1. Sozlamalarni bazadan yuklash
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.organization.getSettings(ORG_ID);
        setForm({
          companyType: data.company_type || "",
          centerName: data.name || "", // Backendda odatda 'name' bo'ladi
          logoPreview: data.logo || null,
          color: data.primary_color || "#8e44ad",
          animation: data.enable_animation ?? true,
          startTime: data.work_start_time || "09:00",
          endTime: data.work_end_time || "21:00",
          logo: null // Faylni qayta yuklamaguncha null bo'ladi
        });
      } catch (err) {
        console.error("Sozlamalarni yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      });
    }
  };

  // 2. Sozlamalarni saqlash
  const handleSave = async () => {
    setIsSaving(true);
    
    // Logotip fayli bo'lgani uchun FormData ishlatamiz
    const formData = new FormData();
    formData.append("name", form.centerName);
    formData.append("company_type", form.companyType);
    formData.append("primary_color", form.color);
    formData.append("enable_animation", form.animation);
    formData.append("work_start_time", form.startTime);
    formData.append("work_end_time", form.endTime);
    
    // Agar yangi logo tanlangan bo'lsa qo'shamiz
    if (form.logo instanceof File) {
      formData.append("logo", form.logo);
    }

    try {
      await settingsApi.organization.updateSettings(ORG_ID, formData);
      alert("Sozlamalar muvaffaqiyatli saqlandi ✅");
    } catch (err) {
      console.error("Saqlashda xato:", err.response?.data || err);
      alert("Xatolik yuz berdi. Backend field nomlarini tekshiring.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Yuklanmoqda...</div>;

  const colors = ["#8e44ad", "#0d6efd", "#556b2f", "#fd7e14", "#8b0000"];

  return (
    <div className="container my-4" style={{maxWidth: '800px'}}>
      <h4 className="mb-4 fw-bold">Umumiy sozlamalar</h4>

      <div className="card p-4 shadow-sm border-0 rounded-4">
        {/* Kompaniya turi */}
        <div className="mb-3">
          <label className="form-label text-muted small fw-medium">Kompaniya turi</label>
          <select
            className="form-select"
            value={form.companyType}
            onChange={(e) => handleChange("companyType", e.target.value)}
          >
            <option value="">Tanlang</option>
            <option value="crm">CRM</option>
            <option value="education">O'quv markazi</option>
          </select>
        </div>

        {/* Markaz nomi */}
        <div className="mb-3">
          <label className="form-label text-muted small fw-medium">
            O'quv markazining nomi <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            value={form.centerName}
            onChange={(e) => handleChange("centerName", e.target.value)}
            placeholder="Masalan: Smart Edu"
          />
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className="form-label text-muted small fw-medium">Logotip</label>
          <div className="d-flex align-items-center gap-3">
            <input
              type="file"
              className="form-control"
              onChange={handleLogoChange}
              accept="image/*"
            />
            {form.logoPreview && (
              <img
                src={form.logoPreview}
                alt="logo"
                style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px" }}
              />
            )}
          </div>
        </div>

        {/* Rang tanlash */}
        <div className="mb-4">
          <label className="form-label text-muted small fw-medium">Asosiy interfeys rangi</label>
          <div className="d-flex gap-3 mt-1">
            {colors.map((c) => (
              <div
                key={c}
                className={`color-circle ${form.color === c ? "active-border" : ""}`}
                style={{ 
                  backgroundColor: c, 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  cursor: 'pointer',
                  border: form.color === c ? '3px solid #dee2e6' : 'none'
                }}
                onClick={() => handleChange("color", c)}
              ></div>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small fw-medium">Ish boshlanishi</label>
            <input
              type="time"
              className="form-control"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small fw-medium">Ish tugashi</label>
            <input
              type="time"
              className="form-control"
              value={form.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
            />
          </div>
        </div>

        {/* Animatsiya */}
        <div className="form-check form-switch mb-4 mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="animSwitch"
            checked={form.animation}
            onChange={(e) => handleChange("animation", e.target.checked)}
          />
          <label className="form-check-label ms-2" htmlFor="animSwitch">Interfeys animatsiyalari</label>
        </div>

        <button 
          className="btn btn-warning px-5 py-2 rounded-pill fw-bold text-white border-0" 
          onClick={handleSave}
          disabled={isSaving}
          style={{backgroundColor: '#F27A21'}}
        >
          {isSaving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
        </button>
      </div>
    </div>
  );
}