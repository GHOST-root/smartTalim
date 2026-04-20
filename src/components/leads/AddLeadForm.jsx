import React, { useState } from "react";

function AddLeadForm({
  onSave,
  onCancel,
  sources,
  sections,
  currentSectionId,
  onOpenSourceManager,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    source: "",
    sectionId: currentSectionId || (sections.length > 0 ? sections[0].id : ""),
    comment: "",
  });

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const truncatedValue = rawValue.slice(0, 9);

    let formattedValue = truncatedValue;
    if (truncatedValue.length > 2) {
      formattedValue = `${truncatedValue.slice(0, 2)} ${truncatedValue.slice(2)}`;
    }
    if (truncatedValue.length > 5) {
      formattedValue = `${formattedValue.slice(0, 6)} ${truncatedValue.slice(5)}`;
    }
    if (truncatedValue.length > 7) {
      formattedValue = `${formattedValue.slice(0, 9)} ${truncatedValue.slice(7)}`;
    }

    setForm({ ...form, phone: truncatedValue, displayPhone: formattedValue });
  };

  const handleSubmit = () => {
    if (!form.name.trim() || form.phone.length !== 9) {
      alert("Iltimos, Ism va Telefon raqamini (9 ta raqam) to'liq kiriting!");
      return;
    }

    const p = form.phone;
    const formattedBackendPhone = `998-${p.slice(0, 2)}-${p.slice(2, 5)}-${p.slice(5, 7)}-${p.slice(7, 9)}`;

    onSave({
      name: form.name.trim(),
      phone: formattedBackendPhone,
      source: form.source,
      sectionId: form.sectionId,
      comment: form.comment.trim(),
    });
  };

  const isNameEmpty = form.name.trim() === "";
  const isPhoneIncomplete = form.phone.length !== 9;
  const isFormValid = !isNameEmpty && !isPhoneIncomplete;

  return (
    <div
      className="card border-0 shadow-lg p-0 overflow-hidden"
      style={{
        animation: "fadeIn 0.3s ease-out",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: auto;
            opacity: 1;
          }
        }

        .form-header {
          background: linear-gradient(135deg, #f7ea38 0%, #cad80cfa 100%);
          color: white;
          padding: 12px 13px;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-body {
          padding: 28px 14px;
        }

        .form-group {
          margin-bottom: 20px;
          animation: fadeIn 0.4s ease-out;
        }

        .form-group:last-of-type {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding-left: 4px;
        }

        .form-label .required {
    
          margin-left: 2px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-control-modern {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          background: white;
          transition: all 0.3s ease;
          font-family: inherit;
          color: #1f2937;
        }

        .form-control-modern::placeholder {
          color: #9ca3af;
        }

        .form-control-modern:focus {
          outline: none;
      
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          // background: #fafbff;
        }

        .form-control-modern.error {

          background: #fef2f2;
        }

        .form-control-modern.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          border:none;
        }

        .form-control-modern.success {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .form-control-modern.success:focus {
          // box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .phone-input-group {
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .phone-input-group:focus-within {
       
      
          background: #fafbff;
        }

        .phone-input-group.error {
    
          background: #fef2f2;
        }

        .phone-input-group.error:focus-within {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .phone-input-group.success {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .phone-input-group.success:focus-within {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .phone-prefix {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 7px 7px;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
          border-right: 2px solid #d1d5db;
          font-size: 15px;
        }

        .phone-input-field {
          flex: 1;
          border: none;
          padding: 13px 16px;
          font-size: 15px;
          font-weight: 500;
          background: transparent;
          outline: none;
          color: #1f2937;
          font-family: inherit;
          min-width: 140px;
        }

        .phone-input-field::placeholder {
          color: #9ca3af;
        }

        .select-modern {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          background: white;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.3s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234b5563' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
          font-family: inherit;
        }

        .select-modern:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background-color: #fafbff;
        }

        .select-modern option {
          background: white;
          color: #1f2937;
        }

        .select-group {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .select-wrapper {
          flex: 1;
        }

        .btn-add {
          width: 48px;
          height: 48px;
          padding: 0;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          flex-shrink: 0;
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .btn-add:active {
          transform: translateY(0);
        }

        .btn-add i {
          transition: transform 0.3s ease;
        }

        .btn-add:hover i {
          transform: rotate(90deg) scale(1.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 2px solid #f3f4f6;
        }

        .btn-submit {
          flex: 1;
          padding: 10px 13px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-family: inherit;
        }

        .btn-submit:not(:disabled) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
        }

        .btn-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
        }

        .btn-submit:not(:disabled):active {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .btn-cancel {
          width: 48px;
          height: 48px;
          padding: 0;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          background: white;
          color: #6b7280;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .btn-cancel:hover {
          border-color: #d1d5db;
          background: #f9fafb;
          color: #374151;
          transform: rotate(90deg);
        }

        .btn-cancel:active {
          transform: rotate(90deg) scale(0.95);
        }

        .input-icon {
          position: absolute;
          right: 14px;
          pointer-events: none;
          font-size: 16px;
          color: #10b981;
          animation: slideIn 0.3s ease;
        }

        .input-icon.hidden {
          display: none;
        }
      `}</style>

      <div className="form-header">
        <i className="fa-solid fa-user-plus"></i>
        Yangi Mijoz Qo'shish
      </div>

      <div className="form-body">
        {/* ISM */}
        <div className="form-group">
          <label className="form-label">
            Ism va Familiya
            <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              className={`form-control-modern ${
                isNameEmpty ? "error" : form.name.trim() ? "success" : ""
              }`}
              placeholder="To'liq ism va familiyangizni kiriting"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {form.name.trim() && (
              <span className="input-icon">
                <i className="fa-solid fa-check"></i>
              </span>
            )}
          </div>
        </div>

        {/* TELEFON */}
        <div className="form-group">
          <label className="form-label">
            Telefon Raqami
            <span className="required">*</span>
          </label>
          <div
            className={`phone-input-group ${
              isPhoneIncomplete
                ? "error"
                : form.phone.length === 9
                  ? "success"
                  : ""
            }`}
          >
            <div className="phone-prefix">
              <span>🇺🇿</span>
              <span>+998</span>
            </div>
            <input
              type="text"
              placeholder="90 123 45 67"
              value={form.displayPhone || form.phone}
              onChange={handlePhoneChange}
              className="phone-input-field"
            />
            {form.phone.length === 9 && (
              <span
                style={{
                  paddingRight: "14px",
                  color: "#10b981",
                  fontSize: "16px",
                }}
              >
                <i className="fa-solid fa-check"></i>
              </span>
            )}
          </div>
        </div>

        {/* QAYERDAN VA + TUGMASI */}
        <div className="form-group">
          <label className="form-label">
            Manba
            <span className="required">*</span>
          </label>
          <div className="select-group">
            <div className="select-wrapper">
              <select
                className="select-modern"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">Manba'ni tanlang</option>
                {sources?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-add"
              onClick={onOpenSourceManager}
              title="Yangi manba qo'shish"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        {/* BO'LIM */}
        <div className="form-group">
          <label className="form-label">
            Bo'lim
            <span className="required">*</span>
          </label>
          <select
            className="select-modern"
            value={form.sectionId}
            onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
          >
            <option value="">Bo'limni tanlang</option>
            {sections?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* IZOH */}
        <div className="form-group">
          <label className="form-label">Qo'shimcha Izoh</label>
          <input
            type="text"
            className="form-control-modern"
            placeholder="Qo'shimcha ma'lumot kiriting (ixtiyoriy)..."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        {/* TUGMALAR */}
        <div className="form-actions">
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            <i className="fa-solid fa-paper-plane"></i>
            Yuborish
          </button>
          <button
            className="btn btn-outline"
            onClick={onCancel}
            title="Bekor qilish"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddLeadForm;
