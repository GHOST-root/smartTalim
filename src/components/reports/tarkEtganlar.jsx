import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Tarketganhisob.css";
import { reportsApi } from "../../api/reportsApi"; 
import { dashboardApi } from "../../api/dashboardApi"; // Select ma'lumotlarini tortish uchun kerak

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 } },
    x: { grid: { display: false } },
  },
};

const Tarketganhisob = () => {
  const [totalCount, setTotalCount] = useState(0);

  // Grafik datalari
  const [teacherData, setTeacherData] = useState({ labels: [], datasets: [] });
  const [courseData, setCourseData] = useState({ labels: [], datasets: [] });
  const [reasonData, setReasonData] = useState({ labels: [], datasets: [] });
  const [monthlyData, setMonthlyData] = useState({ labels: [], datasets: [] });

  // API dan keladigan Filtr variantlari (Dropdowns)
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [reasons, setReasons] = useState([]);

  // 1. Filtrlar uchun State
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    course: "",
    teacher: "",
    reason: "",
    status: "" // Holati
  });

  const safeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.results || res.data || Object.values(res).find(Array.isArray) || [];
  };

  // 🌟 BIRINCHI MARTA YUKLANGANDA DROPDOWN MA'LUMOTLARINI TORTISH 🌟
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [crsRes, tchRes, rsnRes] = await Promise.all([
          dashboardApi.courses?.getAll().catch(() => []),
          dashboardApi.teachers?.getAll().catch(() => []),
          dashboardApi.leaveReasons?.getAll().catch(() => [])
        ]);

        setCourses(safeArray(crsRes));
        setTeachers(safeArray(tchRes));
        setReasons(safeArray(rsnRes));
      } catch (error) {
        console.error("Dropdown ma'lumotlarini yuklashda xato:", error);
      }
    };
    
    fetchDropdownData();
    fetchReports(); // Grafiklarni ham dastlabki holatda yuklaymiz
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🌟 GRAFIK MA'LUMOTLARINI TORTISH 🌟
  const fetchReports = async (appliedFilters = {}) => {
    try {
      const cleanFilters = Object.fromEntries(Object.entries(appliedFilters).filter(([_, v]) => v !== ''));

      const [teachersRes, coursesRes, reasonsRes, leavesRes] = await Promise.all([
        reportsApi.getTeachersReport?.(cleanFilters).catch(()=>[]),
        reportsApi.getCoursesReport?.(cleanFilters).catch(()=>[]),
        reportsApi.getLeaveReasonsReport?.(cleanFilters).catch(()=>[]),
        reportsApi.getStudentLeavesReport?.(cleanFilters).catch(()=>[]) 
      ]);

      const tData = safeArray(teachersRes);
      const cData = safeArray(coursesRes);
      const rData = safeArray(reasonsRes);
      const lData = safeArray(leavesRes);

      // Grafiklarni chizish (Ranglar rasmdagidek sozlandi)
      setTeacherData({
        labels: tData.map(item => item.name || item.teacher || item.full_name || "Noma'lum"),
        datasets: [{ data: tData.map(item => item.count || item.total || 0), backgroundColor: "#10b981", barThickness: 60 }]
      });

      setCourseData({
        labels: cData.map(item => item.name || item.course || "Noma'lum"),
        datasets: [{ data: cData.map(item => item.count || item.total || 0), backgroundColor: "#ef4444", barThickness: 60 }]
      });

      setReasonData({
        labels: rData.map(item => item.name || item.reason || "Sababsiz"),
        datasets: [{ data: rData.map(item => item.count || item.total || 0), backgroundColor: "#8b5cf6", barThickness: 60 }]
      });

      setTotalCount(lData.length);
      const monthlyCounts = {};
      lData.forEach(item => {
        const dateStr = item.created_at || item.date || item.leave_date;
        if (!dateStr) return;
        const monthYear = new Date(dateStr).toLocaleString('uz-UZ', { month: 'short', year: 'numeric' });
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      });

      setMonthlyData({
        labels: Object.keys(monthlyCounts),
        datasets: [{ data: Object.values(monthlyCounts), backgroundColor: "#0ea5e9", barThickness: 60 }]
      });

    } catch (error) {
      console.error("Hisobotlarni yuklashda xato:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchReports(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = { start_date: "", end_date: "", course: "", teacher: "", reason: "", status: "" };
    setFilters(defaultFilters);
    fetchReports(defaultFilters); 
  };

  return (
    <div className="tr-page-container">
      
      {/* 🌟 SARLAVHA VA BADGE 🌟 */}
      <div className="tr-header-row">
        <h2 className="tr-report-title">Guruhni tark etgan o'quvchilar</h2>
        <span className="tr-badge">Miqdor — {totalCount} ta</span>
      </div>

      {/* 🌟 FILTRLAR (Barchasi bir qatorda) 🌟 */}
      <div className="tr-filter-bar">
        
        <input 
          type="date" 
          className="tr-filter-input"
          name="start_date"
          value={filters.start_date} 
          onChange={handleFilterChange} 
          title="Boshlanish sanasi"
        />
        
        <input 
          type="date" 
          className="tr-filter-input"
          name="end_date"
          value={filters.end_date} 
          onChange={handleFilterChange} 
          title="Tugash sanasi"
        />
        
        <select className="tr-filter-input" name="course" value={filters.course} onChange={handleFilterChange}>
          <option value="">Barcha kurslar</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="tr-filter-input" name="teacher" value={filters.teacher} onChange={handleFilterChange}>
          <option value="">Barcha o'qituvchilar</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.name || t.first_name}</option>)}
        </select>

        <select className="tr-filter-input" name="reason" value={filters.reason} onChange={handleFilterChange}>
          <option value="">Arxivlash sabablari</option>
          {reasons.map(r => <option key={r.id} value={r.id}>{r.name || r.reason || r.title}</option>)}
        </select>

        <select className="tr-filter-input" name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Holati</option>
          <option value="active">Aktiv</option>
          <option value="frozen">Muzlatilgan</option>
        </select>

        {/* TUGMALAR */}
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="tr-filter-btn" onClick={handleApplyFilters}>Filtr</button>
          <button className="tr-reset-btn" onClick={handleResetFilters} title="Tozalash"><i className="fa-solid fa-rotate-right"></i></button>
        </div>

      </div>

      {/* 🌟 CHARTS QISMI (2x2 Grid) 🌟 */}
      <div className="tr-chart-grid">
        <div className="tr-chart-card">
          <h6 className="tr-chart-title">Ustoz kesimida</h6>
          <div className="tr-chart-box">
            {teacherData.labels.length > 0 ? <Bar data={teacherData} options={commonOptions} /> : <p className="tr-empty-state">Ma'lumot yo'q</p>}
          </div>
        </div>

        <div className="tr-chart-card">
          <h6 className="tr-chart-title">Kurs kesimida</h6>
          <div className="tr-chart-box">
             {courseData.labels.length > 0 ? <Bar data={courseData} options={commonOptions} /> : <p className="tr-empty-state">Ma'lumot yo'q</p>}
          </div>
        </div>

        <div className="tr-chart-card">
          <h6 className="tr-chart-title">Oylik kesimida</h6>
          <div className="tr-chart-box">
             {monthlyData.labels.length > 0 ? <Bar data={monthlyData} options={commonOptions} /> : <p className="tr-empty-state">Ma'lumot yo'q</p>}
          </div>
        </div>

        <div className="tr-chart-card">
          <h6 className="tr-chart-title">Sabab kesimida</h6>
          <div className="tr-chart-box">
             {reasonData.labels.length > 0 ? <Bar data={reasonData} options={commonOptions} /> : <p className="tr-empty-state">Ma'lumot yo'q</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tarketganhisob;