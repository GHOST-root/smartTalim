import React, { useState, useEffect, useRef } from "react";

// --- DATE POPUP ---
export function DatePopup({ anchorRef, value, onChange, onClose, minDate }) {
  const rect = anchorRef?.current
    ? anchorRef.current.getBoundingClientRect()
    : null;
  const style = {
    position: rect ? "fixed" : "relative",
    left: rect ? rect.left : undefined,
    top: rect ? rect.bottom + 6 : undefined,
    zIndex: 4200,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 6,
    padding: 10,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    minWidth: 260,
  };
  const parse = (v) => (v ? new Date(v) : new Date());
  const sel = parse(value);
  const [viewYear, setViewYear] = useState(sel.getFullYear());
  const [viewMonth, setViewMonth] = useState(sel.getMonth());
  return (
    <div style={style} onMouseDown={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="date"
          className="form-control form-control-sm"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="text-end mt-2">
        <button
          className="btn btn-sm btn-secondary me-2"
          onClick={() => {
            onChange(new Date().toISOString().slice(0, 10));
            onClose && onClose();
          }}
        >
          Bugun
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onClose && onClose()}
        >
          Yopish
        </button>
      </div>
    </div>
  );
}

// --- REMINDER MODAL (RESPONSIVE) ---
export function ReminderModal({ open, onClose, onSave, initial = {} }) {
  const [form, setForm] = useState({
    title: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open)
      setForm({
        title: initial.title || "",
        note: initial.note || "",
        date: initial.date || new Date().toISOString().slice(0, 10),
      });
  }, [open, initial]);

  if (!open) return null;

  // 🌟 RESPONSIVE STYLES
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 4500,
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  };

  const modalStyle = {
    width: isMobile ? "100%" : "520px",
    maxHeight: isMobile ? "90vh" : "auto",
    margin: isMobile ? 0 : "12vh auto",
    background: "#fff",
    borderRadius: isMobile ? "12px 12px 0 0" : 8,
    padding: isMobile ? "16px 16px 32px" : 16,
    boxShadow: isMobile
      ? "0 -6px 24px rgba(0,0,0,0.12)"
      : "0 6px 20px rgba(0,0,0,0.08)",
    overflowY: "auto",
    animation: isMobile ? "slideUp 0.3s ease-out" : "fadeIn 0.3s ease-out",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0" style={{ fontSize: isMobile ? "16px" : "18px" }}>
            Yangi eslatma
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            style={{ padding: "2px 8px", fontSize: "18px" }}
          >
            ✕
          </button>
        </div>

        {/* FORM FIELDS */}
        <div className="mb-3">
          <label className="form-label small">📅 Sana</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small">📝 Nomi</label>
          <input
            className="form-control form-control-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Eslatma nomi kiriting..."
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small">💬 Izoh</label>
          <textarea
            className="form-control"
            rows={isMobile ? 4 : 3}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Qo'shimcha ma'lumot yozing..."
            style={{ fontSize: isMobile ? "16px" : "14px", resize: "vertical" }}
          />
        </div>

        {/* BUTTONS */}
        <div
          className={`d-flex gap-2 mt-4 ${isMobile ? "flex-column-reverse" : "justify-content-end"}`}
        >
          <button
            className="btn btn-sm btn-secondary"
            onClick={onClose}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Bekor
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              if (!form.title.trim()) {
                alert("Eslatma nomini kiriting!");
                return;
              }
              onSave && onSave(form);
              onClose && onClose();
            }}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            ✓ Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// --- CONFIRM MODAL (RESPONSIVE) ---
export function ConfirmModal({ open, title, children, onCancel, onConfirm }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 4600,
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  };

  const modalStyle = {
    width: isMobile ? "100%" : "480px",
    margin: isMobile ? 0 : "18vh auto",
    background: "#fff",
    borderRadius: isMobile ? "12px 12px 0 0" : 8,
    padding: isMobile ? "20px 16px 30px" : 16,
    boxShadow: isMobile
      ? "0 -6px 24px rgba(0,0,0,0.12)"
      : "0 6px 20px rgba(0,0,0,0.08)",
    animation: isMobile ? "slideUp 0.3s ease-out" : "fadeIn 0.3s ease-out",
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h5
          style={{ fontSize: isMobile ? "16px" : "18px", marginBottom: "16px" }}
        >
          {title}
        </h5>
        <div
          className="mb-4"
          style={{ fontSize: isMobile ? "14px" : "15px", lineHeight: "1.5" }}
        >
          {children}
        </div>
        <div
          className={`d-flex gap-2 ${isMobile ? "flex-column-reverse" : "justify-content-end"}`}
        >
          <button
            className="btn btn-sm btn-secondary"
            onClick={onCancel}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Bekor
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              onConfirm && onConfirm();
            }}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ADD STUDENT MODAL (RESPONSIVE) ---
export function AddStudentModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 4200,
    display: "flex",
    alignItems: isMobile ? "flex-end" : "center",
    justifyContent: "center",
    backdropFilter: "blur(2px)",
  };

  const modalStyle = {
    width: isMobile ? "100%" : "520px",
    margin: isMobile ? 0 : "8vh auto",
    background: "#fff",
    borderRadius: isMobile ? "12px 12px 0 0" : 8,
    padding: isMobile ? "20px 16px 30px" : 20,
    boxShadow: isMobile
      ? "0 -6px 24px rgba(0,0,0,0.12)"
      : "0 6px 20px rgba(0,0,0,0.08)",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ fontSize: isMobile ? "16px" : "18px" }}>
            Yangi talaba
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label small">👤 Ism yoki telefon</label>
          <input
            className="form-control form-control-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Talaba ismi yoki telefonini kiriting..."
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label small">📅 Sanadan boshlash</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ fontSize: isMobile ? "16px" : "14px" }}
          />
        </div>

        <div
          className={`d-flex gap-2 ${isMobile ? "flex-column-reverse" : "justify-content-end"}`}
        >
          <button
            className="btn btn-sm btn-secondary"
            onClick={onClose}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Bekor qilish
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              if (!form.name.trim()) {
                alert("Ism kiriting");
                return;
              }
              onSave(form.name, form.startDate);
              onClose();
            }}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            ✓ Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SMS DRAWER (RESPONSIVE) ---
export function GroupSmsDrawer({ open, onClose, onSend, studentCount = 0 }) {
  const [msg, setMsg] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!open) return null;

  const drawerStyle = {
    position: "fixed",
    right: isMobile ? 0 : 0,
    top: 0,
    height: "100vh",
    width: isMobile ? "100%" : 380,
    background: "#fff",
    zIndex: 4300,
    padding: isMobile ? "16px 16px 20px" : 18,
    boxShadow: isMobile
      ? "0 -6px 24px rgba(0,0,0,0.12)"
      : "-6px 0 24px rgba(0,0,0,0.12)",
    overflow: "auto",
    animation: isMobile ? "slideUp 0.3s ease-out" : "slideLeft 0.3s ease-out",
  };

  return (
    <>
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* OVERLAY */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 4299,
          }}
          onClick={onClose}
        />
      )}

      {/* DRAWER */}
      <div style={drawerStyle}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0" style={{ fontSize: isMobile ? "16px" : "18px" }}>
            📨 SMS yuborish
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            style={{ padding: "2px 8px" }}
          >
            ✕
          </button>
        </div>

        <textarea
          className="form-control mb-3"
          rows={isMobile ? 8 : 6}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Xabar matni kiriting..."
          style={{ fontSize: isMobile ? "16px" : "14px", resize: "vertical" }}
        />

        <div
          className="small text-muted mb-4"
          style={{ fontSize: isMobile ? "13px" : "12px" }}
        >
          📝 {msg.length} ta belgi • 👥 {studentCount} ta talabaga
        </div>

        <button
          className="btn btn-sm btn-warning w-100"
          onClick={() => {
            if (!msg.trim()) {
              alert("Xabar matni kiriting!");
              return;
            }
            onSend(msg);
            onClose();
          }}
          style={{ fontSize: isMobile ? "14px" : "13px" }}
        >
          ✓ Yuborish
        </button>
      </div>
    </>
  );
}

// --- DISCOUNT FORM ---
export function DiscountForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    sum: "",
    start: new Date().toISOString().slice(0, 10),
    end: "",
    note: "",
  });
  return (
    <div>
      <div className="mb-2">
        <label className="form-label small">Sum</label>
        <input
          className="form-control form-control-sm"
          value={form.sum}
          onChange={(e) => setForm({ ...form, sum: e.target.value })}
        />
      </div>
      <div className="mb-2">
        <label className="form-label small">Boshlanish / Tugash</label>
        <div className="d-flex gap-2">
          <input
            type="date"
            className="form-control form-control-sm"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />
          <input
            type="date"
            className="form-control form-control-sm"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />
        </div>
      </div>
      <div className="mb-2">
        <label className="form-label small">Izoh</label>
        <input
          className="form-control form-control-sm"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </div>
      <div className="d-flex justify-content-end gap-2 mt-2">
        <button className="btn btn-sm btn-secondary" onClick={onCancel}>
          Bekor
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => onSave(form)}>
          Saqlash
        </button>
      </div>
    </div>
  );
}
