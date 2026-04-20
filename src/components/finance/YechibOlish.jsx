import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import "./YechibOlish.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../../api/axiosInstance";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function YechibOlish() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filtr statelari
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    search: "",
    sum: "",
    course: "",
  });

  // Modal statelari
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  // ================= 1. API DAN MA'LUMOT YUKLASH =================
  useEffect(() => {
    // 1. Yechib olish (Qarzlar / Tushumlar) API si
    // Eslatma: Hozircha "withdrawals" yoki "student-debts" ga ulaymiz
    axiosInstance.get("/api/v1/finance/v1/finance/withdrawals/")
      .then((res) => {
        const data = res.data.results ? res.data.results : (Array.isArray(res.data) ? res.data : []);
        setAllData(data);
        setFilteredData(data);
      })
      .catch((err) => console.error("Yechib olish ma'lumotlarida xato:", err));

    // 2. Kurslarni yuklash (Filtr uchun)
    axiosInstance.get("/api/v1/academics/courses/")
      .then((res) => {
        const data = res.data.results ? res.data.results : (Array.isArray(res.data) ? res.data : []);
        setCourses(data);
      })
      .catch((err) => console.error("Kurslarni yuklashda xato:", err));
  }, []);

  // ================= 2. FILTRLASH MANTIG'I =================
  const handleFilter = (e) => {
    if (e) e.preventDefault();
    let result = allData;

    if (filters.from) {
      result = result.filter(x => (x.date || x.created_at) >= filters.from);
    }
    if (filters.to) {
      result = result.filter(x => (x.date || x.created_at) <= filters.to);
    }
    if (filters.search) {
      const qidiruv = filters.search.toLowerCase();
      result = result.filter(x => 
        (x.student_name && x.student_name.toLowerCase().includes(qidiruv)) || 
        (x.phone && x.phone.includes(qidiruv))
      );
    }
    if (filters.sum) {
      result = result.filter(x => Math.abs(Number(x.amount || x.sum)) === Number(filters.sum));
    }
    if (filters.course) {
      result = result.filter(x => x.course_id === filters.course || x.course_name === filters.course);
    }

    setFilteredData(result);
  };

  // ================= 3. HISOBLASH VA FORMATLASH =================
  const totalSum = filteredData.reduce((acc, curr) => acc + Math.abs(Number(curr.amount || curr.sum) || 0), 0);

  const formatNumber = (num) => {
    return Number(num).toLocaleString("en-US").replace(/,/g, " ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU'); // 01.05.2025 format
  };

  // ================= 4. O'CHIRISH (BEKOR QILISH) =================
  const handleDeleteClick = (item) => {
    setSelectedId(item.id);
    setSelectedName(item.student_name || "Ushbu talaba");
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/v1/finance/v1/finance/withdrawals/${selectedId}/`);
      const newData = allData.filter(x => x.id !== selectedId);
      setAllData(newData);
      setFilteredData(newData);
      setShowModal(false);
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  // ================= 5. YILLIK GRAFIK (CHART) SOZLAMALARI =================
  // Rasmga mos to'q sariq (orange) rangli chiziqli grafik
  const chartData = {
    labels: ["Avr 24", "Sen 24", "Okt 24", "Noy 24", "Dek 24", "Yan 25", "Fev 25", "Mar 25", "Apr 25", "May 25"],
    datasets: [
      {
        label: "Yechib olishlar (Tushumlar)",
        // API dagi haqiqiy ma'lumotlar bilan to'ldirish algoritmi shu yerda yoziladi
        // Hozircha rasmdagi kabi trend vizualizatsiyasi:
        data: [400000, 600000, 200000, 1000000, 850000, 1100000, 3300000, 2200000, 2100000, 2600000],
        borderColor: "#f97316", // To'q sariq
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        borderWidth: 2,
        tension: 0.4, // Chiziqni silliq qayrilishi uchun
        pointBackgroundColor: "#fff",
        pointBorderColor: "#f97316",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { 
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value === 0 ? "0 UZS" : (value / 1000000) + " 000 000 UZS";
          },
          font: { size: 10, color: '#9ca3af' }
        },
        grid: { color: '#f3f4f6' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, color: '#9ca3af' } }
      }
    },
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. SARLAVHA */}
      <h4 className="fw-bold text-dark mb-4 ms-2">Yechib olish</h4>

      {/* 2. ASOSIY STATISTIKA VA GRAFIK (TOP SECTION) */}
      <div className="row g-4 mb-4">
        {/* Chap quti: Jami summa va sana */}
        <div className="col-lg-5">
          <Card className="border-0 h-100 p-2 border-left-blue">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium d-block mb-2">Jami yechib olishlar:</span>
                <h4 className="fw-bold text-secondary m-0" style={{ color: '#4b5563' }}>
                  {formatNumber(totalSum)} UZS 
                  <span className="fs-6 ms-2 fw-normal text-muted">
                    ({filters.from ? formatDate(filters.from) : "Boshidan"} — {filters.to ? formatDate(filters.to) : "Hozirgacha"})
                  </span>
                </h4>
              </div>
              <i className="fa-solid fa-coins fs-2 text-info opacity-50"></i>
            </Card.Body>
          </Card>
        </div>

        {/* O'ng quti: 12 oylik Grafik */}
        <div className="col-lg-6">
          <Card className="border-0 p-3 h-100">
            <div style={{ position: 'relative', height: '180px', width: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>
        </div>
      </div>

      {/* 3. FILTRLAR QATORI (RASMGA MOS) */}
      <Card className="border-0 mb-4 p-2">
        <Card.Body>
          <form className="filter-grid-custom" onSubmit={handleFilter}>
            
            <div className="f-item">
              <label>Sanadan boshlab</label>
              <input type="date" value={filters.from} onChange={(e) => setFilters({...filters, from: e.target.value})} />
            </div>

            <div className="f-item">
              <label>Sana bo'yicha</label>
              <input type="date" value={filters.to} onChange={(e) => setFilters({...filters, to: e.target.value})} />
            </div>

            <div className="f-item">
              <label>Ism yoki Telefon</label>
              <input type="text" placeholder="Qidiruv..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
            </div>

            <div className="f-item">
              <label>Sum</label>
              <input type="number" placeholder="0" value={filters.sum} onChange={(e) => setFilters({...filters, sum: e.target.value})} />
            </div>

            <div className="f-item">
              <label>Kurs</label>
              <select value={filters.course} onChange={(e) => setFilters({...filters, course: e.target.value})}>
                <option value="">Tanlang</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-actions py-5">
        <button className="btn text-white px-3 fw-medium" style={{ backgroundColor: '#F27A21', border: 'none' }}  >
          Filtrlash
        </button>
        <button className="btn btn-light border px-3 fw-medium text-muted"  >
          Tozalash
        </button>
      </div>

          </form>
        </Card.Body>
      </Card>

      {/* 4. JADVAL (DATA TABLE) */}
      <Card className="border-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light text-secondary" style={{ fontSize: '13px' }}>
            <tr>
              <th className="py-3 px-4 border-bottom-0">Sana</th>
              <th className="py-3 border-bottom-0">Talaba ismi</th>
              <th className="py-3 border-bottom-0">Sum</th>
              <th className="py-3 border-bottom-0">Izoh</th>
              <th className="py-3 border-bottom-0">Xodim</th>
              <th className="py-3 px-4 text-center border-bottom-0">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="px-4 text-muted small">{formatDate(item.date || item.created_at)}</td>
                  <td className="fw-medium text-dark">{item.student_name || "Noma'lum talaba"}</td>
                  <td className="fw-bold text-dark">{formatNumber(item.amount || item.sum || 0)} UZS</td>
                  <td>
                    {/* Rasmda kurs nomi va vaqti ko'rsatilgan */
                      item.note || item.izoh ? (
                        <div className="d-flex flex-column">
                          <span className="badge bg-light text-secondary border w-auto text-start py-1">{item.note || item.izoh}</span>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )
                    }
                  </td>
                  <td className="text-danger small">{item.employee_name || "Noma'lum"}</td>
                  <td className="px-4 text-center">
                    <button className="btn-danger-outline" onClick={() => handleDeleteClick(item)} title="Bekor qilish">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="fa-solid fa-box-open fs-2 mb-3 opacity-25"></i>
                  <br />
                  Ma'lumot topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* 5. TASDIQLASH MODALI */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Haqiqatan ham o'chirasizmi?</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="fa-solid fa-circle-exclamation text-warning" style={{ fontSize: '48px' }}></i>
                </div>
                <p className="text-muted m-0 fs-5">
                  Siz <strong>{selectedName}</strong> qarz/tushum ma'lumotini tizimdan o'chirmoqchisiz.
                </p>
              </div>

              <div className="modal-footer border-top-0 d-flex justify-content-center gap-2 pt-0 pb-4">
                <button className="btn btn-light border px-4 rounded-pill" onClick={() => setShowModal(false)}>
                  Bekor qilish
                </button>
                <button className="btn btn-danger px-4 rounded-pill" onClick={confirmDelete}>
                  Ha, o‘chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}