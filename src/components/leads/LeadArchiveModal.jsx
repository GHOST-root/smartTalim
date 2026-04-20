import React, { useState } from "react";

function LeadArchiveModal({ isOpen, onClose, archivedLeads, setArchivedLeads, onRestore }) {
  // Sabablarni obyekt ko'rinishida saqlaymiz (Tizim sabablarini farqlash uchun)
  const [reasons, setReasons] = useState([])
  
  const [isManagingReasons, setIsManagingReasons] = useState(false);
  const [newReason, setNewReason] = useState("");

  if (!isOpen) return null;

  // Sabab qo'shish
  const handleAddReason = () => {
    if(!newReason.trim()) return;
    const updated = [...reasons, { id: Date.now(), text: newReason, isSystem: false }];
    setReasons(updated);
    localStorage.setItem("archive-reasons-v2", JSON.stringify(updated));
    setNewReason("");
  };

  // Sababni o'chirish
  const handleDeleteReason = (id) => {
    const updated = reasons.filter(r => r.id !== id);
    setReasons(updated);
    localStorage.setItem("archive-reasons-v2", JSON.stringify(updated));
  };

  const handleHardDelete = (id) => {
    if(window.confirm("Bu lidni butunlay o'chirib yuborasizmi? (Qayta tiklab bo'lmaydi)")) {
      setArchivedLeads(archivedLeads.filter(l => l.id !== id));
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
      <div className="bg-white rounded shadow-lg d-flex flex-column" style={{ width: '900px', height: '85vh', animation: 'fadeIn 0.2s' }}>
        
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light rounded-top">
          <h5 className="m-0 fw-bold text-dark"><i className="fa-solid fa-box-archive text-secondary me-2"></i> Lidlar Arxivi</h5>
          <button className="btn btn-sm btn-light border-0 fs-5" onClick={onClose}>✕</button>
        </div>

        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
          <div className="d-flex gap-2">
            <input type="text" className="form-control form-control-sm" placeholder="Ism orqali qidirish..." style={{width: '250px'}} />
          </div>
          
          <button 
            className={`btn btn-sm ${isManagingReasons ? 'btn-primary' : 'btn-outline-secondary'}`} 
            onClick={() => setIsManagingReasons(!isManagingReasons)}
          >
            <i className="fa-solid fa-list-check me-2"></i> Sabablarni boshqarish
          </button>
        </div>

        {/* SABABLARNI BOSHQARISH PANELLARI */}
        {isManagingReasons && (
          <div className="p-3 bg-light border-bottom d-flex gap-2" style={{ maxHeight: '200px' }}>

            <div className="flex-shrink-0" style={{ width: '300px' }}>
              <label className="form-label small fw-medium">Yangi sabab qo'shish</label>
              <div className="input-group input-group-sm">
                <input type="text" className="form-control" placeholder="Masalan: Uzoq ekan" value={newReason} onChange={e => setNewReason(e.target.value)} />
                <button className="btn btn-success" onClick={handleAddReason}>Qo'shish</button>
              </div>
            </div>
            
            <div className="flex-grow-1 d-flex flex-wrap gap-2">
              {reasons.map(reason => (
                <span key={reason.id} className="badge align-self-start bg-white text-dark border p-2 d-flex align-items-center gap-2 shadow-sm">
                  {reason.text}
                  {reason.isSystem ? (
                    <i className="fa-solid fa-lock text-muted ms-1" title="Tizim sababi (O'chirib bo'lmaydi)"></i>
                  ) : (
                    <i className="fa-solid fa-xmark text-danger cursor-pointer ms-1" title="O'chirish" onClick={() => handleDeleteReason(reason.id)} style={{cursor: 'pointer'}}></i>
                  )}
                </span>
              ))}
            </div>

          </div>
        )}

        <div className="p-0 flex-grow-1 overflow-auto">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small sticky-top">
              <tr>
                <th className="ps-4">Ism va Telefon</th>
                <th>O'chirilgan sana</th>
                <th>O'chirish sababi</th>
                <th>Xodim</th>
                <th className="text-end pe-4">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {archivedLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="ps-4">
                    <div className="fw-medium text-dark">{lead.title}</div>
                    <div className="text-muted small">{lead.phone}</div>
                  </td>
                  <td className="text-muted small">{lead.archiveDate || "Noma'lum"}</td>
                  <td><span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle">{lead.archiveReason || "Sabab ko'rsatilmagan"}</span></td>
                  <td className="text-muted small">{lead.archivedBy || "Tizim"}</td>
                  <td className="text-end pe-4">
                    <button className="btn btn-sm btn-light border me-2 text-success" title="Tiklash" onClick={() => onRestore(lead)}><i className="fa-solid fa-rotate-left"></i></button>
                    <button className="btn btn-sm btn-light border text-danger" title="Butunlay o'chirish" onClick={() => handleHardDelete(lead.id)}><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {archivedLeads.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">Arxiv bo'sh</td></tr>}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default LeadArchiveModal;