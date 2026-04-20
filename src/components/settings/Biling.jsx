import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { settingsApi } from "../../api/settingsApi";
import "./styles/biling.css";

// 🌟 DIQQAT: 9 OY qo'shildi, shunda karta bosilganda menyu uni taniydi
const periodOptions = [
  { value: "", label: "Tanlang" },
  { value: "1", label: "1 oy" },
  { value: "3", label: "3 oy" },
  { value: "6", label: "6 oy" },
  { value: "9", label: "9 oy" },
  { value: "12", label: "12 oy" },
];

const ORG_ID = localStorage.getItem("org_id");

// 🌟 Kartalar dizayni aynan rasmdagidek qilindi
function PlanColumn({ plan, onSelect, activePlan, activePeriod }) {
  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ gap: "12px" }}
    >
      <h6 className="fw-bold mb-1" style={{ fontSize: "16px", color: "#333" }}>
        {plan.name}
      </h6>

      {plan.rows.map((row) => {
        const month = row.label.split(" ")[0]; // "3 OY" dan "3" ni olamiz
        const isActive = activePlan === plan.name && activePeriod === month; // Aktivligini tekshiramiz

        return (
          <div
            key={`${plan.name}-${row.label}`}
            onClick={() => onSelect(plan, row)}
            style={{
              display: "flex",
              width: "130px",
              height: "95px",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "pointer",
              // Aktiv bo'lsa ko'k ramka va biroz kattalashadi
              boxShadow: isActive
                ? "0 0 0 3px #0d6efd"
                : "0 4px 6px rgba(0,0,0,0.05)",
              transform: isActive ? "scale(1.03)" : "scale(1)",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            {/* Chap tomondagi qora qism */}
            <div
              style={{
                backgroundColor: "#000",
                color: "#fff",
                width: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              {row.label}
            </div>

            {/* O'ng tomondagi sariq qism */}
            <div
              style={{
                backgroundColor: "#ffc107",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px 4px",
                position: "relative",
              }}
            >
              {row.oldPrice && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "#666",
                    textDecoration: "line-through",
                    marginBottom: "2px",
                    opacity: 0.7,
                  }}
                >
                  {row.oldPrice}
                </span>
              )}

              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                {row.price.replace(" ", "\n")}
              </span>

              {/* Pastki o'ng burchakdagi chegirma yozuvi */}
              {row.badge && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    right: "-6px",
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                    padding: "1px 5px",
                    fontSize: "9px",
                    fontWeight: "bold",
                    color: "#333",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {row.badge}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Billing() {
  const [period, setPeriod] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [plans, setPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentBilling, setCurrentBilling] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Komponent yuklanganda API'larni chaqirish
  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoading(true);
      try {
        const [plansRes, historyRes, currentRes] = await Promise.all([
          settingsApi.billing.getPlans().catch(() => null),
          settingsApi.billing.getHistory(ORG_ID).catch(() => null),
          settingsApi.billing.getCurrent(ORG_ID).catch(() => null),
        ]);

        // 🌟 1. TARIFLARNI (PLANS) BACKENDDAN OLISH VA MOSLASH
        if (plansRes) {
          const apiPlans =
            plansRes.results || (Array.isArray(plansRes) ? plansRes : []);

          if (apiPlans.length > 0) {
            // Agar backend tayyor bizning UI formatda {name: 'START', rows: [...]} bersa:
            if (apiPlans[0].rows) {
              setPlans(apiPlans);
            } else {
              // Agar backend tekis (flat) ro'yxat bersa, uni o'zimiz guruhlaymiz:
              const groupedPlans = {};
              apiPlans.forEach((p) => {
                const planName = p.name || p.plan_type || p.title || "Tarif";
                if (!groupedPlans[planName])
                  groupedPlans[planName] = { name: planName, rows: [] };

                groupedPlans[planName].rows.push({
                  id: p.id || p.uuid,
                  label: `${p.months || p.duration || 1} OY`,
                  price: p.price
                    ? p.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    : "0", // 1500000 -> 1 500 000
                  oldPrice: p.old_price
                    ? p.old_price
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    : "",
                  badge:
                    p.discount_badge ||
                    p.discount ||
                    (p.discount_percent ? `+${p.discount_percent}%` : ""),
                });
              });

              // Kartalarni oylar (3, 6, 9, 12) bo'yicha tartiblaymiz
              const finalPlans = Object.values(groupedPlans).map((plan) => {
                plan.rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));
                return plan;
              });

              setPlans(finalPlans);
            }
          }
        }

        // 🌟 2. TO'LOV TARIXINI BACKENDDAN OLISH
        if (historyRes && (historyRes.results || Array.isArray(historyRes))) {
          const histArray = historyRes.results || historyRes;
          setPaymentHistory(
            histArray.map((item) => ({
              id: item.id || item.uuid,
              amount: item.amount
                ? `${item.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} UZS`
                : "0 UZS",
              date: item.created_at
                ? new Date(item.created_at).toLocaleString("uz-UZ")
                : item.date || "",
            })),
          );
        }

        // 🌟 3. JORIY BALANS VA HOLATNI OLISH
        if (currentRes) {
          // Agar faol obuna yo'q xabari kelsa, balansni 0 qilib qoyamiz
          if (currentRes.message === "Faol obuna topilmadi") {
            setCurrentBilling({ balance: 0, no_subscription: true });
          } else {
            setCurrentBilling(currentRes);
          }
        } else {
          setCurrentBilling({ balance: 0 }); // Server umuman javob bermasa ham 0
        }
      } catch (error) {
        console.error("Billing ma'lumotlarini yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // 🌟 Kartani bosganda ishlaydigan funksiya
  const handlePlanSelect = (plan, row) => {
    const month = row.label.split(" ")[0]; // "3 OY" -> "3"
    setPeriod(month); // Chap paneldagi "Davr" ni o'zgartiradi
    setAmount(row.price); // To'lov summasini o'zgartiradi
    setSelectedPlanId(plan.name); // Qaysi plan tanlanganini saqlaydi
  };

  const handlePayment = async () => {
    if (!period || !amount) {
      alert("Iltimos, to'lov davri va tarifni tanlang!");
      return;
    }

    try {
      const payload = {
        plan: selectedPlanId,
        months: parseInt(period, 10),
        amount: amount.replace(/\D/g, ""),
      };

      await settingsApi.billing.pay(ORG_ID, payload);
      alert("To'lov so'rovi muvaffaqiyatli yuborildi!");

      const historyRes = await settingsApi.billing.getHistory(ORG_ID);
      if (historyRes) {
        setPaymentHistory(historyRes.results || historyRes);
      }
    } catch (error) {
      console.error("To'lovda xatolik:", error);
      alert("To'lov jarayonida xatolik yuz berdi.");
    }
  };

  const currentPlanTotal = useMemo(() => {
    if (!period || !amount) return "Davr tanlanmagan";
    const selected = periodOptions.find((item) => item.value === period);
    if (!selected) return "Davr tanlanmagan";
    return `${selected.label} uchun to'lov: ${amount} so'm`;
  }, [period, amount]);

  return (
    <div className="modme-billing-page">
      <div className="container-fluid px-0">
        <div className="row g-4 align-items-start">
          {/* CHAP TOMON */}
          <div className="col-12 col-xl-6">
            <div className="billing-box h-100">
              <h2 className="billing-section-title">Platforma uchun to'lov</h2>

              <div className="billing-form-wrap">
                <label className="billing-label">
                  Davr <span className="billing-required">*</span>
                </label>

                <div className="billing-select-wrap ">
                  {/* 🌟 Davr menyusi (9 oy qo'shildi) */}
                  <select
                    className="form-select billing-select h-auto"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="billing-select-icon" />
                </div>

                <button
                  type="button"
                  className="billing-pay-btn"
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Yuklanmoqda..."
                    : amount
                      ? `${amount} so'm ni to'lash`
                      : "To'lash"}
                </button>

                <div className="billing-helper-text">{currentPlanTotal}</div>
              </div>
            </div>

            <div className="billing-box billing-history-box mt-4">
              <h2 className="billing-section-title billing-history-title">
                To'lov tarixi
              </h2>

              <div className="table-responsive">
                <table className="table billing-history-table mb-0">
                  <thead>
                    <tr>
                      <th>Jami</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">
                          Hozircha to'lov tarixi yo'q
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-medium text-success">
                            {item.amount}
                          </td>
                          <td className="text-muted">{item.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* O‘NG TOMON (Tarix va Planlar) */}
          <div className="col-12 col-xl-6">
            <div className="billing-box billing-pricing-box">
              {/* 🌟 KARTALAR QISMI */}
              <div className="d-flex justify-content-center gap-4 flex-wrap mb-4">
                {plans.map((plan) => (
                  <PlanColumn
                    key={plan.name}
                    plan={plan}
                    onSelect={handlePlanSelect}
                    activePlan={selectedPlanId} // Aktiv Planni yuboramiz
                    activePeriod={period} // Aktiv oyni yuboramiz
                  />
                ))}
              </div>

              <div className="billing-pricing-footer d-flex justify-content-between align-items-end flex-wrap gap-3 mt-4 pt-3 border-top">
                <div className="billing-brand">
                  mod<span>me</span>
                </div>

                <div className="billing-gamification">
                  <span className="billing-gamification-label">
                    Gamification (Joriy Balans)
                  </span>
                  <span
                    className={`billing-gamification-value fw-bold ms-2 ${currentBilling?.no_subscription ? "text-danger" : "text-success"}`}
                  >
                    {currentBilling?.balance !== undefined
                      ? `${currentBilling.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`
                      : "0 so'm"}
                  </span>
                  {currentBilling?.no_subscription && (
                    <span
                      className="badge bg-danger ms-2"
                      style={{ fontSize: "10px" }}
                    >
                      Faol obuna yo'q
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
