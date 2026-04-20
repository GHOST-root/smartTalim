import React, { useState } from 'react';
import { leadsApi } from '../../api/leadsApi';

function SourceManagerModal({ isOpen, onClose, sources, setSources }) {
  const [newSourceName, setNewSourceName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🔥 YANGI STATELAR (Tahrirlash uchun)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newSourceName.trim()) return;
    try {
      setLoading(true);
      const payload = { 
        name: newSourceName,
        branch_id: 1 
      };
      const newSource = await leadsApi.createSource(payload); 
      setSources([...sources, newSource]);
      setNewSourceName("");
    } catch (error) {
      console.error("Manba yaratishda xatolik:", error);
      alert("Xatolik! Manba saqlanmadi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu manbani o'chirib tashlaysizmi?")) {
      try {
        await leadsApi.deleteSource(id);
        setSources(sources.filter(s => s.id !== id));
      } catch (error) {
        console.error("Manba o'chirishda xatolik:", error);
        alert("O'chirishda muammo yuz berdi.");
      }
    }
  };

  // 🔥 YANGI FUNKSIYALAR (Tahrirlash uchun)
  const startEdit = (source) => {
    setEditingId(source.id);
    setEditName(source.name || source.title);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    
    try {
      // Backend aynan nimani kutyapti (title yoki name), shunga moslaysiz
      // Hozir yaratishda 'name' jo'natganmiz, shuning uchun 'name' jo'natamiz
      const updatedSource = await leadsApi.updateSource(id, { name: editName });
      
      // UI ni yangilaymiz
      setSources(sources.map(s => s.id === id ? { ...s, name: editName, title: editName } : s));
      setEditingId(null);
    } catch (error) {
      console.error("Manba tahrirlashda xatolik:", error);
      alert("Xatolik! Manba nomi o'zgarmadi.");
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '22px', color: '#333', fontWeight: 'bold' }}>Mijoz manbasi</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', height: "40px", marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Manba nomini kiriting..." 
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            style={{ flexGrow: 1, padding: '12px 16px', fontSize: '15px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' }}
          />
          <button 
            onClick={handleAdd}
            disabled={loading}
            style={{ padding: '9px 24px', backgroundColor: '#8BC34A', color: 'white', fontSize: '15px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saqlanmoqda..." : "Qo'shish"}
          </button>
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '12px 16px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>
            <span>Nomi</span>
            <span>Harakatlar</span>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {sources.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Hali manbalar yo'q</div>
            ) : (
              sources.map((source) => (
                <div key={source.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '12px 16px', borderBottom: '1px solid #f1f1f1', alignItems: 'center' }}>
                  
                  {/* 🔥 TAHRIRLASH REJIMI YOTIG'I BILAN O'ZGARTIRILDI */}
                  {editingId === source.id ? (
                    <div style={{ display: 'flex', gap: '8px', paddingRight: '15px' }}>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        style={{ padding: '4px 8px', border: '1px solid #0d6efd', borderRadius: '4px', flexGrow: 1 }}
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(source.id)} style={{ padding: '4px 10px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '15px', color: '#333' }}>{source.name || source.title}</span>
                  )}

                  {/* Agar tahrirlash rejimida bo'lmasa, tugmalar ko'rinadi */}
                  {editingId !== source.id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => startEdit(source)} 
                        style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#f0f0f0', color: '#555', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ✎ Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDelete(source.id)}
                        style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#fee', color: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑 O'chirish
                      </button>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourceManagerModal;