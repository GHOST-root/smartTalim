import React, { useState } from 'react';

const ExpandedDebtorsList = ({ debtors = [], onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const formatMoney = (amount) => new Intl.NumberFormat('ru-RU').format(amount) + ' UZS';

  // useMemo olib tashlandi, o'rniga oddiy funksiya
  const getSortedDebtors = () => {
    if (!debtors || !Array.isArray(debtors)) return [];
    
    let sortableItems = [...debtors];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';

        if (sortConfig.key === 'group') {
          aValue = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].group : (a.groups || '');
          bValue = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].group : (b.groups || '');
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const sortedDebtors = getSortedDebtors();
  
  // Qarzlar summasini hisoblash
  const totalDebt = sortedDebtors.reduce((sum, student) => sum + Number(student.balance), 0);

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="m-0 text-dark fw-semibold">Qarzdorlar <span className="text-muted fs-6 ms-2">Miqdor — {debtors.length} ta</span></h5>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>

      <div className="d-flex flex-column gap-3 mb-4">
        <div className="p-3 bg-light rounded-3 border-start border-info border-4 d-flex justify-content-between align-items-center">
          <span className="fs-6 text-dark fw-medium">Jami qarz summasi: <span className="text-danger">{formatMoney(totalDebt)}</span></span>
          <i className="fa-solid fa-coins text-info fs-5"></i>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '13px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{width: '3%'}}><input type="checkbox" /></th>
              <th style={{fontWeight: '500', width: '15%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('name')}>Ism <i className={getSortIcon('name')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('phone')}>Telefon <i className={getSortIcon('phone')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('balance')}>Balans <i className={getSortIcon('balance')}></i></th>
              <th style={{fontWeight: '500', width: '12%'}}>Davr bo'yicha jami</th>
              <th style={{fontWeight: '500', width: '25%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('group')}>Guruh <i className={getSortIcon('group')}></i></th>
              <th style={{fontWeight: '500', width: '10%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('note')}>Izoh <i className={getSortIcon('note')}></i></th>
              <th style={{fontWeight: '500', width: '5%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('status')}>Holati <i className={getSortIcon('status')}></i></th>
              <th style={{fontWeight: '500', width: '6%'}}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {sortedDebtors.length > 0 ? sortedDebtors.map((student) => (
              <tr key={student.id} style={{ cursor: 'pointer' }}>
                <td><input type="checkbox" /></td>
                <td className="fw-medium text-dark">{student.name}</td>
                <td className="text-muted">{student.phone}</td>
                {/* Qarz qizil rangda chiqishi uchun */}
                <td className="text-danger fw-bold">{formatMoney(student.balance)}</td>
                <td className="text-danger">{formatMoney(student.balance)}</td>
                <td className="text-muted">
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments.map((enr, i) => (
                    <div key={i} className="mb-1 text-truncate" style={{maxWidth: '250px'}}>
                      <span className="badge bg-light text-secondary border me-1">{enr.group}</span>
                      {enr.course} ({enr.teacher})
                    </div>
                  )) : (
                    <div><span className="badge bg-light text-secondary border me-1">{student.groups}</span> {student.teacher}</div>
                  )}
                </td>
                <td className="text-muted text-truncate" style={{maxWidth: '100px'}} title={student.note}>{student.note}</td>
                <td>
                  <div style={{width: '20px', height: '20px', borderRadius: '50%', backgroundColor: student.status === 'Faol' || student.status === 'active' ? '#10B981' : '#9CA3AF'}}></div>
                </td>
                <td>
                  <div className="d-flex gap-2 text-warning fs-6">
                    <i className="fa-regular fa-clock cursor-pointer" title="Eslatma qo'shish"></i>
                    <i className="fa-regular fa-flag cursor-pointer" title="Belgilash"></i>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">Qarzdorlar topilmadi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedDebtorsList;