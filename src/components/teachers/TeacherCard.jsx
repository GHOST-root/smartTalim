import { useState } from "react";

function TeacherCard({ teacher, onEdit, onSms, onDelete, onView }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="teacher-row d-flex justify-content-between align-items-center"
      onClick={() => onView && onView()}
      style={{ cursor: onView ? "pointer" : undefined }}
    >
      <div>{teacher.name}</div>
      <div>{teacher.phone}</div>
      <div>{teacher.group}</div>

      <div className="position-relative" onClick={(e) => e.stopPropagation()}>
        <span
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          ⋮
        </span>

        {open && (
          <div className="position-absolute end-0 bg-white shadow rounded p-2">
            <div
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit && onEdit();
              }}
            >
              ✏️ Tahrirlash
            </div>

            <div
              className="dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onSms && onSms();
              }}
            >
              ✉️ SMS
            </div>

            <div
              className="dropdown-item text-danger"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete && onDelete();
              }}
            >
              🗑 O‘chirish
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherCard;
