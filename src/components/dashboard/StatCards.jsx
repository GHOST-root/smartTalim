import React from 'react';

const StatCards = ({ dashboardStats, activeView, setActiveView }) => {
  
  // MANA SHU YERDA: statsData ro'yxati komponent ichida joylashgan
  const statsData = [
    { id: 'leads', title: 'Faol lidlar', count: dashboardStats.activeLeadsCount || 0, icon: 'fa-regular fa-user' },
    { id: 'active_students', title: 'Faol talabalar', count: dashboardStats.activeStudentsCount || 0, icon: 'fa-solid fa-graduation-cap' },
    { id: 'groups', title: 'Guruhlar', count: dashboardStats.groupsCount || 0, icon: 'fa-solid fa-layer-group' },
    { id: 'debtors', title: 'Qarzdorlar', count: dashboardStats.debtorsCount || 0, icon: 'fa-solid fa-triangle-exclamation' },
    { id: 'trial', title: 'Sinov darsida', count: dashboardStats.trialCount || 0, icon: 'fa-solid fa-desktop' },
    { id: 'paid', title: "Joriy oyda to'laganlar", count: dashboardStats.paidCount || 0, icon: 'fa-regular fa-handshake' },
    { id: 'left_active', title: 'Faol guruhni tark etganlar', count: dashboardStats.leftActiveCount || 0, icon: 'fa-solid fa-user-xmark' },
    { id: 'left_trial', title: 'Sinov muddatidan keyin ketdi', count: dashboardStats.leftTrialCount || 0, icon: 'fa-solid fa-users-slash' }
  ];

  return (
    <div className="stats-grid">
      {statsData.map((stat) => (
        <div 
          key={stat.id} 
          className={`stat-card ${activeView === stat.id ? 'active-stat-card' : ''}`} 
          onClick={() => setActiveView(prev => prev === stat.id ? null : stat.id)}
          style={{ 
            borderColor: activeView === stat.id ? '#F27A21' : '#eaeaea', 
            boxShadow: activeView === stat.id ? '0 8px 15px rgba(242, 122, 33, 0.15)' : 'none' 
          }}
        >
          <i className={`${stat.icon} stat-icon`}></i>
          <div className="stat-title">{stat.title}</div>
          <h3 className="stat-value">{stat.count}</h3>
        </div>
      ))}
    </div>
  );
};

export default StatCards;