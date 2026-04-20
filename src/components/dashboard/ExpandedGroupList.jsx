import React, { useState } from 'react';

const ExpandedGroupsList = ({ groups = [], onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // useMemo o'rniga oddiy saralash funksiyasi (Qotib qolishni oldini oladi)
  const getSortedGroups = () => {
    if (!groups || !Array.isArray(groups)) return [];
    let sortableItems = [...groups];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const sortedGroups = getSortedGroups();

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "fa-solid fa-sort ms-1 text-muted opacity-25";
    return sortConfig.direction === 'asc' ? "fa-solid fa-sort-up ms-1 text-primary" : "fa-solid fa-sort-down ms-1 text-primary";
  };

  return (
    <div className="dashboard-card mb-4" style={{ animation: 'fadeInDown 0.3s ease' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <div>
          <h5 className="m-0 text-dark fw-semibold">Faol guruhlar ro'yxati</h5>
          <span className="text-muted small">Miqdor: {groups.length} ta guruh</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '13px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{fontWeight: '500', width: '3%'}}>№</th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer'}} onClick={() => requestSort('name')}>Guruh <i className={getSortIcon('name')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer'}} onClick={() => requestSort('course')}>Kurslar <i className={getSortIcon('course')}></i></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer'}} onClick={() => requestSort('teacher')}>O'qituvchi <i className={getSortIcon('teacher')}></i></th>
              <th style={{fontWeight: '500', width: '10%'}}>Kunlar</th>
              <th style={{fontWeight: '500', width: '15%'}}>Mashg'ulotlar sanalari</th>
              <th style={{fontWeight: '500', width: '10%'}}>O'tilgan muddat</th>
              <th style={{fontWeight: '500', width: '10%', cursor: 'pointer'}} onClick={() => requestSort('room')}>Xonalar <i className={getSortIcon('room')}></i></th>
              <th style={{fontWeight: '500', width: '5%', cursor: 'pointer'}} onClick={() => requestSort('studentsCount')} className="text-center">Talabalar <i className={getSortIcon('studentsCount')}></i></th>
            </tr>
          </thead>
          <tbody>
            {sortedGroups.length > 0 ? sortedGroups.map((group, index) => (
              <tr key={group.id} style={{ cursor: 'pointer' }}>
                <td className="text-muted">{index + 1}.</td>
                <td className="fw-medium text-dark">{group.name}</td>
                <td>{group.course}</td>
                <td className="text-primary">{group.teacher}</td>
                <td style={{ whiteSpace: 'pre-line' }}>{group.days}</td>
                <td className="text-muted" style={{ whiteSpace: 'pre-line' }}>{group.dates}</td>
                <td style={{ whiteSpace: 'pre-line' }}>{group.duration}</td>
                <td><span className="badge bg-light text-dark border">{group.room}</span></td>
                <td className="text-center fw-medium">{group.studentsCount}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">Hozircha guruhlar yo'q.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedGroupsList;