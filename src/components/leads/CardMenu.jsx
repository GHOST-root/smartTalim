import React, { useState } from "react";
import EditLeadDrawer from "./EditLeadDrawer";

function CardMenu({ onEdit, onSms, onDelete, lead }) {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <div
        className="card shadow position-absolute end-0 mt-1"
        style={{ width: 190, zIndex: 100 }}
      >
        <div className="list-group list-group-flush">
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setOpenEdit(true)}
          >
            ✏️ Tahrirlash
          </button>

          <button className="list-group-item list-group-item-action" onClick={onSms}>
            💬 SMS
          </button>

          <div className="list-group-item">💭 Comment</div>

          <a
            href={`tel:${lead?.phone || "+998"}`}
            className="list-group-item list-group-item-action"
          >
            📞 Qo‘ng‘iroq
          </a>

          <button
            className="list-group-item list-group-item-action text-danger"
            onClick={onDelete}
          >
            🗑 O‘chirish
          </button>
        </div>
      </div>

      {/* ONG TOMONDAN TAHRIRLASH */}
      <EditLeadDrawer
        open={openEdit}
        lead={lead}
        onClose={() => setOpenEdit(false)}
        onSave={onEdit}
      />
    </>
  );
}

export default CardMenu;
