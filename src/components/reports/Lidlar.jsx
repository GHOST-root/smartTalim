import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { reportsApi } from "../../api/reportsApi"; 
import "./reports.css"; // Yoki qaysi faylni ulasangiz

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const Lidlarhisob = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalLidlar, setTotalLidlar] = useState(0);

  // 🌟 STANDART SANALAR OLIB TASHLANDI 🌟
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pieData, setPieData] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState({ labels: [], datasets: [] });

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };

  const safeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.results || res.data || Object.values(res).find(Array.isArray) || [];
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Agar sana bo'sh bo'lsa, backendga jo'natilmaydi
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [pieRes, barRes, statsRes] = await Promise.all([
        reportsApi.leadsReport.getPieChart(params).catch(() => []),
        reportsApi.leadsReport.getBarChart(params).catch(() => []),
        reportsApi.leadsReport.getStatistics(params).catch(() => ({}))
      ]);

      // 1. Jami statistika
      const stats = statsRes?.data || statsRes?.results || statsRes || {};
      setTotalLidlar(stats.total_count || stats.total || stats.total_leads || statsRes?.total || 0);

      // 2. Pie Chart (Manbalar)
      const pieList = safeArray(pieRes);
      const pLabels = pieList.map(i => i.source || i.name || i.label || "Noma'lum");
      const pValues = pieList.map(i => i.count || i.total || i.value || 0);

      setPieData({
        labels: pLabels.length > 0 ? pLabels : ["Ma'lumot yo'q"],
        datasets: [{
          data: pValues.length > 0 ? pValues : [0],
          backgroundColor: ["#f59e0b", "#14532d", "#dc2626", "#4d7c0f", "#3b82f6", "#8b5cf6"],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      });

      // 3. Bar Chart (Oylar)
      const barList = safeArray(barRes);
      const bLabels = barList.map(i => i.month || i.date || i.label || "Noma'lum");
      const bValues = barList.map(i => i.count || i.total || i.value || 0);

      setBarData({
        labels: bLabels.length > 0 ? bLabels : ["Ma'lumot yo'q"],
        datasets: [{
          label: "Lidlar soni",
          data: bValues.length > 0 ? bValues : [0],
          backgroundColor: "#f87171",
          hoverBackgroundColor: "#ef4444",
          barThickness: 50
        }]
      });

    } catch (error) {
      console.error("Lidlar statistikasini yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCalculate = () => {
    fetchReports();
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 10, padding: 20 } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: false, boxWidth: 20 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' }, border: { display: false }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="lr-page-container">
      
      {/* 🌟 SARLAVHA 🌟 */}
      <div className="lr-header-row">
        <h2 className="lr-report-title">Lidlar hisobotlari</h2>
      </div>

      {/* 🌟 FILTRLAR VA SONLAR QUTISI 🌟 */}
      <div className="lr-top-panel">
        
        {/* Chap tomon: Lidlar soni */}
        <div className="lr-stats-info">
          <span className="lr-stats-label">Lidlar soni:</span>
          <span className="lr-stats-number">{totalLidlar}</span>
          
          {/* Faqat sanalar tanlangandagina oraliqni ko'rsatamiz */}
          {(startDate || endDate) && (
            <span className="lr-stats-date">
              ({formatDisplayDate(startDate) || "Boshlanish"} — {formatDisplayDate(endDate) || "Hozirgacha"})
            </span>
          )}
          <i className="fa-solid fa-coins lr-stats-icon"></i>
        </div>

        {/* O'ng tomon: Sanalar va Tugma */}
        <div className="lr-filter-actions">
            <input 
              type="date" 
              className="lr-date-input"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          
            <input 
              type="date" 
              className="lr-date-input"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          
          <button className="lr-calc-btn" onClick={handleCalculate}>
            Hisoblang
          </button>
        </div>

      </div>

      {/* 🌟 GRAFIKLAR 🌟 */}
      <div className="lr-charts-layout">
        
        {/* Chap panel: Pie Chart */}
        <div className="lr-chart-card" style={{ flex: '1' }}>
          {isLoading ? (
            <div className="lr-loading-state">Yuklanmoqda...</div>
          ) : pieData.labels.length > 0 && pieData.labels[0] !== "Ma'lumot yo'q" ? (
            <div style={{ height: '350px', width: '100%' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div className="lr-loading-state">Ma'lumot yo'q</div>
          )}
        </div>

        {/* O'ng panel: Bar Chart */}
        <div className="lr-chart-card" style={{ flex: '2' }}>
          {isLoading ? (
            <div className="lr-loading-state">Yuklanmoqda...</div>
          ) : barData.labels.length > 0 && barData.labels[0] !== "Ma'lumot yo'q" ? (
            <div style={{ height: '350px', width: '100%' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <div className="lr-loading-state">Ma'lumot yo'q</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Lidlarhisob;