import React, { useState, useEffect, useMemo } from 'react';
import './dashboard.css';
import "./styles/lefttriallist.css"
import { dashboardApi } from '../../api/dashboardApi';

const ExpandedLeftActiveList = ({ students = [], onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Propdan kelgan talabalarni boshlang'ich qiymat sifatida olamiz
  const [localStudents, setLocalStudents] = useState(students);
  const [isFiltering, setIsFiltering] = useState(false);

  // 🌟 FILTERLAR UCHUN KERAKLI STATE'LAR (BULAR TUSHIB QOLGAN EDI) 🌟
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [leaveReasons, setLeaveReasons] = useState([]);

  const [startDate, setStartDate] = useState("2025-05-01");
  const [endDate, setEndDate] = useState("2025-05-10");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  // 🌟 API'DAN SELECTLAR UCHUN MA'LUMOTLARNI TORTIB KELISH 🌟
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [crsRes, grpRes, tchRes, lvrRes] = await Promise.all([
          dashboardApi.courses?.getAll().catch(() => []),
          dashboardApi.groups?.getAll().catch(() => []),
          dashboardApi.teachers?.getAll().catch(() => []),
          dashboardApi.leaveReasons?.getAll().catch(() => [])
        ]);

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

  // 🌟 API ORQALI FILTRLASH 🌟
  const handleFilter = async () => {
    setIsFiltering(true);
    try {
      // Backendga yuboriladigan parametrlarni yig'ish (faqat tanlanganlari ketadi)
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchQuery) params.search = searchQuery; // Backend 'search' yoki 'q' kutishiga qarab o'zgartirasiz
      if (selectedCourse) params.course = selectedCourse;
      if (selectedGroup) params.group = selectedGroup;
      if (selectedTeacher) params.teacher = selectedTeacher;
      if (selectedReason) params.leave_reason = selectedReason;

      // API'ga so'rov (dashboardApi dagi studentLeaves endpointi orqali)
      const res = await dashboardApi.studentLeaves?.getAll(params);
      
      // Kelgan javobni kafolatlangan massiv qilib jadval state'iga yozamiz
      const filteredData = Array.isArray(res?.results) ? res.results : (Array.isArray(res) ? res : []);
      setLocalStudents(filteredData);
    } catch (error) {
      console.error("Filtrlashda xato yuz berdi:", error);
    } finally {
      setIsFiltering(false);
    }
  };

  // 🌟 RESET FUNKSIYASINI YANGILASH 🌟
  const handleResetFilters = () => {
    setStartDate(""); 
    setEndDate("");
    setSearchQuery("");
    setSelectedCourse("");
    setSelectedGroup("");
    setSelectedTeacher("");
    setSelectedReason("");
    
    // Tozalash bosilganda jadvalni yana propdan kelgan asl holatiga qaytarish
    setLocalStudents(students); 
  };

  // useMemo o'rniga oddiy xavfsiz saralash
  const getSortedStudents = () => {
    if (!students || !Array.isArray(students)) return [];
    
    let sortableItems = [...students];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  };

  const sortedStudents = useMemo(() => {
      let sortableItems = [...localStudents];
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
          <h5 className="m-0 text-dark fw-semibold">Guruhni tark etgan o'quvchilar <span className="text-muted fs-6 ms-2">Miqdor — {students.length}</span></h5>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
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
              <tr key={student.id || index}>
                <td>{index + 1}</td>
                <td className="fw-medium" style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.name}</td>
                <td className="fw-medium text-primary">{student.phone}</td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.course}</td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.group}</td>
                <td style={{color: '#0EA5E9', cursor: 'pointer'}}>{student.teacher}</td>
                <td><span className="badge bg-light text-dark border">Tark etgan</span></td>
                <td className="text-danger small fw-bold">{student.leaveReason}</td>
                <td className="text-muted text-truncate" style={{maxWidth: '80px'}} title={student.note}>{student.note}</td>
                <td>
                  <div style={{color: '#0EA5E9', cursor: 'pointer', fontSize: '12px'}}>{student.archivedBy}</div>
                  <div className="text-muted" style={{fontSize: '11px'}}>{student.archivedDate}</div>
                </td>
              </tr>
            )) : <tr><td colSpan="10" className="text-center py-5 text-muted">Guruhni tark etgan o'quvchilar yo'q.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpandedLeftActiveList;