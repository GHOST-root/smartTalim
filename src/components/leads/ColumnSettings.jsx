import React, { useState, useRef } from 'react';
import { leadsApi } from '../../api/leadsApi';

function ColumnSettings({ columns, setColumns, onClose, leads }) {
  // 🔥 DIQQAT: newColName state'ini O'CHIRIB TASHALADIK va useRef qo'shdik!
  const inputRef = useRef(null); 
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // Yangi ustun qo'shish funksiyasini API ga ulaymiz
  const handleAdd = async () => {
    // 🔥 Qiymatni endi inputning o'zidan olamiz
    const val = inputRef.current?.value; 
    
    if (!val || !val.trim()) return;
    
    try {
      // Backend aynan nima kutayotgan bo'lsa, xuddi shunday qilib yuboramiz:
      const payload = {
        name: val,
        position: columns.length + 1,
        branch_id: 1,       // Masalan: 3
      };

      const createdCol = await leadsApi.createColumn(payload); 
      
      // Backend bizga "name" qaytaradi, bizning UI esa "title" ga o'rganib qolgan.
      // Shuning uchun UI ga qo'shayotganda name ni title ga o'zlashtirib qo'yamiz:
      setColumns([...columns, { ...createdCol, title: createdCol.name }]);
      
      // 🔥 Muvaffaqiyatli qo'shilgandan keyin input ichini tozalab qo'yamiz
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error("Ustun yaratishda xatolik:", error);
      alert("Ustun saqlanmadi. API xatosi.");
    }
  };

  // Ustunni o'chirish (API ga ulandi)
  const handleDelete = async (colId, isStandard) => {
    if (isStandard) {
      alert("Standard ustunlarni o'chirib bo'lmaydi!");
      return;
    }
    const hasLeads = leads.some(l => l.columnId === colId);
    if (hasLeads) {
      alert("Avval ustundagi lidlarni boshqa ustunga ko'chiring!");
      return;
    }

    if (window.confirm("Rostdan ham bu ustunni butunlay o'chirib tashlamoqchimisiz?")) {
      try {
        if (leadsApi.deleteColumn) {
          await leadsApi.deleteColumn(colId);
        } else if (leadsApi.deletePipeline) {
          await leadsApi.deletePipeline(colId);
        }
        
        // Muvaffaqiyatli o'chsa, ekrandan ham olib tashlaymiz
        setColumns(columns.filter(c => c.id !== colId));
      } catch (error) {
        // 🔥 FIX: Agar 404 xato chiqsa (ya'ni bazada topilmasa), ekrandan baribir o'chirib tashlaymiz
        if (error.response && error.response.status === 404) {
             console.warn("Bu ustun backendda topilmadi, faqat ekrandan o'chirildi.");
             setColumns(columns.filter(c => c.id !== colId));
        } else {
             console.error("Ustunni o'chirishda xatolik:", error);
             alert("Xatolik! Ustun bazadan o'chirilmadi.");
        }
      }
    }
  };

  // Ustunni tahrirlashni boshlash
  const startEdit = (col) => {
    setEditingId(col.id);
    setEditName(col.title);
  };

  // Tahrirni saqlash
  const saveEdit = (id) => {
    setColumns(columns.map(c => c.id === id ? { ...c, title: editName } : c));
    setEditingId(null);
  };

  // Ustunni o'ngga/chapga surish va BAZAGA SAQLASH
  const moveColumn = async (index, direction) => {
    const newCols = [...columns];
    if (direction === 'left' && index > 0) {
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
    } else if (direction === 'right' && index < newCols.length - 1) {
      [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
    }
    
    // 1. Ekranda darhol suramiz (tezkor ishlashi uchun)
    setColumns(newCols);

    // 2. Orqafonda API ga o'zgarishni yuboramiz
    try {
      // Barcha ustunlarning yangi pozitsiyasini saqlash uchun aylanib chiqamiz
      // (Backend qabul qilishi uchun leadsApi da updateColumn funksiyasi bo'lishi kerak)
      await Promise.all(
        newCols.map((col, idx) => 
          leadsApi.updateColumn(col.id, { position: idx + 1 })
        )
      );
    } catch (error) {
      console.error("Ustun joylashuvini saqlashda xatolik:", error);
    }
  };

  return (
    <>
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,0.3)", zIndex: 1049 }} onClick={onClose} />
      <div className="position-fixed top-0 end-0 bg-white h-100 shadow d-flex flex-column" 
            style={{ width: '400px', zIndex: 1050, animation: "slideInRight .25s ease-out" }}
            onClick={(e) => e.stopPropagation()} 
        >
        
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="m-0 fw-bold">Ustun sozlamalari</h5>
          <button className="btn btn-sm btn-light" onClick={onClose}>✕</button>
        </div>

        <div className="p-3 flex-grow-1 overflow-auto">
          {/* Yangi ustun qo'shish */}
          <div className="bg-light p-3 rounded mb-4 border" style={{ position: 'relative', zIndex: 9999 }}>
            <label className="form-label small fw-semibold text-muted">Yangi ustun qo'shish</label>
            <div className="input-group d-flex"> {/* 🔥 d-flex qo'shildi */}
              <input 
                type="text" 
                className="form-control flex-grow-1" /* 🔥 flex-grow-1 bo'sh joyni egallashga majbur qiladi */
                style={{ minWidth: '150px' }} /* 🔥 Kichrayib ketishining oldini oluvchi mustahkam himoya */
                placeholder="Ustun nomi..." 
                ref={inputRef} 
                autoFocus 
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd(); // O'zingizdagi qo'shish funksiyasi nomini yozing
                }
              }}
              />
              <button className="btn btn-primary flex-shrink-0" onClick={handleAdd} style={{ zIndex: 10000 }}>Qo'shish</button>
            </div>
          </div>

          {/* Mavjud ustunlar ro'yxati */}
          <h6 className="fw-bold mb-3">Mavjud ustunlar ({columns.length})</h6>
          {columns.map((col, index) => (
            <div key={col.id} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-white border rounded shadow-sm">
              
              {editingId === col.id ? (
                <div className="d-flex gap-2 w-100">
                  <input type="text" className="form-control form-control-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <button className="btn btn-sm btn-success" onClick={() => saveEdit(col.id)}>✓</button>
                </div>
              ) : (
                <>
                  <div className="fw-medium text-dark d-flex align-items-center gap-2">
                    {col.title} {col.isStandard && <span className="badge bg-secondary" style={{fontSize: '10px'}}>Standard</span>}
                  </div>
                  
                  <div className="d-flex gap-1 align-items-center">
                    <button className="btn btn-sm btn-light border p-1 px-2" onClick={() => moveColumn(index, 'left')} disabled={index === 0}>◀</button>
                    <button className="btn btn-sm btn-light border p-1 px-2" onClick={() => moveColumn(index, 'right')} disabled={index === columns.length - 1}>▶</button>
                    <button className="btn btn-sm btn-light border p-1 px-2 text-primary" onClick={() => startEdit(col)}><i className="fa-solid fa-pen"></i></button>
                    <button className="btn btn-sm btn-light border p-1 px-2 text-danger" onClick={() => handleDelete(col.id, col.isStandard)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ColumnSettings;