import React, { useState, useMemo, useEffect } from "react";
import "./Tolovlar.css";
import { Line } from "react-chartjs-2";
import { Outlet } from "react-router-dom";
import Profile from "../students/Profile";
import { financeApi } from "../../api/financeApi";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Tolovlar() {
  const [allPayments, setAllPayments] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ================= 1. BAZADAN MA'LUMOT YUKLASH =================
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Barcha to'lovlarni (Tushumlarni) yuklash
      const payRes = await financeApi.payments.getAll();
      const paymentsData = payRes.results ? payRes.results : (Array.isArray(payRes) ? payRes : []);
      setAllPayments(paymentsData);

      // 2. Barcha xarajatlarni yuklash (Sof foydani hisoblash uchun)
      const expRes = await financeApi.expenses.getAll();
      const expensesData = expRes.results ? expRes.results : (Array.isArray(expRes) ? expRes : []);
      setAllExpenses(expensesData);

    } catch (error) {
      console.error("API dan yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= 2. FILTRLAR STATE =================
  const initialFilterState = {
    fromDate: "", toDate: "", name: "", group: "", course: "",
    teacher: "", staff: "", createdFrom: "", createdTo: "", paymentType: "", amount: "",
  };
  const [filters, setFilters] = useState(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState);

  const filterLabels = {
    fromDate: "Sanadan boshlab", toDate: "Sana bo‘yicha", name: "Ism yoki Telefon",
    group: "Guruhni tanlang", course: "Kurs", teacher: "O‘qituvchi", paymentType: "To‘lov turi",
    staff: "Xodim", amount: "Sum", createdFrom: "Yaratilgan sanadan", createdTo: "Yaratilgan sanagacha"
  };

  const [visibleFilters, setVisibleFilters] = useState(
    Object.keys(filterLabels).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleFilterVisibility = (field) => setVisibleFilters(prev => ({ ...prev, [field]: !prev[field] }));
  const updateField = (field, value) => setFilters({ ...filters, [field]: value });

  const handleApplyFilter = () => setAppliedFilters(filters);
  const clearFilters = () => {
    setFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
  };

  // ================= 3. JADVALNI FILTRLASH MANTIG'I =================
  const filtered = useMemo(() => {
    return allPayments.filter((p) => {
      // API dan kelgan nomlarga qarab to'g'rilaymiz (fallback bilan)
      const pDate = p.date || p.created_at?.split('T')[0] || "";
      const pStudent = p.student_name || p.student?.name || p.student || "";
      const pSum = Number(p.amount || p.sum || 0);
      const pType = p.payment_type?.name || p.payment_type || p.type || "";
      const pGroup = p.group?.name || p.group || p.note || "";
      const pTeacher = p.teacher?.name || p.teacher || "";
      const pStaff = p.staff?.name || p.employee_name || p.employee?.name || p.staff || "";
      const pTime = p.created_at || p.time || "";

      if (appliedFilters.fromDate && pDate < appliedFilters.fromDate) return false;
      if (appliedFilters.toDate && pDate > appliedFilters.toDate) return false;
      
      if (appliedFilters.name) {
        const searchName = appliedFilters.name.toLowerCase();
        if (!pStudent.toLowerCase().includes(searchName)) return false;
      }
      
      if (appliedFilters.group && pGroup !== appliedFilters.group) return false;
      if (appliedFilters.teacher && pTeacher !== appliedFilters.teacher) return false;
      if (appliedFilters.paymentType && pType !== appliedFilters.paymentType) return false;
      if (appliedFilters.amount && Number(appliedFilters.amount) !== pSum) return false;
      if (appliedFilters.staff && pStaff !== appliedFilters.staff) return false;
      
      if (appliedFilters.createdFrom) {
        const created = pTime.split("T")[0].split(" ")[0];
        if (created < appliedFilters.createdFrom) return false;
      }
      if (appliedFilters.createdTo) {
        const created = pTime.split("T")[0].split(" ")[0];
        if (created > appliedFilters.createdTo) return false;
      }
      
      return true;
    });
  }, [allPayments, appliedFilters]);

  // ================= 4. SOF FOYDA VA JAMI SUMMANI HISOBLASH =================
  const totals = useMemo(() => {
    // 1. Tushumlar yig'indisi
    const totalSum = filtered.reduce((s, p) => s + Number(p.amount || p.sum || 0), 0);
    
    // 2. Xarajatlar yig'indisi (Faqat tanlangan vaqt oralig'idagi xarajatlarni hisoblaymiz)
    const filteredExpenses = allExpenses.filter(e => {
      const eDate = e.expense_date || e.date || e.created_at?.split('T')[0] || "";
      if (appliedFilters.fromDate && eDate < appliedFilters.fromDate) return false;
      if (appliedFilters.toDate && eDate > appliedFilters.toDate) return false;
      return true;
    });
    
    const totalExp = filteredExpenses.reduce((s, e) => s + Number(e.amount || e.sum || 0), 0);
    
    // 3. Sof foyda = Tushum - Xarajat
    const profit = totalSum - totalExp;
    
    return { totalSum, profit };
  }, [filtered, allExpenses, appliedFilters]);

  // ================= 5. YILLIK GRAFIK MANTIG'I =================
  const dynamicChartData = useMemo(() => {
    const monthlyData = {};
    allPayments.forEach(p => {
      const dateVal = p.date || p.created_at;
      if (dateVal) {
        const monthYear = new Date(dateVal).toLocaleString("uz-UZ", { year: "2-digit", month: "short" });
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(p.amount || p.sum || 0);
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));

    return {
      labels: sortedMonths.length > 0 ? sortedMonths : ["Hozircha ma'lumot yo'q"],
      datasets: [
        {
          label: "Tushumlar",
          data: sortedMonths.length > 0 ? sortedMonths.map(m => monthlyData[m]) : [0],
          borderColor: "#1d8ff0",
          backgroundColor: "rgba(29, 143, 240, 0.2)",
          tension: 0.3,
          pointRadius: 4,
          fill: true,
        },
      ],
    };
  }, [allPayments]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          callback: (value) => value === 0 ? "0" : (value / 1000) + "K UZS"
        }
      },
    },
  };

  // ================= 6. SARALASH (SORTING) =================
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedPayments = useMemo(() => {
    let sortableItems = [...filtered]; 
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (sortConfig.key === 'amount' || sortConfig.key === 'sum') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "fa-solid fa-sort ms-1 text-muted opacity-25";
    return sortConfig.direction === 'asc' ? "fa-solid fa-sort-up ms-1 text-primary" : "fa-solid fa-sort-down ms-1 text-primary";
  };

  // ================= PROFIL OCHISH =================
  const handleOpenProfile = (payment) => {
    const studentName = payment.student_name || payment.student?.name || payment.student;
    const allStudents = JSON.parse(localStorage.getItem('studentsList') || '[]');
    
    const foundStudent = allStudents.find(s => s.name?.trim().toLowerCase() === studentName?.trim().toLowerCase());
    
    if (foundStudent) {
      setSelectedStudent(foundStudent);
    } else {
      const tempStudent = {
        id: `temp-${payment.id}`,
        name: studentName,
        phone: payment.phone || "Noma'lum",
        balance: payment.amount || payment.sum, 
        coins: 0,
        groups: payment.group?.name || payment.note || "Noma'lum",
        teacher: payment.teacher?.name || payment.teacher || "Noma'lum",
        date: payment.date || payment.created_at,
        note: "Diqqat: Bu talaba haqiqiy bazada yo'q. Vaqtinchalik profil."
      };
      setSelectedStudent(tempStudent);
    }
  };

  useEffect(() => {
    if (selectedStudent) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedStudent]);

  return (
    <div className="container-fluid my-4 tolovlar-page px-4">
      
      <h3 className="mb-4 fw-bold text-dark">Barcha to'lovlar</h3>

      <div className="row g-4">
        {/* LEFT CARDS */}
        <div className="col-lg-5">
          <div className="card card-stat mb-3 border-0 shadow-sm" style={{ borderLeft: '4px solid #1d8ff0' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div className="orovchi">
                <div className="text-muted small fw-medium mb-1">Jami tushumlar miqdori:</div>
                <h3 className="fw-bold text-dark m-0">
                  {loading ? "..." : totals.totalSum.toLocaleString()} UZS
                </h3>
                <div className="small smtxt d-flex text-muted mt-1">
                  {appliedFilters.fromDate || "Boshidan"} — {appliedFilters.toDate || "Hozirgacha"}
                </div>
              </div>
              <div className="icon-stack bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>💰</div>
            </div>
          </div>

          <div className="card card-stat border-0 shadow-sm" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div className="orovchi">
                <div className="text-muted small fw-medium mb-1">Sof foyda miqdori (Kirim - Chiqim):</div>
                <h3 className={`fw-bold m-0 ${totals.profit < 0 ? 'text-danger' : 'text-success'}`}>
                  {loading ? "..." : totals.profit.toLocaleString()} UZS
                </h3>
                <div className="small smtxt text-muted mt-1">
                  {appliedFilters.fromDate || "Boshidan"} — {appliedFilters.toDate || "Hozirgacha"}
                </div>
              </div>
              <div className="icon-stack bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>💵</div>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className="col-lg-6">
          <div className="card chart-card border-0 shadow-sm h-100">
            <div className="card-body" style={{ height: '230px', position: 'relative' }}>
              <Line data={dynamicChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN (⚙ Filtr) */}
      <div className="d-flex justify-content-end mt-4 mb-2">
        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle px-3 py-2 " type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">
            ⚙ Sozlamalar
          </button>
          <ul className="dropdown-menu shadow p-3 border-0" style={{ width: "250px", borderRadius: "10px" }}>
            <h6 className="dropdown-header px-1 text-dark fw-bold mb-2">Ko‘rinadigan ustunlar</h6>
            {Object.entries(filterLabels).map(([key, label]) => (
              <li key={key}>
                <div className="form-check mb-2 ">
                  <input className="form-check-input" type="checkbox" id={`chk-${key}`} checked={visibleFilters[key]} onChange={() => toggleFilterVisibility(key)} />
                  <label className="form-check-label text-muted" htmlFor={`chk-${key}`} style={{ fontSize: "14px" }}>{label}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FILTERS WRAPPER */}
      <div className="filter-wrapper mt-5 pt-5">
        {visibleFilters.fromDate && (
          <div className="f-item"><label>Sanadan boshlab</label><input classname="width" type="date" value={filters.fromDate} onChange={(e) => updateField("fromDate", e.target.value)} /></div>
        )}
        {visibleFilters.toDate && (
          <div className="f-item"><label>Sana bo‘yicha</label><input classname="width" type="date" value={filters.toDate} onChange={(e) => updateField("toDate", e.target.value)} /></div>
        )}
        {visibleFilters.name && (
          <div className="f-item wide"><label>Ism yoki Telefon</label><input classname="width" type="text" placeholder="Qidiruv..." value={filters.name} onChange={(e) => updateField("name", e.target.value)} /></div>
        )}
        {visibleFilters.group && (
          <div className="f-item"><label>Guruhni tanlang</label><input classname="width" type="text" placeholder="Guruh nomi..." value={filters.group} onChange={(e) => updateField("group", e.target.value)} /></div>
        )}
        {visibleFilters.course && (
          <div className="f-item"><label>Kurs</label><input classname="width" type="text" placeholder="Kurs nomi..." value={filters.course} onChange={(e) => updateField("course", e.target.value)} /></div>
        )}
        {visibleFilters.teacher && (
          <div className="f-item"><label>O‘qituvchi</label><input classname="width" type="text" placeholder="O'qituvchi ismi..." value={filters.teacher} onChange={(e) => updateField("teacher", e.target.value)} /></div>
        )}
        {visibleFilters.paymentType && (
          <div className="f-item">
            <label>To‘lov turi</label>
            <select value={filters.paymentType} onChange={(e) => updateField("paymentType", e.target.value)}>
              <option value="">Barchasi</option>
              <option value="naqd">Naqd pul</option>
              <option value="plastik">Plastik karta</option>
              <option value="payme">Payme</option>
              <option value="click">Click</option>
            </select>
          </div>
        )}
        {visibleFilters.staff && (
          <div className="f-item"><label>Xodim</label><input classname="width" type="text" placeholder="Xodim ismi..." value={filters.staff} onChange={(e) => updateField("staff", e.target.value)} /></div>
        )}
        {visibleFilters.amount && (
          <div className="f-item"><label>Sum</label><input classname="width" type="number" placeholder="0" value={filters.amount} onChange={(e) => updateField("amount", e.target.value)} /></div>
        )}
      </div>

      <div className="filter-actions py-5">
        <button className="btn text-white px-4 fw-medium" style={{ backgroundColor: '#F27A21', border: 'none' }} onClick={handleApplyFilter}>
          Filtrlash
        </button>
        <button className="btn btn-light border px-4 fw-medium text-muted" onClick={clearFilters}>
          Tozalash
        </button>
      </div>

      {/* TABLE */}
      <div className="table-responsive card border-0 shadow-sm mt-4">
        <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
          <thead className="bg-light text-muted">
            <tr>
              <th className="fw-medium py-3 px-4 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('created_at')}>
                Sana <i className={getSortIcon('created_at')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('student')}>
                Talaba ismi <i className={getSortIcon('student')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('amount')}>
                Sum <i className={getSortIcon('amount')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('payment_type')}>
                To'lov turi <i className={getSortIcon('payment_type')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('teacher')}>
                O'qituvchi <i className={getSortIcon('teacher')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('group')}>
                Izoh <i className={getSortIcon('group')}></i>
              </th>
              <th className="fw-medium py-3 border-0" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('staff')}>
                Xodim <i className={getSortIcon('staff')}></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-5 text-muted">Ma'lumotlar yuklanmoqda...</td></tr>
            ) : sortedPayments.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-5 text-muted">Hech qanday ma'lumot topilmadi.</td></tr>
            ) : (
              sortedPayments.map((p) => {
                const pDate = p.date || p.created_at?.split('T')[0] || "-";
                const pStudent = p.student_name || p.student?.name || p.student || "Noma'lum";
                const pSum = Number(p.amount || p.sum || 0);
                const pType = p.payment_type?.name || p.payment_type || p.type || "-";
                const pTeacher = p.teacher?.name || p.teacher || "-";
                const pNote = p.group?.name || p.group || p.note || "-";
                const pStaff = p.employee_name || p.employee?.name || p.staff || "-";
                const pTime = p.created_at ? p.created_at.split('T')[1]?.substring(0, 8) : p.time;

                return (
                  <tr key={p.id} onClick={() => handleOpenProfile(p)} style={{ cursor: "pointer" }}>
                    <td className="px-4 text-muted">{pDate}</td>
                    <td className="fw-medium text-dark">{pStudent}</td>
                    <td className="text-success fw-bold">
                      +{pSum.toLocaleString()} UZS
                    </td>
                    <td className="text-muted">{pType}</td>
                    <td className="text-primary">{pTeacher}</td>
                    <td><span className="badge bg-light text-secondary border">{pNote}</span></td>
                    <td>
                      <div className="text-dark">{pStaff}</div>
                      <div className="small text-muted" style={{ fontSize: '11px' }}>{pTime}</div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <Outlet />

      {selectedStudent && (
        <div className="profile-fullscreen">
          <Profile student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        </div>
      )}

    </div>
  );
}