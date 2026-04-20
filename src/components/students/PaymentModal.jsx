import React, { useState, useEffect } from "react";
import { studentsApi } from "../../api/studentsApi"; 
import { createPortal } from "react-dom"; 

const PaymentModal = ({ isOpen, onClose, onSuccess, student }) => {
  const [formData, setFormData] = useState({
    amount: "",
    paymentType: "naqd",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: "",
        paymentType: "naqd",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      setError("");
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // 🌟 ASOSIY YECHIM: Raqamlarni chiroyli formatlash (1 000 000)
  const handleAmountChange = (e) => {
    // Kiritilgan qiymatdan faqat raqamlarni (probel va harflarsiz) ajratib olamiz
    const rawValue = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, amount: rawValue }));
    setError("");
  };

  const handleSubmit = async () => {
    const amountNum = Number(formData.amount); // API ga toza raqam jo'natiladi

    if (!amountNum || amountNum <= 0) {
      setError("Iltimos, to'g'ri summa kiriting!");
      return;
    }
    if (!formData.date) {
      setError("Iltimos, sanani belgilang!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await studentsApi.addPayment(student.id, {
        amount: amountNum,
        payment_type: formData.paymentType,
        note: formData.note,
        date: formData.date,
      });

      onSuccess(student.id, amountNum, {
        type: formData.paymentType,
        note: formData.note,
        date: formData.date,
        response: response,
      });
      onClose();
    } catch (err) {
      console.error("❌ TO'LOV XATOSI:", err);
      if (err.response?.data?.detail) setError("❌ " + err.response.data.detail);
      else if (err.response?.data?.amount) setError("❌ Summa xatosi: " + err.response.data.amount[0]);
      else setError("❌ To'lovni saqlashda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(3px)",
        zIndex: 9999999, display: "flex", justifyContent: "flex-end"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "420px", height: "100vh", backgroundColor: "#fff",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column",
          animation: "slideInRight 0.3s ease-out forwards", zIndex: 10000000
        }}
      >
        
        {/* Sarlavha (Orange rangda) */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#0f172a" }}>
            <i className="fa-solid fa-money-bill-transfer me-2" style={{ color: "#f97316" }}></i>
            To'lov qo'shish
          </h5>
          <button onClick={onClose} disabled={isLoading} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ padding: "10px 14px", marginBottom: "16px", backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#4b5563", marginBottom: "6px" }}>Talaba</label>
            <input type="text" value={student.name || student.full_name || "---"} disabled style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", backgroundColor: "#f8fafc", color: "#64748b", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563" }}>Joriy balans:</span>
            <span style={{ color: student.balance < 0 ? "#ef4444" : "#10b981", fontWeight: "bold", fontSize: "15px" }}>
              {Number(student.balance || 0).toLocaleString()} UZS
            </span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#4b5563", marginBottom: "8px" }}>To'lov usuli</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { value: "naqd", label: "Naqd pul", icon: "fa-solid fa-money-bill-wave" },
                { value: "click", label: "Click", icon: "fa-solid fa-mobile-screen" },
                { value: "plastic", label: "Plastik", icon: "fa-regular fa-credit-card" },
                { value: "uzum", label: "Uzum Bank", icon: "fa-solid fa-building-columns" },
              ].map((method) => (
                <label key={method.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isLoading ? "not-allowed" : "pointer", padding: "10px 12px", borderRadius: "8px", border: formData.paymentType === method.value ? "1px solid #f97316" : "1px solid #e2e8f0", backgroundColor: formData.paymentType === method.value ? "#fff7ed" : "#fff", transition: "all 0.2s" }}>
                  <input type="radio" name="paymentType" value={method.value} checked={formData.paymentType === method.value} onChange={handleChange} disabled={isLoading} style={{ accentColor: "#f97316", width: "16px", height: "16px", margin: 0 }} />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: formData.paymentType === method.value ? "#ea580c" : "#4b5563" }}>
                    <i className={`${method.icon} me-1`}></i> {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 🌟 YANGI: Katta, chiroyli va formatlanuvchi narx maydoni */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#4b5563", marginBottom: "6px" }}>Miqdor (UZS) *</label>
            <input 
              type="text" 
              name="amount" 
              value={formData.amount ? Number(formData.amount).toLocaleString("ru-RU") : ""} 
              onChange={handleAmountChange} 
              placeholder="Masalan: 1 500 000" 
              disabled={isLoading} 
              style={{ width: "100%", height: "46px", padding: "0 14px", border: "2px solid #cbd5e1", borderRadius: "8px", fontSize: "18px", fontWeight: "bold", color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "0.2s" }} 
              onFocus={(e) => e.target.style.borderColor = "#f97316"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#4b5563", marginBottom: "6px" }}>Sana *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} disabled={isLoading} style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#4b5563", marginBottom: "6px" }}>Izoh (ixtiyoriy)</label>
            <textarea name="note" value={formData.note} onChange={handleChange} placeholder="To'lov haqida eslatma..." disabled={isLoading} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#0f172a", outline: "none", minHeight: "80px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Tugmalar (Orange) */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "#f8fafc" }}>
          <button onClick={onClose} disabled={isLoading} style={{ height: "40px", padding: "0 20px", borderRadius: "8px", border: "none", backgroundColor: "#f1f5f9", color: "#334155", cursor: "pointer", fontWeight: 500, transition: "0.2s" }}>Bekor qilish</button>
          <button onClick={handleSubmit} disabled={isLoading} style={{ height: "40px", padding: "0 24px", borderRadius: "8px", border: "none", backgroundColor: "#f97316", color: "#fff", cursor: isLoading ? "not-allowed" : "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", transition: "0.2s", opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Kuting...</> : "Saqlash"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default PaymentModal;