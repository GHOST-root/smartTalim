function LeadActionsMenu({ card, onClose, onEdit, onDelete }) {
  return (
    <div className="card position-absolute end-0 mt-2 shadow" style={{ zIndex: 10 }}>
      <div className="list-group list-group-flush">

        <button className="list-group-item" onClick={() => onEdit(card)}>
          ✏️ Tahrirlash
        </button>

        <button className="list-group-item" onClick={() => onEdit(card, "sms")}>
          💬 SMS
        </button>

        <button className="list-group-item">
          🗨 Comment
        </button>

        <a
          href={`tel:${card.phone}`}
          className="list-group-item text-decoration-none"
        >
          📞 Qo‘ng‘iroq
        </a>

        <button
          className="list-group-item text-danger"
          onClick={() => onDelete(card.id)}
        >
          🗑 O‘chirish
        </button>

      </div>
    </div>
  );
}

export default LeadActionsMenu;
