import React, { useState, useEffect } from "react";
import { leadsApi } from "../../api/leadsApi";
import "./styles/editLead.css"; // CSS yo'lini o'zingizga qarab to'g'rilang

// Qo'shimcha maydonlar ro'yxati (Student uchun)
const extraFieldsMeta = [
  { id: "phone_number2", type: "text", icon: "fa-solid fa-phone", label: "Qo'shimcha telefon", placeholder: "+998 90 123 45 68" },
  { id: "parent_phone", type: "text", icon: "fa-solid fa-phone", label: "Ota-ona tel", placeholder: "+998 90 123 45 00" },
  { id: "password", type: "text", icon: "fa-solid fa-key", label: "Parol", placeholder: "******" },
  { id: "parent_name", type: "text", icon: "fa-regular fa-user", label: "Ota-onasi F.I.Sh", placeholder: "Masalan: Aliyev Vali" },
  { id: "email", type: "email", icon: "fa-regular fa-envelope", label: "Email", placeholder: "example@mail.com" },
  { id: "telegram_username", type: "text", icon: "fa-regular fa-paper-plane", label: "Telegram", placeholder: "@username" },
  { id: "school", type: "text", icon: "fa-solid fa-graduation-cap", label: "O'qish joyi", placeholder: "Maktab yoki Universitet" },
  { id: "address", type: "text", icon: "fa-solid fa-location-dot", label: "Manzil", placeholder: "Shahar, tuman, ko'cha" },
];

export default function EditLeadDrawer({ open, onClose, lead, columns, onSave, onConvertToStudent }) {
  // 🌟 TAB HOALTI: 'edit' (Lid) yoki 'student' (Talaba)
  const [activeTab, setActiveTab] = useState("edit");

  // 🌟 LID STATE
  const [leadData, setLeadData] = useState({
    full_name: "", phone_number: "", pipline: "", comment: "", date: ""
  });

  // 🌟 STUDENT STATE (To'liq forma)
  const [studentData, setStudentData] = useState({
    full_name: "", phone_number: "+998 ", phone_number2: "+998 ", parent_phone: "+998 ",
    birth_date: "", extra_info: "", password: "", parent_name: "", email: "",
    telegram_username: "", school: "", address: "",
  });
  const [activeExtraFields, setActiveExtraFields] = useState([]);
  const [errors, setErrors] = useState({});

  // 🌟 GURUH STATE
  const [groups, setGroups] = useState([]);
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ----------------------------------------------------
  // OYNA OCHILGANDA MA'LUMOTLARNI YUKLASH VA TAYYORLASH
  // ----------------------------------------------------
  useEffect(() => {
    if (open && lead) {
      setActiveTab("edit");
      setErrors({});
      setActiveExtraFields([]);
      setSelectedGroupId("");

      const name = lead.title || lead.full_name || lead.name || "";
      const phone = lead.phone || lead.phone_number || "";

      // Lid formasi uchun
      setLeadData({
        full_name: name,
        phone_number: phone,
        pipline: lead.columnId || lead.pipline || "",
        comment: lead.comment || "",
        date: lead.date || new Date().toISOString().split('T')[0]
      });

      // Student formasi uchun (Liddagi ism va tel avtomat o'tadi)
      setStudentData(prev => ({
        ...prev,
        full_name: name,
        phone_number: phone ? formatPhoneForUI(phone) : "+998 ",
      }));

      // Guruhlarni yuklash
      const fetchGroups = async () => {
        setIsFetchingGroups(true);
        try {
          const res = await leadsApi.getGroups();
          let groupsArray = [];
          if (Array.isArray(res)) groupsArray = res;
          else if (Array.isArray(res?.data)) groupsArray = res.data;
          else if (Array.isArray(res?.data?.data)) groupsArray = res.data.data;
          else if (Array.isArray(res?.results)) groupsArray = res.results;
          setGroups(groupsArray);
        } catch (error) {
          console.error("Guruhlarni yuklashda xatolik:", error);
        } finally {
          setIsFetchingGroups(false);
        }
      };
      fetchGroups();
    }
  }, [open, lead]);

  if (!open) return null;

  // ----------------------------------------------------
  // TELEFON FORMATLASH LOHIKASI
  // ----------------------------------------------------
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

  const formatPhoneForBackend = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length !== 12) return null;
    return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10, 12)}`;
  };

  // ----------------------------------------------------
  // O'ZGARISHLARNI USHLAB OLISH
  // ----------------------------------------------------
  const handleLeadChange = (e) => setLeadData({ ...leadData, [e.target.name]: e.target.value });

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    if (["phone_number", "phone_number2", "parent_phone"].includes(name)) {
      setStudentData({ ...studentData, [name]: formatPhoneForUI(value) });
    } else {
      setStudentData({ ...studentData, [name]: value });
    }
  };

  const toggleExtraField = (id) => {
    setActiveExtraFields((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  // ----------------------------------------------------
  // SAQLASH LOHIKASI (2 XIL)
  // ----------------------------------------------------
  const handleSubmit = async () => {
    
    // 1. Agar Lid tahrirlanayotgan bo'lsa:
    if (activeTab === 'edit') {
      onSave({ 
        id: lead.id, title: leadData.full_name, phone: leadData.phone_number, 
        comment: leadData.comment, columnId: leadData.pipline 
      });
      return;
    }

    // 2. Agar Talabaga aylantirilayotgan bo'lsa:
    if (activeTab === 'student') {
      const err = {};
      const backendPhone = formatPhoneForBackend(studentData.phone_number);

      if (!studentData.full_name.trim()) err.full_name = "Ism majburiy";
      if (!backendPhone) err.phone_number = "Telefon to'liq emas";
      if (!selectedGroupId) err.group = "Guruh tanlash majburiy";

      setErrors(err);
      if (Object.keys(err).length > 0) return;

      setIsSaving(true);

      // 🌟 LocalStorage'dan tashkilot ID sini olamiz
      const orgId = localStorage.getItem('org_id');

      const payload = {
        full_name: studentData.full_name.trim(),
        phone_number: backendPhone,
        
        organization_id: orgId,
        branch_id: 1, 
        
        // 🌟 YECHIM: Agar bo'sh bo'lsa, xato bermasligi uchun "-" jo'natamiz
        phone_number2: formatPhoneForBackend(studentData.phone_number2) || "-",
        address: studentData.address ? studentData.address.trim() : "-",
      };

      if (studentData.birth_date) payload.birth_date = studentData.birth_date;
      if (studentData.extra_info.trim()) payload.extra_info = studentData.extra_info.trim();
      
      if (activeExtraFields.includes("parent_phone") && formatPhoneForBackend(studentData.parent_phone)) payload.parent_phone = formatPhoneForBackend(studentData.parent_phone);
      if (activeExtraFields.includes("parent_name") && studentData.parent_name.trim()) payload.parent_name = studentData.parent_name.trim();
      if (activeExtraFields.includes("email") && studentData.email.trim()) payload.email = studentData.email.trim();
      if (activeExtraFields.includes("telegram_username") && studentData.telegram_username.trim()) payload.telegram_username = studentData.telegram_username.trim();
      if (activeExtraFields.includes("school") && studentData.school.trim()) payload.school = studentData.school.trim();
      if (activeExtraFields.includes("password") && studentData.password.trim()) payload.password = studentData.password.trim();

      try {
        await leadsApi.createStudentFromLead(lead.id, selectedGroupId, payload);
        const groupName = groups.find(g => g.id?.toString() === selectedGroupId?.toString())?.name || "Guruh";
        alert(`"${payload.full_name}" muvaffaqiyatli ${groupName} ga qo'shildi va talabaga aylantirildi!`);
        
        onConvertToStudent(lead.id); // Liddan o'chirish
        onClose();
      } catch (error) {
        console.error("Talaba yaratishda xato:", error);
        alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      <div className="lead-drawer-overlay" onClick={onClose} />
      
      <div className="lead-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="lead-drawer-header">
          <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
            <i className="fa-solid fa-pen-to-square me-2" style={{ color: '#f97316' }}></i>
            Lid sozlamalari
          </h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        {/* TAB NAVBAR */}
        <div className="drawer-tabs">
          <button className={`drawer-tab ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>
            Lidni tahrirlash
          </button>
          <button className={`drawer-tab ${activeTab === 'student' ? 'active' : ''}`} onClick={() => setActiveTab('student')}>
            Talaba yaratish
          </button>
        </div>

        {/* BODY */}
        <div className="lead-drawer-body">
          
          {/* ================================================== */}
          {/* TAB 1: LIDNI TAHRIRLASH */}
          {/* ================================================== */}
          {activeTab === 'edit' && (
            <div>
              <div className="field-group">
                <label className="field-label">F.I.SH.</label>
                <input type="text" className="custom-input" name="full_name" value={leadData.full_name} onChange={handleLeadChange} />
              </div>
              
              <div className="field-group">
                <label className="field-label">Telefon raqami</label>
                <input type="text" className="custom-input" name="phone_number" value={leadData.phone_number} onChange={handleLeadChange} />
              </div>

              <div className="row-split">
                <div className="field-group">
                  <label className="field-label">Bosqich (Pipeline)</label>
                  <select className="custom-select" name="pipline" value={leadData.pipline} onChange={handleLeadChange}>
                    <option value="">Tanlang...</option>
                    {columns?.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Sana</label>
                  <input type="date" className="custom-input" name="date" value={leadData.date} onChange={handleLeadChange} />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Izoh</label>
                <textarea className="custom-textarea" name="comment" value={leadData.comment} onChange={handleLeadChange}></textarea>
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* TAB 2: TALABA YARATISH (To'liq forma) */}
          {/* ================================================== */}
          {activeTab === 'student' && (
            <div>
              <div className="field-group">
                <label className="field-label" style={{ color: '#f97316' }}>Qaysi guruhga qo'shiladi? *</label>
                <select 
                  className={`custom-select ${errors.group ? 'error' : ''}`} 
                  value={selectedGroupId} 
                  onChange={(e) => setSelectedGroupId(e.target.value)} 
                  disabled={isFetchingGroups}
                >
                  <option value="">{isFetchingGroups ? "Guruhlar yuklanmoqda..." : "Guruhni tanlang"}</option>
                  {Array.isArray(groups) && groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {errors.group && <span style={{color: 'red', fontSize: '12px'}}>{errors.group}</span>}
              </div>

              <hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />

              <div className="field-group">
                <label className="field-label">F.I.Sh (To'liq ism) *</label>
                <input type="text" name="full_name" className={`custom-input ${errors.full_name ? 'error' : ''}`} value={studentData.full_name} onChange={handleStudentChange} />
              </div>

              <div className="field-group">
                <label className="field-label">Telefon raqami *</label>
                <input type="text" name="phone_number" className={`custom-input ${errors.phone_number ? 'error' : ''}`} value={studentData.phone_number} onChange={handleStudentChange} />
              </div>

              <div className="field-group">
                <label className="field-label">Tug‘ilgan sana</label>
                <input type="date" name="birth_date" className="custom-input" value={studentData.birth_date} onChange={handleStudentChange} />
              </div>

              <div className="field-group">
                <label className="field-label">Izoh</label>
                <textarea name="extra_info" className="custom-textarea" value={studentData.extra_info} onChange={handleStudentChange} placeholder="Talaba haqida qisqacha..."></textarea>
              </div>

              <label className="field-label mt-4">Qo'shimcha ma'lumotlar</label>
              <div className="extra-fields-row">
                {extraFieldsMeta.map((item) => (
                  <button
                    key={item.id}
                    className={`extra-btn ${activeExtraFields.includes(item.id) ? 'active' : ''}`}
                    onClick={() => toggleExtraField(item.id)}
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
                  <div key={fieldId} className="field-group">
                    <label className="field-label" style={{ color: '#f97316' }}>{meta.label}</label>
                    <input type={meta.type} name={fieldId} className="custom-input" value={studentData[fieldId]} onChange={handleStudentChange} placeholder={meta.placeholder} />
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="lead-drawer-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isSaving}>Bekor qilish</button>
          <button className="btn-save" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saqlanmoqda..." : activeTab === 'student' ? "Talaba yaratish" : "Saqlash"}
          </button>
        </div>
        
      </div>
    </>
  );
}