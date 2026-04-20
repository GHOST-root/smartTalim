import React, { useState, useMemo, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import "./styles/lefttriallist.css"

const ExpandedLeftTrialList = ({ students, onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [leaveReasons, setLeaveReasons] = useState([]);

  // 🌟 FILTER STATE'LARI 🌟
  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  // 🌟 RESET FUNKSIYASI 🌟
  const handleResetFilters = () => {
    setStartDate("2025-05-01"); // Yoki bugungi sanani qo'yishingiz mumkin
    setEndDate("2025-05-10");
    setSearchQuery("");
    setSelectedCourse("");
    setSelectedGroup("");
    setSelectedTeacher("");
    setSelectedReason("");
  };

  // 🌟 API'DAN BARCHA MA'LUMOTLARNI BIR VAQTDA TORTIB KELISH 🌟
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [crsRes, grpRes, tchRes, lvrRes] = await Promise.all([
          dashboardApi.courses?.getAll().catch(() => []),
          dashboardApi.groups?.getAll().catch(() => []),
          dashboardApi.teachers?.getAll().catch(() => []),
          dashboardApi.leaveReasons?.getAll().catch(() => [])
        ]);

        // 🌟 KAFOLATLANGAN MASSIVLAR (Array.isArray orqali qat'iy tekshiruv) 🌟
        setCourses(Array.isArray(crsRes?.results) ? crsRes.results : (Array.isArray(crsRes) ? crsRes : []));
        setGroups(Array.isArray(grpRes?.results) ? grpRes.results : (Array.isArray(grpRes) ? grpRes : []));
        setTeachers(Array.isArray(tchRes?.results) ? tchRes.results : (Array.isArray(tchRes) ? tchRes : []));
        setLeaveReasons(Array.isArray(lvrRes?.results) ? lvrRes.results : (Array.isArray(lvrRes) ? lvrRes : []));

      } catch (error) {
        console.error("Filter ma'lumotlarini yuklashda xato:", error);
      }
    };
    fetchFilters();
  }, []);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        // Ichki obyektlarni o'qish uchun maxsus shartlar
        if (sortConfig.key === 'course') {
          aVal = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].course : 'Geografiya';
          bVal = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].course : 'Geografiya';
        } else if (sortConfig.key === 'group') {
          aVal = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].group : (a.groups || '');
          bVal = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].group : (b.groups || '');
        } else if (sortConfig.key === 'teacher') {
          aVal = a.enrollments && a.enrollments.length > 0 ? a.enrollments[0].teacher : (a.teacher || '');
          bVal = b.enrollments && b.enrollments.length > 0 ? b.enrollments[0].teacher : (b.teacher || '');
        } else if (sortConfig.key === 'archivedBy') {
          aVal = a.archivedBy || 'Behruz Berdiyev';
          bVal = b.archivedBy || 'Behruz Berdiyev';
        } else if (sortConfig.key === 'leaveReason') {
          aVal = a.leaveReason || 'Sababsiz';
          bVal = b.leaveReason || 'Sababsiz';
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

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
          <h5 className="m-0 text-dark fw-semibold">Sinov muddatidan keyin ketganlar <span className="text-muted fs-6 ms-2">Miqdor — {students.length}</span></h5>
        </div>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      {/* 🌟 YANGILANGAN FILTERLAR PANELI 🌟 */}
      <div className="custom-filter-grid">
        
        <input 
          className="custom-filter-input date-input" 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          className="custom-filter-input date-input" 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />

        <div className="search-wrapper filter-search">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Ism yoki telefon orqali..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="custom-filter-select" 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Kurs</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          className="custom-filter-select"
          value={selectedGroup} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Guruh</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>

        <select 
          className="custom-filter-select"
          value={selectedTeacher} 
          onChange={(e) => setSelectedTeacher(e.target.value)}
        >
          <option value="">O‘qituvchi</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.name || t.first_name}</option>)}
        </select>

        <select 
          className="custom-filter-select"
          value={selectedReason} 
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          <option value="">Arxivlash sabablari</option>
          {leaveReasons.map(r => <option key={r.id} value={r.id}>{r.name || r.reason || r.title}</option>)}
        </select>

        <div className="filter-actions">
          <button className="btn-filter-primary">Filtr</button>
          {/* 🌟 RESET TUGMASI 🌟 */}
          <button 
            className="btn-filter-reset" 
            title="Tozalash"
            onClick={handleResetFilters}
          >
            <i className="fa-solid fa-rotate-right"></i>
          </button>
        </div>

      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{fontSize: '13px'}}>
          <thead className="bg-light text-muted">
            <tr>
              <th style={{fontWeight: '500', width: '3%'}}>№</th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('name')}>Talaba <i className={getSortIcon('name')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('phone')}>Telefon <i className={getSortIcon('phone')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('course')}>Kurs <i className={getSortIcon('course')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('group')}>Guruh <i className={getSortIcon('group')}></i></th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('teacher')}>O'qituvchi <i className={getSortIcon('teacher')}></i></th>
              <th style={{fontWeight: '500', width: '8%'}}>Holati</th>
              <th style={{fontWeight: '500', width: '12%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('leaveReason')}>O'chirish sababi <i className={getSortIcon('leaveReason')}></i></th>
              <th style={{fontWeight: '500', width: '7%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('note')}>Izoh <i className={getSortIcon('note')}></i></th>
              <th style={{fontWeight: '500', width: '10%', cursor: 'pointer', userSelect: 'none'}} onClick={() => requestSort('archivedBy')}>Xodim <i className={getSortIcon('archivedBy')}></i></th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length > 0 ? sortedStudents.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td className="fw-medium" style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.name}</td>
                <td className="fw-medium text-primary">{student.phone}</td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments[0].course : 'Geografiya'}
                </td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments[0].group : student.groups}
                </td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>
                  {student.enrollments && student.enrollments.length > 0 ? student.enrollments[0].teacher : student.teacher}
                </td>
                <td>Sinov darsida</td>
                <td className="text-muted">{student.leaveReason || 'Sababsiz'}</td>
                <td className="text-muted">{student.note}</td>
                <td>
                  <div style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.archivedBy || 'Behruz Berdiyev'}</div>
                  <div className="text-muted" style={{fontSize: '11px'}}>{student.archivedDate || '08:43 / 10.05.2025'}</div>
                </td>
              </tr>
            )) : <tr><td colSpan="10" className="text-center py-5 text-muted">Sinov muddatidan keyin ketgan o'quvchilar yo'q.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedLeftTrialList;