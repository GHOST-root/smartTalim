import React, { useState } from 'react';

const ExpandedPaidList = ({ students = [], onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const formatMoney = (amount) => new Intl.NumberFormat('ru-RU').format(amount) + ' UZS';

  // useMemo olib tashlandi, o'rniga xavfsiz oddiy funksiya
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
          <h5 className="m-0 text-dark fw-semibold">Joriy oyda to'lov qilgan talabalar</h5>
          <span className="text-muted small">Miqdor: {students.length} ta to'lov</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '14px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{fontWeight: '500', width: '25%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('name')}>Ism va Familiya <i className={getSortIcon('name')}></i></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('phone')}>Telefon raqami <i className={getSortIcon('phone')}></i></th>
              <th style={{fontWeight: '500', width: '30%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('group')}>Guruh <i className={getSortIcon('group')}></i></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('paymentAmount')}>To'lov summasi <i className={getSortIcon('paymentAmount')}></i></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('paymentDate')}>Sana <i className={getSortIcon('paymentDate')}></i></th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? sortedStudents.map((student, index) => (
              <tr key={student.id || index}>
                <td className="fw-medium text-dark">{student.name}</td>
                <td className="text-primary">{student.phone}</td>
                <td>
                  {student.enrollments && student.enrollments.length > 0 
                    ? <><span className="badge bg-light text-secondary border me-1">{student.enrollments[0].group}</span> {student.enrollments[0].course}</>
                    : <span className="badge bg-light text-secondary border">{student.groups}</span>}
                </td>
                <td className="text-success fw-medium">{formatMoney(student.paymentAmount)}</td>
                <td className="text-muted"><i className="fa-regular fa-calendar me-2"></i>{student.paymentDate}</td>
              </tr>
            )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Hozircha to'lovlar yo'q.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedPaidList;