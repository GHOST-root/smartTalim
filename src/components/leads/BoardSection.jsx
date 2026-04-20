import React, { useState } from "react";
import LeadCard from "./LeadCard";

function BoardSection({ 
  section, 
  cards, 
  onDragStart, 
  onDropCard, 
  onEditSection, 
  onDeleteSection,
  onSmsSection,
  onEditLead,
  onDeleteLead
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEditSection(section.id, editTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-3 bg-white border rounded shadow-sm">
      
      {/* SECTION HEADER */}
      <div 
        className="p-2 border-bottom"
        style={{ backgroundColor: '#fdfdfd' }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
            {isEditing ? (
              /* FIX: Input o'lchami cheklandi, devordan chiqmaydi */
              <div className="d-flex gap-1 w-100 me-2 align-items-center">
                <input 
                  type="text" 
                  className="form-control form-control-sm flex-grow-1 min-w-0" 
                  style={{ minWidth: '50px' }} /* Kichik ekranlarda ham ezilib qolmasligi uchun */
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  autoFocus
                />
                <button className="btn btn-sm btn-success py-0 px-2 flex-shrink-0" onClick={handleSaveEdit}>✓</button>
                <button className="btn btn-sm btn-light py-0 px-2 border flex-shrink-0" onClick={() => setIsEditing(false)}>✕</button>
              </div>
            ) : (
              <>
                <span className="fw-semibold text-dark" style={{ fontSize: '14px' }}>{section.title}</span>
                {/* Agar Nabor bo'lsa maksimal sig'imni, bo'lmasa oddiy sonni ko'rsatamiz */}
                <span className="badge bg-light text-dark border">
                  {cards.length} {section.maxCapacity ? `/ ${section.maxCapacity}` : ''}
                </span>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="d-flex align-items-center gap-1">
              <div className="dropdown">
                <button className="btn btn-sm btn-light border-0 p-0 text-muted ms-1" data-bs-toggle="dropdown" data-bs-boundary="window" onClick={(e) => e.stopPropagation()}>
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-1" style={{ fontSize: '14px' }}>
                  <li><button className="dropdown-item" onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen text-muted me-2"></i> Tahrirlash</button></li>
                  <li><button className="dropdown-item" onClick={() => onSmsSection(section)}><i className="fa-solid fa-comment-sms text-primary me-2"></i> SMS yuborish</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={() => onDeleteSection(section.id)}><i className="fa-solid fa-trash text-danger me-2"></i> O'chirish</button></li>
                </ul>
              </div>
              <button className="btn btn-sm btn-light border-0 px-2 text-muted" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <i className="fa-solid fa-lock text-muted"></i> : <i className="fa-solid fa-unlock text-muted"></i>}
              </button>
            </div>
          )}
        </div>

        {/* AGAR SECTION NABOR (GURUH) BO'LSA QO'SHIMCHA MA'LUMOTLAR CHIQADI */}
        {!isEditing && section.teacher && (
          <div className="d-flex flex-wrap gap-3 mt-2 text-muted px-1" style={{ fontSize: '11px' }}>
            <span title="O'qituvchi"><i className="fa-solid fa-chalkboard-user text-primary opacity-75"></i> {section.teacher}</span>
            <span title="Dars kunlari"><i className="fa-regular fa-calendar text-warning opacity-75"></i> {section.days}</span>
            <span title="Dars vaqti"><i className="fa-regular fa-clock text-success opacity-75"></i> {section.time}</span>
          </div>
        )}
      </div>

      {/* SECTION BODY (Cards & Drag-Drop Zone) */}
      {!isCollapsed && (
        <div 
          className="p-2" 
          style={{ minHeight: '60px', backgroundColor: '#f8f9fa' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropCard(section.id)}
        >
          {cards.length === 0 ? (
            <div className="text-center text-muted small py-2" style={{ borderStyle: 'dashed', borderWidth: '1px', borderColor: '#dee2e6', borderRadius: '4px' }}>
              Bo'sh bo'lim
            </div>
          ) : (
            cards.map((card) => (
              <LeadCard key={card.id} card={card} onDragStart={() => onDragStart(card, section.id)} onDelete={onDeleteLead} onEdit={onEditLead} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BoardSection;