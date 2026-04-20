import React, { useState, useMemo } from 'react';

const ExpandedList = ({ students, onClose, title = "Faol talabalar ro'yxati" }) => {
  // 1. Saralash holatini ushlab turuvchi State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 2. Pul formatlash yordamchisi
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' UZS';
  };

  // 3. Ma'lumotlarni saralash mantig'i
  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Guruh ustuni uchun maxsus tekshiruv (chunki u obyekt ichida kelishi mumkin)
        if (sortConfig.key === 'group') {
          aValue = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].group : (a.groups || '');
          bValue = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].group : (b.groups || '');
        }

        // Kichik yoki kattaligini solishtirish
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

  // 4. Ustun bosilganda ishlash
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 5. Ikonkani dinamik o'zgartirish
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return "fa-solid fa-sort ms-2 text-muted opacity-25";
    return sortConfig.direction === 'asc' 
      ? "fa-solid fa-sort-up ms-2 text-primary" 
      : "fa-solid fa-sort-down ms-2 text-primary";
  };

  return (
    <div className="dashboard-card mb-4" style={{ animation: 'fadeInDown 0.3s ease' }}>
      
      {/* Tepa qism */}
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <div>
          <h5 className="m-0 text-dark fw-semibold">{title}</h5>
          <span className="text-muted small">Miqdor: {students.length} ta talaba</span>
        </div>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      
      {/* Jadval qismi */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '14px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{fontWeight: '500', width: '5%'}}>№</th>
              
              <th 
                style={{fontWeight: '500', width: '25%', cursor: 'pointer', userSelect: 'none'}}
                onClick={() => requestSort('name')}
              >
                Ism va Familiya <i className={getSortIcon('name')}></i>
              </th>
              
              <th 
                style={{fontWeight: '500', width: '20%', cursor: 'pointer', userSelect: 'none'}}
                onClick={() => requestSort('phone')}
              >
                Telefon raqami <i className={getSortIcon('phone')}></i>
              </th>
              
              <th 
                style={{fontWeight: '500', width: '30%', cursor: 'pointer', userSelect: 'none'}}
                onClick={() => requestSort('group')}
              >
                Guruh <i className={getSortIcon('group')}></i>
              </th>
              
              <th 
                style={{fontWeight: '500', width: '20%', cursor: 'pointer', userSelect: 'none'}}
                onClick={() => requestSort('balance')}
              >
                Balans <i className={getSortIcon('balance')}></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? sortedStudents.map((student, index) => (
              <tr key={student.id || index}>
                <td className="text-muted">{index + 1}</td>
                <td className="fw-medium text-dark">{student.name}</td>
                <td className="text-primary">{student.phone}</td>
                
                {/* Guruh qismi */}
                <td>
                  {student.enrollments && student.enrollments.length > 0 
                    ? <><span className="badge bg-light text-secondary border me-1">{student.enrollments[0].group}</span> {student.enrollments[0].course}</>
                    : <span className="badge bg-light text-secondary border">{student.groups || 'Guruhsiz'}</span>
                  }
                </td>
                
                {/* Balans qismi */}
                <td className={student.balance < 0 ? "text-danger fw-medium" : "text-success fw-medium"}>
                  {formatMoney(student.balance || 0)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted">
                  Hozircha talabalar yo'q.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedList;