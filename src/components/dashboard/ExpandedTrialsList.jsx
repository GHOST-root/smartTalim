import React, { useState } from 'react';

const ExpandedTrialList = ({ students = [], onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // useMemo olib tashlandi, o'rniga oddiy xavfsiz funksiya qo'yildi
  const getSortedStudents = () => {
    if (!students || !Array.isArray(students)) return [];
    
    let sortableItems = [...students];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'group') {
          aVal = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].group : (a.groups || '');
          bVal = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].group : (b.groups || '');
        } else if (sortConfig.key === 'teacher') {
          aVal = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].teacher : (a.teacher || '');
          bVal = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].teacher : (b.teacher || '');
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const sortedStudents = getSortedStudents();

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
          <h5 className="m-0 text-dark fw-semibold">Sinov darsidagi talabalar ro'yxati</h5>
          <span className="text-muted small">Miqdor: {students.length} ta</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '14px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{fontWeight: '500', width: '25%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('name')}>Ism va Familiya <i className={getSortIcon('name')}></i></th>
              <th style={{fontWeight: '500', width: '20%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('phone')}>Telefon raqami <i className={getSortIcon('phone')}></i></th>
              <th style={{fontWeight: '500', width: '30%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('group')}>Guruh va Kursi <i className={getSortIcon('group')}></i></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('teacher')}>O'qituvchisi <i className={getSortIcon('teacher')}></i></th>
              <th style={{fontWeight: '500', width: '10%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('status')}>Holati <i className={getSortIcon('status')}></i></th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? sortedStudents.map(student => (
              <tr key={student.id}>
                <td className="fw-medium text-dark">{student.name}</td>
                <td className="text-primary">{student.phone}</td>
                <td>
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments.map((enr, i) => (
                    <div key={i} className="mb-1"><span className="badge bg-light text-secondary border me-1">{enr.group}</span> {enr.course}</div>
                  )) : <div><span className="badge bg-light text-secondary border me-1">{student.groups}</span></div>}
                </td>
                <td>
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments.map((enr, i) => (
                    <div key={i} className="mb-1">{enr.teacher}</div>
                  )) : student.teacher}
                </td>
                {/* Statusni chiroyli ko'rsatish */}
                <td><span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3">{student.status === 'trial' ? 'Sinovda' : student.status}</span></td>
              </tr>
            )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Hozircha sinov darsida talabalar yo'q.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedTrialList;