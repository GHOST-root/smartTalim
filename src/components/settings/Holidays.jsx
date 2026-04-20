import React, { useState, useMemo } from "react";
import "./styles/holidays.css"; // CSS yo'lini o'zingizga moslang
import { Plus, Pencil, Trash2, X, AlertCircle, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

// ==========================================
// 🌟 1. ALOHIDA MODAL KOMPONENTI (Toza va ixcham)
// ==========================================
const HolidayModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState(
    initialData || { name: "", startDate: "", endDate: "", studentImpact: false, staffImpact: false }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? "active" : ""}`} onClick={onClose}>
      <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h5>{initialData ? "Dam olish kunini tahrirlash" : "Dam olish kunini qo‘shish"}</h5>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nomi</label>
              <input type="text" name="name" className="custom-input" placeholder="Masalan: Navro‘z" value={form.name} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Boshlanish sanasi</label>
              <input type="date" name="startDate" className="custom-input" value={form.startDate} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Tugash sanasi (ixtiyoriy)</label>
              <input type="date" name="endDate" className="custom-input" value={form.endDate} onChange={handleChange} />
            </div>

            <label className="custom-orange-checkbox mt-3">
              <input type="checkbox" name="studentImpact" checked={form.studentImpact} onChange={handleChange} />
              <span className="orange-checkbox-box"></span>
              <span className="checkbox-label">Talabalar to‘loviga ta’sir qiladi</span>
            </label>

            <label className="custom-orange-checkbox">
              <input type="checkbox" name="staffImpact" checked={form.staffImpact} onChange={handleChange} />
              <span className="orange-checkbox-box"></span>
              <span className="checkbox-label">Xodimlar ish haqiga ta’sir qiladi</span>
            </label>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>Bekor qilish</button>
              <button type="submit" className="save-btn">Saqlash</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};


// ==========================================
// 🌟 2. ASOSIY SAHIFA KOMPONENTI
// ==========================================
export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, data: null, index: null });
  
  // Saralash (Sort) holati
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 🔽 JADVALNI SARALASH (Ism yoki Sana bo'yicha)
  const sortedHolidays = useMemo(() => {
    let sortableItems = [...holidays];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [holidays, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Saralash ikonkasini ko'rsatish funksiyasi
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <ChevronsUpDown size={14} className="sort-icon" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="sort-icon" /> : <ChevronDown size={14} className="sort-icon" />;
  };

  // 🔽 TUGMA FUNKSIYALARI
  const handleOpenModal = (data = null, index = null) => {
    setModalState({ isOpen: true, data, index });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, data: null, index: null });
  };

  const handleSave = (formData) => {
    if (modalState.index !== null) {
      // Tahrirlash
      const updatedHolidays = [...holidays];
      updatedHolidays[modalState.index] = formData;
      setHolidays(updatedHolidays);
    } else {
      // Yangi qo'shish
      setHolidays([...holidays, formData]);
    }
    handleCloseModal();
  };

  const handleDelete = (index) => {
    if (window.confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
      setHolidays(holidays.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="holidays-wrapper">
      <div className="holidays-header">
        <h2 className="holidays-title">Dam olish kunlari</h2>
        <button className="premium-add-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Yangisini qo‘shish
        </button>
      </div>

      <p className="info-text">
        <AlertCircle size={16} /> Tahrirlash, qo'shish va o'chirish funksiyalari (demo rejimida) ishlayapti.
      </p>

      {/* 🌟 MAXSUS JADVAL */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {/* Sarlavhaga bosganda saralaydi */}
              <th className={`sortable-th ${sortConfig.key === 'name' ? 'active' : ''}`} onClick={() => requestSort('name')}>
                Ism {getSortIcon('name')}
              </th>
              <th className={`sortable-th ${sortConfig.key === 'startDate' ? 'active' : ''}`} onClick={() => requestSort('startDate')}>
                Sanasi {getSortIcon('startDate')}
              </th>
              <th>To‘lovga ta’siri</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {sortedHolidays.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">Hozircha dam olish kunlari yo‘q</td>
              </tr>
            ) : (
              sortedHolidays.map((h, index) => (
                <tr key={index}>
                  <td style={{fontWeight: 500}}>{h.name}</td>
                  <td>
                    {h.startDate} {h.endDate && h.endDate !== h.startDate ? ` gacha ${h.endDate}` : ""}
                  </td>
                  <td>
                    {h.studentImpact && <span className="badge-text me-2">🎓 Talabalar</span>}
                    {h.staffImpact && <span className="badge-text">👔 Xodimlar</span>}
                    {!h.studentImpact && !h.staffImpact && <span style={{color: '#94a3b8'}}>-</span>}
                  </td>
                  <td>
                    <button className="action-icon-btn edit" onClick={() => handleOpenModal(h, index)}>
                      <Pencil size={16} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(index)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 AJRATILGAN MODAL CHAQIRILISHI */}
      <HolidayModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={modalState.data}
      />
    </div>
  );
}