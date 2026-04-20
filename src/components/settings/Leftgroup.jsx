import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../api/settingsApi'; 
import { Plus, Pencil, Trash2, X, UserMinus, Search } from 'lucide-react';
import './styles/leftgroup.css'; 

export default function Leftgroup() {
  const [leaves, setLeaves] = useState([]);
  const [reasons, setReasons] = useState([]); // Sabablar ro'yxati API dan
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal / Panel statelari
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtr statelari
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form statelari
  const [formData, setFormData] = useState({
    student_id: '',
    group_id: '',
    leave_reason_id: '', // Endi qo'lda emas, tanlanadi
    comment: ''
  });

  // 1. Ma'lumotlarni yuklash (Tarix + Sabablar)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [leavesRes, reasonsRes] = await Promise.all([
        settingsApi.studentGroupLeaves.getAll().catch(() => []),
        settingsApi.leaveReasons?.getAll().catch(() => []) // Sabablarni tortamiz
      ]);

      const leavesData = Array.isArray(leavesRes?.results) ? leavesRes.results : (Array.isArray(leavesRes) ? leavesRes : []);
      const reasonsData = Array.isArray(reasonsRes?.results) ? reasonsRes.results : (Array.isArray(reasonsRes) ? reasonsRes : []);

      setLeaves(leavesData);
      setReasons(reasonsData);
    } catch (error) {
      console.error("Yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Filtr mantiqi
  const filteredLeaves = leaves.filter((item) => {
    // Backend qanday formatda ism qaytarishiga qarab to'g'irlaymiz
    const studentName = (item.student?.full_name || item.student?.first_name || item.student_name || item.student || "").toLowerCase();
    const reasonId = item.leave_reason?.id || item.leave_reason || "";
    const date = item.created_at ? item.created_at.split('T')[0] : "";

    return (
      (studentName.includes(search.toLowerCase())) &&
      (reasonFilter ? reasonId.toString() === reasonFilter.toString() : true) &&
      (startDate ? date >= startDate : true) &&
      (endDate ? date <= endDate : true)
    );
  });

  // 3. Panelni ochish
  const openPanel = (mode, item = null) => {
    setPanelMode(mode);
    setSelectedItem(item);
    if (mode === 'edit' && item) {
      setFormData({
        student_id: item.student?.id || item.student || '',
        group_id: item.group?.id || item.group || '',
        leave_reason_id: item.leave_reason?.id || item.leave_reason || '',
        comment: item.comment || ''
      });
    } else {
      setFormData({ student_id: '', group_id: '', leave_reason_id: '', comment: '' });
    }
    setShowPanel(true);
  };

  // 4. Saqlash (API POST/PUT)
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // UUID bo'lishi mumkinligi sababli, agar bo'sh bo'lmasa API ga jo'natamiz
    const payload = {
      ...formData,
      organization_id: localStorage.getItem('org_id'),
      branch_id: 1
    };

    try {
      if (panelMode === 'add') {
        await settingsApi.studentGroupLeaves.create(payload);
      } else {
        await settingsApi.studentGroupLeaves.update(selectedItem.id || selectedItem.uuid, payload);
      }
      setShowPanel(false);
      fetchData(); // Jadvalni yangilash
    } catch (error) {
      console.error(error);
      alert("Xatolik! Barcha majburiy maydonlar to'g'ri ekanligini tekshiring.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. O'chirish (API DELETE)
  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await settingsApi.studentGroupLeaves.delete(selectedItem.id || selectedItem.uuid);
      setShowPanel(false);
      fetchData();
    } catch (error) {
      alert("O'chirishda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="leftgroup-wrapper">
      <div className="leftgroup-card">
        
        {/* HEADER */}
        <div className="leftgroup-header">
          <h2 className="leftgroup-title">
            <UserMinus size={24} className="text-danger" /> 
            Guruhdan ketganlar <span className="leftgroup-count">— {filteredLeaves.length} ta yozuv</span>
          </h2>
          <button className="btn-orange" onClick={() => openPanel('add')}>
            <Plus size={18} /> Yangi xolat
          </button>
        </div>

        {/* FILTRLAR (Qat'iy 40px inputlar) */}
        <div className="filters-grid">
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              className="custom-input"
              placeholder="O'quvchi ismi bo'yicha qidiruv..."
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="custom-select" 
            value={reasonFilter} 
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="">Barcha sabablar</option>
            {reasons.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          
          <input
            type="date"
            className="custom-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="custom-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* JADVAL */}
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>№</th>
                <th>O'quvchi</th>
                <th>Guruh</th>
                <th>Sabab</th>
                <th>Sana</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="empty-state">Ma'lumotlar yuklanmoqda...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">Ushbu filtrlar bo'yicha ma'lumot topilmadi.</td>
                </tr>
              ) : (
                filteredLeaves.map((item, index) => {
                  const studentName = item.student?.full_name || item.student?.first_name || item.student_name || item.student || "Noma'lum o'quvchi";
                  const groupName = item.group?.name || item.group_name || item.group || "Guruh kiritilmagan";
                  const reasonName = item.leave_reason?.name || item.leave_reason_name || reasons.find(r => r.id === item.leave_reason)?.name || "Sabab kiritilmagan";

                  return (
                    <tr key={item.id || item.uuid || index}>
                      <td style={{ color: '#64748b' }}>{index + 1}</td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>{studentName}</td>
                      <td><span className="group-badge">{groupName}</span></td>
                      <td><span className="reason-badge">{reasonName}</span></td>
                      <td style={{ color: '#64748b' }}>{item.created_at ? item.created_at.split('T')[0] : "-"}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="action-icon-btn edit" onClick={() => openPanel('edit', item)} title="Tahrirlash">
                          <Pencil size={16} />
                        </button>
                        <button className="action-icon-btn delete" onClick={() => openPanel('delete', item)} title="O'chirish">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* YON PANEL (MODAL) */}
      <div className={`side-panel-overlay ${showPanel ? 'active' : ''}`} onClick={() => !isSaving && setShowPanel(false)}></div>
      
      <div className={`side-panel ${showPanel ? 'show' : ''}`}>
        <div className="panel-header">
          <h5>
            {panelMode === 'add' ? "Yangi xolat qo'shish" : panelMode === 'edit' ? "Xolatni tahrirlash" : "Xolatni o'chirish"}
          </h5>
          <button className="close-btn" onClick={() => setShowPanel(false)} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          {panelMode === 'delete' ? (
            <div>
              <div className="reason-badge mb-3" style={{ display: 'inline-block' }}>Diqqat: Amalni ortga qaytarib bo'lmaydi</div>
              <p style={{ color: '#334155', lineHeight: '1.5' }}>Haqiqatan ham ushbu ma'lumotni tizimdan butunlay o'chirib tashlamoqchimisiz?</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="custom-input" style={{ width: '50%', backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setShowPanel(false)}>
                  Bekor qilish
                </button>
                <button type="button" className="btn-orange" style={{ width: '50%', justifyContent: 'center', backgroundColor: '#ef4444' }} onClick={handleDelete} disabled={isSaving}>
                  {isSaving ? "Kuting..." : "Ha, o'chirish"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              <div style={{ flexGrow: 1 }}>
                <div className="form-group">
                  <label>O'quvchi ID</label>
                  <input type="text" className="custom-input" required 
                    value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} 
                    placeholder="O'quvchi identifikatori (ID)" />
                </div>
                
                <div className="form-group">
                  <label>Guruh ID</label>
                  <input type="text" className="custom-input" required 
                    value={formData.group_id} onChange={(e) => setFormData({...formData, group_id: e.target.value})} 
                    placeholder="Guruh identifikatori (ID)" />
                </div>
                
                {/* 🌟 YANGILIK: Sababni ID yozmasdan, ro'yxatdan tanlash */}
                <div className="form-group">
                  <label>Chiqib ketish sababi</label>
                  <select className="custom-select" required
                    value={formData.leave_reason_id} onChange={(e) => setFormData({...formData, leave_reason_id: e.target.value})}
                  >
                    <option value="">Sababni tanlang...</option>
                    {reasons.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Qo'shimcha izoh</label>
                  <textarea className="custom-input" style={{ height: '80px', paddingTop: '10px', resize: 'none' }}
                    value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} 
                    placeholder="Nimadir yozib qoldiring..."></textarea>
                </div>
              </div>

              <button type="submit" className="btn-orange" style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }} disabled={isSaving}>
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}