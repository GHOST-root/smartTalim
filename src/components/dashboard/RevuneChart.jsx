import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// PROPS QO'SHILDI: chartLabels va chartValues
const RevenueChart = ({ chartLabels = [], chartValues = [] }) => {
  
  // Agar API dan ma'lumot kelguncha bo'sh bo'lsa, vaqtincha (fallback) shularni ko'rsatib turadi
  const displayLabels = chartLabels.length > 0 ? chartLabels : ['Kutilmoqda...'];
  const displayData = chartValues.length > 0 ? chartValues : [0];

  const chartData = {
    labels: displayLabels,
    datasets: [
      {
        fill: true,
        data: displayData,
        borderColor: '#F27A21',
        backgroundColor: 'rgba(242, 122, 33, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#F27A21',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { 
        beginAtZero: true, 
        border: { display: false }, 
        grid: { color: '#f0f0f0' }, 
        // Summani ixcham (masalan: 1.5M, 500K) qilib ko'rsatish
        ticks: { 
            callback: (val) => {
                if (val >= 1000000) return (val / 1000000) + 'M';
                if (val >= 1000) return (val / 1000) + 'K';
                return val;
            }
        } 
      },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="dashboard-card" style={{ height: '350px', maxWidth: '1200px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default RevenueChart;