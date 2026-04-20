import React from "react";

function LeadCard({ card, onDragStart, onDelete, onEdit }) {
  
  // Ismdan bosh harflarni olish (Masalan: Bekzod Saydaliyev -> BS)
  const getInitials = (name) => {
    if (!name) return "L";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className="card mb-2 shadow-sm position-relative border-0"
      draggable
      onDragStart={onDragStart}
      onDoubleClick={() => onEdit(card)} // <--- MANA SHU QATOR QO'SHILDI
      style={{ cursor: "grab", backgroundColor: '#fff', borderRadius: '8px' }}
    >
      <div className="card-body p-2 d-flex gap-2">
        
        {/* CHAP TOMON: Avatar */}
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center text-muted fw-bold" 
          style={{ width: '35px', height: '35px', backgroundColor: '#e9ecef', fontSize: '12px', flexShrink: 0 }}
        >
          {getInitials(card.title)}
        </div>

        {/* O'RTA: Ma'lumotlar */}
        <div className="flex-grow-1">
          <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '14px' }}>
            {card.title}
          </div>
          <div className="text-muted" style={{ fontSize: '12px' }}>
            {card.phone}
          </div>
        </div>

        {/* O'NG TOMON: Ikonkalar va Menyu */}
        <div className="d-flex flex-column align-items-end justify-content-between">
          
          <div className="d-flex align-items-center gap-1 mb-1">
            <i className="fa-solid fa-circle-info text-muted" style={{ fontSize: '12px', cursor: 'pointer' }} title="Tafsilotlar"></i>
            <i className="fa-regular fa-clock text-muted" style={{ fontSize: '12px', cursor: 'pointer' }} title={card.date || "Vaqt"}></i>
            
            {/* 3 NUQTA MENYUSI */}
            <div className="dropdown">
              <button className="btn btn-sm btn-light border-0 p-0 text-muted ms-1" data-bs-toggle="dropdown" data-bs-boundary="window" onClick={(e) => e.stopPropagation()}>
                <i className="fa-solid fa-ellipsis"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-1" style={{ fontSize: '13px', minWidth: '150px' }}>
                <li>
                  <button className="dropdown-item py-2" onClick={() => onEdit(card)}>
                    <i className="fa-solid fa-pen me-2 text-muted"></i> Tahrirlash
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2" onClick={() => alert("SMS yuborish oynasi ochiladi")}>
                    <i className="fa-regular fa-comment-dots me-2 text-muted"></i> SMS
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2" onClick={() => alert("Izoh yozish qismi")}>
                    <i className="fa-regular fa-message me-2 text-muted"></i> Comment
                  </button>
                </li>
                <li>
                  <a href={`tel:${card.phone}`} className="dropdown-item py-2 text-dark text-decoration-none">
                    <i className="fa-solid fa-phone me-2 text-muted"></i> Qo'ng'iroq
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item py-2 text-danger" onClick={() => onDelete(card.id)}>
                    <i className="fa-solid fa-trash me-2 text-danger"></i> O'chirish (Arxiv)
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-muted" style={{ fontSize: '10px' }}>
            {card.date ? card.date.split(',')[0] : "Bugun"}
          </div>

        </div>

      </div>
    </div>
  );
}

export default LeadCard;