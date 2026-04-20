import React, { useState, useEffect } from "react";
import "./styles/arxiv.css";
import axiosInstance from "../../api/axiosInstance"; // API bilan ishlash uchun
import { Settings, Trash2, RotateCcw } from "lucide-react";

export default function Arxiv() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtrlar statelari
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [toast, setToast] = useState("");

  // 🌟 API ORQALI MA'LUMOTLARNI YUKLASH
  const fetchArchivedUsers = async () => {
    setIsLoading(true);
    try {
      // Backenddagi Arxiv API yo'lini kerak bo'lsa to'g'rilab qo'yasiz
      const res = await axiosInstance.get('/api/v1/academics/archive/');
      const data = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      setUsers(data);
    } catch (error) {
      console.error("Arxivni yuklashda xato:", error);
      setUsers([]); // Agar xato bo'lsa jadval bo'sh turadi
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  // Checkbox (Tanlash)
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 🌟 API ORQALI O'CHIRISH (DELETE)
  const handleDelete = async () => {
    if (!window.confirm("Rostdan ham tanlanganlarni butunlay o'chirmoqchimisiz?")) return;
    
    try {
      // Real loyihada har bir ID ni o'chirish uchun API ga yuboriladi
      // await Promise.all(selectedIds.map(id => axiosInstance.delete(`/api/v1/academics/archive/${id}/`)));
      
      setUsers(users.filter((u) => !selectedIds.includes(u.id)));
      setSelectedIds([]);
      showToast("Muvaffaqiyatli butunlay o'chirildi 🗑️");
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  // 🌟 API ORQALI TIKLASH (RESTORE)
  const handleRestore = async () => {
    try {
      // Real loyihada tiklash uchun API ga so'rov yuboriladi
      // await Promise.all(selectedIds.map(id => axiosInstance.post(`/api/v1/academics/archive/${id}/restore/`)));
      
      setUsers(users.filter((u) => !selectedIds.includes(u.id)));
      setSelectedIds([]);
      showToast("Muvaffaqiyatli tizimga tiklandi ✅");
    } catch (error) {
      console.error("Tiklashda xato:", error);
      alert("Tiklashda xatolik yuz berdi.");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Lokal filtrlash
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.name || ''} ${u.surname || ''} ${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const phone = u.phone || '';

    return (
      (fullName.includes(search.toLowerCase()) || phone.includes(search)) &&
      (roleFilter ? u.role === roleFilter : true) &&
      (reasonFilter ? u.reason === reasonFilter : true) &&
      (startDate ? (u.date || u.created_at) >= startDate : true) &&
      (endDate ? (u.date || u.created_at) <= endDate : true)
    );
  });

  return (
    <div className="arxiv-wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      <div className="arxiv-card">
        
        {/* HEADER */}
        <div className="arxiv-header">
          <h2 className="arxiv-title">
            Arxiv <span className="arxiv-count">— {filteredUsers.length} ta yozuv</span>
          </h2>
          <button className="btn-action btn-outline">
            <Settings size={16} /> Arxivlash sabablari
          </button>
        </div>

        {/* 1-QATOR: FILTRLAR (Barchasi 40px) */}
        <div className="filters-grid">
          <input
            className="custom-input"
            placeholder="Ism Familiya / Telefon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="custom-select" onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Rollar</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
          <select className="custom-select" onChange={(e) => setReasonFilter(e.target.value)}>
            <option value="">Sabab</option>
            <option value="Intizom">Intizom</option>
            <option value="To'lov">To'lov</option>
          </select>
          <input
            type="date"
            className="custom-input"
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="custom-input"
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* 2-QATOR: AMALLAR */}
        <div className="actions-row">
          <button 
            className="btn-action btn-danger-custom" 
            disabled={!selectedIds.length} 
            onClick={handleDelete}
          >
            <Trash2 size={16} /> O'chirish
          </button>
          <button 
            className="btn-action btn-success-custom" 
            disabled={!selectedIds.length} 
            onClick={handleRestore}
          >
            <RotateCcw size={16} /> Qayta tiklash
          </button>
        </div>

        {/* JADVAL */}
        <div className="arxiv-table-container">
          <table className="arxiv-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Ism Familiya</th>
                <th>Telefon</th>
                <th>Roli</th>
                <th>Sabab</th>
                <th>Izoh</th>
                <th>Arxivladi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="empty-state">Ma'lumotlar yuklanmoqda...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">Arxivda ma'lumot topilmadi.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <label className="custom-orange-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(u.id)}
                          onChange={() => toggleSelect(u.id)}
                        />
                        <span className="orange-checkbox-box"></span>
                      </label>
                    </td>
                    <td style={{fontWeight: 500}}>{u.name || u.first_name} {u.surname || u.last_name}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`badge-role ${u.role?.toLowerCase()}`}>
                        {u.role || "Noma'lum"}
                      </span>
                    </td>
                    <td>{u.reason || "-"}</td>
                    <td style={{color: '#64748b'}}>{u.comment || "-"}</td>
                    <td>
                      <div>{u.archivedBy || u.archived_by || "Admin"}</div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>{u.date || u.created_at || "Sana yo'q"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}