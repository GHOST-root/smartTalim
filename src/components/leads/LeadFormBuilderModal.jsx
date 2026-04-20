import React, { useState, useEffect } from 'react';
import { leadsApi } from '../../api/leadsApi';

function LeadFormBuilderModal({ isOpen, onClose, columns, sources }) {
  const [view, setView] = useState('list'); 
  const [editingFormId, setEditingFormId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Haqiqiy formalar ro'yxati
  const [formsList, setFormsList] = useState([]);

  const [formData, setFormData] = useState({
    title: "", branch: "", targetColumn: "", targetSource: "",
    coverColor: "#2a2a2a", logoImage: "modme", themeColor: "#f48c06",
  });

  const [fields, setFields] = useState([
    { id: 'f1', type: 'text', label: 'Ism', required: true, isStatic: true },
    { id: 'f2', type: 'phone', label: 'Telefon', required: true, isStatic: true }
  ]);

  // Oyna ochilganda bazadan formalarni tortib kelish
  useEffect(() => {
    if (isOpen) {
      fetchForms();
    }
  }, [isOpen]);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getLeadForms();
      setFormsList(res.results || res || []);
    } catch (error) {
      console.error("Formalarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // 1. Yangi yaratishga o'tish
  const handleCreateNew = () => {
    setEditingFormId(null);
    setFormData({
      title: "Yangi Lid Forma", branch: "", targetColumn: "", targetSource: "",
      coverColor: "#2a2a2a", logoImage: "modme", themeColor: "#f48c06",
    });
    setFields([
      { id: 'f1', type: 'text', label: 'Ism', required: true, isStatic: true },
      { id: 'f2', type: 'phone', label: 'Telefon', required: true, isStatic: true }
    ]);
    setView('build');
  };

  // 2. Formani Tahrirlash
  const handleEditForm = (form) => {
    setEditingFormId(form.id);
    setFormData({
      title: form.name || form.title, 
      targetColumn: form.pipeline || form.targetColumn || "", 
      targetSource: form.source || form.targetSource || "",
      coverColor: "#2a2a2a", logoImage: "modme", themeColor: "#f48c06",
    });
    setView('build');
  };

  // 3. Formani O'chirish (API)
  const handleDeleteForm = async (id) => {
    if (window.confirm("Bu formani butunlay o'chirib tashlaysizmi?")) {
      try {
        await leadsApi.deleteLeadForm(id);
        setFormsList(formsList.filter(f => f.id !== id));
      } catch (error) {
        console.error("Formani o'chirishda xatolik:", error);
        alert("Xatolik! Forma o'chirilmadi.");
      }
    }
  };

  const handleCopyLink = (id) => {
    // API ga qarab linkni to'g'rilaysiz
    const link = `https://crm.modme.uz/form/${id}`;
    navigator.clipboard.writeText(link);
    alert("Forma havolasi nusxalandi! \n" + link);
  };

  const handleAddBlock = (type) => {
    const labels = {
      'select': 'Bir necha variantli so\'rovnoma', 'short': 'Qisqa izoh', 
      'long': 'Uzoq izoh', 'text': 'Matn', 'nps': 'NPS so\'rovnomasi', 'phone2': 'Qo\'shimcha telefon raqam'
    };
    setFields([...fields, { id: Date.now(), type, label: labels[type], required: false, isStatic: false }]);
  };

  const handleRemoveBlock = (id) => setFields(fields.filter(f => f.id !== id));

  // 5. SAQLASH VA YANGILASH (API)
  const handleSave = async () => {
    if (!formData.title) return alert("Forma nomini kiriting!");
    
    setIsSaving(true);
    try {
      // Backend kutadigan asosiy paket (payload)
      const payload = {
        name: formData.title,
        pipeline: formData.targetColumn || null, 
        source: formData.targetSource || null,
        
        // 🔥 XATO DAVOSI 2: lead_form ni 'null' deb emas, umuman jo'natmaymiz!
        // Barcha savollar aniq formatda yuboriladi
        fields: fields.map((f, index) => {
          const fieldObj = {
            label: f.label,
            field_type: f.type,
            is_required: f.required || false,
            order: index + 1
          };
          
          // 🔥 MUHIM QO'SHIMCHA: Agar field bazadan kelgan haqiqiy ID ga ega bo'lsa (yangi qo'shilmagan bo'lsa)
          // uni update qilishlari uchun backendga jo'natamiz. (Date.now() dan kichik son bo'lsa)
          if (editingFormId && typeof f.id === 'number' && f.id < 1000000000000) {
              fieldObj.id = f.id;
          }
          
          return fieldObj;
        }),
        
        branch_id: 1,
      };

      if (editingFormId) {
        // Tahrirlash
        await leadsApi.updateLeadForm(editingFormId, payload);
        alert("Forma muvaffaqiyatli yangilandi!");
      } else {
        // Yangi yaratish
        await leadsApi.createLeadForm(payload);
        alert("Yangi forma muvaffaqiyatli saqlandi!");
      }
      
      // Muvaffaqiyatli bo'lsa ro'yxatni yangilab, orqaga qaytamiz
      fetchForms();
      setView('list');

    } catch (error) {
      console.error("Formani saqlashda xatolik:", error);
      if(error.response && error.response.data) {
        alert("Xatolik: " + JSON.stringify(error.response.data));
      } else {
        alert("Xatolik! Forma saqlanmadi.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.4)", zIndex: 1100 }}>
      
      <div className="bg-white rounded shadow-lg d-flex flex-column overflow-hidden" style={{ width: view === 'build' ? '1200px' : '900px', height: '85vh', transition: 'width 0.3s ease' }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
          <h4 className="m-0 fw-bold text-dark">{view === 'list' ? 'Formalar' : (editingFormId ? 'Formani tahrirlash' : 'Lid forma yaratish')}</h4>
          <div className="d-flex gap-3 align-items-center">
            {view === 'list' && (
              <button className="btn text-white px-4 fw-medium" style={{ backgroundColor: '#f48c06', borderRadius: '20px' }} onClick={handleCreateNew}>
                Yangisini qo'shish
              </button>
            )}
            <button className="btn btn-sm text-muted fs-4 p-0 border-0" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ================= 1. FORMALAR RO'YXATI (LIST VIEW) ================= */}
        {view === 'list' && (
          <div className="p-4 flex-grow-1 overflow-auto bg-white position-relative">
            {isLoading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            )}
            <table className="table table-hover align-middle">
              <thead className="text-muted" style={{ fontSize: '14px' }}>
                <tr>
                  <th className="fw-medium border-0 pb-3">id</th>
                  <th className="fw-medium border-0 pb-3">Nomi</th>
                  <th className="fw-medium border-0 pb-3 text-end">Amallar</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: '2px solid #eee' }}>
                {!isLoading && formsList.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">Hali hech qanday forma yo'q</td></tr>
                ) : (
                  formsList.map(form => (
                    <tr key={form.id} style={{ backgroundColor: '#f8f9fa' }}>
                      <td className="py-3 text-muted">{form.id}</td>
                      <td className="py-3 fw-medium text-dark">{form.name || form.title}</td>
                      <td className="py-3 text-end">
                        <button className="btn btn-sm text-warning p-1 me-2" onClick={() => handleEditForm(form)}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-sm text-danger p-1 me-3" onClick={() => handleDeleteForm(form.id)}><i className="fa-solid fa-trash"></i></button>
                        <button className="btn btn-sm btn-light border p-1 px-2 text-warning fw-bold" onDoubleClick={() => handleCopyLink(form.id)} title="Nusxalash uchun 2 marta bosing!"><i className="fa-solid fa-link"></i></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= 2. FORMA YARATISH / TAHRIRLASH (BUILDER VIEW) ================= */}
        {view === 'build' && (
          <div className="d-flex flex-grow-1 overflow-hidden">
            
            {/* CHAP TOMON: Sozlamalar */}
            <div className="col-5 p-4 overflow-auto border-end" style={{ backgroundColor: '#fff' }}>
              
              <div className="d-flex border mb-4 rounded overflow-hidden">
                <button className="btn flex-grow-1 rounded-0 bg-white border-0 text-muted">Oddiy forma</button>
                <button className="btn flex-grow-1 rounded-0 border-0 fw-bold" style={{ backgroundColor: '#fff', borderBottom: '2px solid #007bff', color: '#007bff' }}>Lid forma</button>
              </div>

              <input type="text" className="form-control mb-3" placeholder="Forma nomi..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ border: '1px solid #ffb703' }} />
              
              <select className="form-select mb-3 text-muted" value={formData.targetColumn} onChange={e => setFormData({...formData, targetColumn: e.target.value})}><option value="">Bo'lim (Pipeline)</option>{columns?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
              <select className="form-select mb-4 text-muted" value={formData.targetSource} onChange={e => setFormData({...formData, targetSource: e.target.value})}><option value="">Mijoz manbalari</option>{sources?.map(s => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}</select>

              {/* MAYDONLAR */}
              <div className="d-flex flex-column gap-2 mb-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="p-3 border rounded bg-white position-relative shadow-sm" style={{ borderLeft: field.isStatic ? '3px solid #007bff' : '3px solid #ced4da' }}>
                    {!field.isStatic && <button className="btn btn-sm text-danger position-absolute top-0 end-0 m-1 p-0 px-1" onClick={() => handleRemoveBlock(field.id)}>✕</button>}
                    <span className="text-muted fw-bold me-3" style={{ fontSize: '13px' }}>{idx + 1}</span>
                    <span className="fw-bold text-dark"><span className="text-danger me-1">*</span>{field.label}</span>
                  </div>
                ))}
              </div>

              <div className="dropdown dropup">
                <button className="btn text-white px-4 py-2" data-bs-toggle="dropdown" style={{ backgroundColor: '#f48c06', borderRadius: '20px' }}>
                  <i className="fa-solid fa-plus me-2"></i> Yangi blok qo'shing
                </button>
                <ul className="dropdown-menu shadow-lg border-0 mb-2">
                  <li><button className="dropdown-item py-2" onClick={() => handleAddBlock('select')}>Bir necha variantli so'rovnoma</button></li>
                  <li><button className="dropdown-item py-2" onClick={() => handleAddBlock('short')}>Qisqa izoh</button></li>
                  <li><button className="dropdown-item py-2" onClick={() => handleAddBlock('long')}>Uzoq izoh</button></li>
                </ul>
              </div>
            </div>

            {/* O'NG TOMON: Preview (Ko'rinishi) */}
            <div className="col-7 p-4 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="d-flex justify-content-between mb-3">
                <button className="btn btn-outline-secondary px-4 fw-medium" style={{ borderRadius: '20px' }} onClick={() => setView('list')}>Orqaga</button>
                <button className="btn text-white px-4 fw-medium d-flex align-items-center gap-2" style={{ backgroundColor: '#f48c06', borderRadius: '20px' }} onClick={handleSave} disabled={isSaving}>
                  {isSaving && <span className="spinner-border spinner-border-sm"></span>}
                  {editingFormId ? 'O\'zgarishlarni saqlash' : 'Saqlash'}
                </button>
              </div>

              {/* PREVIEW KARTASI */}
              <div className="bg-white rounded shadow-sm overflow-hidden border" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="p-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: formData.coverColor, height: '120px' }}>
                   <h2 className="text-warning fw-bold m-0" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>MODME</h2>
                </div>
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0 fw-bold text-dark">{formData.title || "Forma nomi"}</h5>
                    <img src="https://modme.uz/images/logo.png" alt="logo" height="30" onError={(e) => e.target.style.display='none'} />
                  </div>
                  {fields.map(field => (
                    <div key={field.id} className="mb-4">
                      <label className="form-label text-muted small mb-1">{field.label} {field.required && <span className="text-danger">*</span>}</label>
                      {field.type === 'select' ? (
                        <select className="form-select border-light-subtle shadow-none"><option>Tanlang</option></select>
                      ) : (
                        <input type="text" className="form-control border-light-subtle shadow-none" placeholder={field.type === 'phone' ? "+998" : ""} />
                      )}
                    </div>
                  ))}
                  <button className="btn text-white px-4 py-2 mt-2" style={{ backgroundColor: '#f4a261', borderRadius: '20px' }}>Yuborish</button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadFormBuilderModal;