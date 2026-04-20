import React, { useState, useMemo, useEffect } from "react";
import { dashboardApi } from "../../api/dashboardApi"; // Guruhlar va talabalar uchun
import { reportsApi } from "../../api/reportsApi"; // Filiallar uchun
import './darslar.css';

export default function Darslar() {
  const [allStudents, setAllStudents] = useState([]);
  const [groupsList, setGroupsList] = useState([]); 
  const [branchesList, setBranchesList] = useState([]); // 🌟 Filiallar (Organizations) uchun yangi State
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. INPUT DAGI FILTRLAR
  const [filterInputs, setFilterInputs] = useState({
    dateFrom: "2025-01-01",
    dateTo: "2025-12-31",
    filial: "",
    guruh: ""
  });

  // 2. ASOSIY FILTRLAR (Tugma bosilganda ishlaydi)
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: "2025-01-01",
    dateTo: "2025-12-31",
    filial: "",
    guruh: ""
  });

  // 3. STATISTIKADAN TANLANGAN FILTR
  const [activeStatFilter, setActiveStatFilter] = useState("Barchasi");

  const safeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.results || res.data || Object.values(res).find(Array.isArray) || [];
  };

  // 🌟 Guruhlar va Filiallarni bir vaqtda API dan yuklaymiz
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [groupsRes, branchesRes] = await Promise.all([
          dashboardApi.groups.getAll(),
          reportsApi.organizations.getAll() // Filiallarni tortyapmiz
        ]);
        setGroupsList(safeArray(groupsRes));
        setBranchesList(safeArray(branchesRes));
      } catch (error) {
        console.error("Filtr ma'lumotlarini yuklashda xato:", error);
      }
    };
    fetchFiltersData();
  }, []);

  // FILTR BOSILGANDA MA'LUMOTLARNI TORTISH
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      try {
        const params = { 
          start_date: appliedFilters.dateFrom, 
          end_date: appliedFilters.dateTo,
          group_id: appliedFilters.guruh || undefined,
          organization_id: appliedFilters.filial || undefined // 🌟 Filial ID sini yuboramiz
        };

        const res = await dashboardApi.students.getAll(params);
        const studentsData = safeArray(res);

        const enrichedData = studentsData.map(student => {
          let presentCount = 0;
          let absentCount = 0;
          let squares = []; 

          const attData = student.attendance_records || student.attendance || student.lessons || [];

          if (Array.isArray(attData)) {
            attData.forEach(record => {
              const status = record.status || record.attendance_type || (record.is_present ? 'present' : 'absent');
              const isPresent = ['present', 'yes', 'kelgan', 'true', true, 1].includes(status);
              const isAbsent = ['absent', 'no', 'kelmagan', 'false', false, 0].includes(status);

              if (isPresent) { presentCount++; squares.push('present'); }
              else if (isAbsent) { absentCount++; squares.push('absent'); }
              else { squares.push('none'); }
            });
          } else if (typeof attData === 'object' && Object.keys(attData).length > 0) {
            Object.values(attData).forEach(status => {
              if (status === 'present') { presentCount++; squares.push('present'); }
              else if (status === 'absent') { absentCount++; squares.push('absent'); }
              else { squares.push('none'); }
            });
          }

          let attCategory = "Belgilanmagan"; 
          if (presentCount > 0) {
            attCategory = "Kelgan";
          } else if (absentCount > 0 && presentCount === 0) {
            attCategory = "Kelmagan";
          }

          return { 
            id: student.id || student.uuid,
            ism: student.full_name || student.first_name || 'Ismsiz',
            holati: student.status || 'Aktiv', 
            guruh: student.group?.name || student.group_name || (student.enrollments && student.enrollments[0]?.group) || 'Guruhsiz',
            attCategory, 
            squares 
          };
        });

        setAllStudents(enrichedData);
      } catch (error) {
        console.error("Davomatni yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [appliedFilters]);


  const stats = useMemo(() => {
    return {
      kelgan: allStudents.filter(s => s.attCategory === "Kelgan").length,
      kelmagan: allStudents.filter(s => s.attCategory === "Kelmagan").length,
      belgilanmagan: allStudents.filter(s => s.attCategory === "Belgilanmagan").length,
      jami: allStudents.length,
      aktiv: allStudents.filter(s => s.holati === "Aktiv" || s.holati === "active").length,
      demo: allStudents.filter(s => s.holati === "Demo" || s.holati === "trial").length,
      muzlatilgan: allStudents.filter(s => s.holati === "Muzlatilgan" || s.holati === "frozen").length
    };
  }, [allStudents]);

  const finalTableData = useMemo(() => {
    if (activeStatFilter === "Barchasi") return allStudents;
    
    if (["Kelgan", "Kelmagan", "Belgilanmagan"].includes(activeStatFilter)) {
      return allStudents.filter(s => s.attCategory === activeStatFilter);
    }
    
    return allStudents.filter(s => {
      const h = s.holati.toLowerCase();
      if (activeStatFilter === "Aktiv") return h === "aktiv" || h === "active";
      if (activeStatFilter === "Demo") return h === "demo" || h === "trial";
      if (activeStatFilter === "Muzlatilgan") return h === "muzlatilgan" || h === "frozen";
      return true;
    });
  }, [allStudents, activeStatFilter]);

  const applyFilter = () => {
    setAppliedFilters(filterInputs);
    setActiveStatFilter("Barchasi"); 
  };

  const clearFilter = () => {
    const defaultF = { dateFrom: "2025-01-01", dateTo: "2025-12-31", filial: "", guruh: "" };
    setFilterInputs(defaultF);
    setAppliedFilters(defaultF);
    setActiveStatFilter("Barchasi");
  };

  return (
    <div className="darslar-wrapper">
      <div className="darslar-layout">
        
        {/* 🌟 CHAP TOMON: ASOSIY MA'LUMOTLAR 🌟 */}
        <div className="darslar-main">
          
          {/* STATISTIKA QUTISI */}
          <div className="darslar-card">
            <h4 className="darslar-card-title">Darsga kelish hisobotlari</h4>
            
            <div className="stats-wrapper">
              <div className="stats-col border rounded-2 overflow-hidden">
                <table className="stats-table w-100 mb-0">
                  <tbody>
                    <tr className={`stat-item ${activeStatFilter === "Kelgan" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Kelgan")}>
                      <td className="p-3 border-bottom text-muted">Kelgan talabalar (eng kami bir marta)</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.kelgan}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Kelmagan" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Kelmagan")}>
                      <td className="p-3 border-bottom text-muted">Kelmagan (martadan ko'p)</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.kelmagan}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Belgilanmagan" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Belgilanmagan")}>
                      <td className="p-3 border-bottom text-muted">Davomat belgilanmagan</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.belgilanmagan}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Barchasi" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Barchasi")} style={{backgroundColor: '#f8fafc'}}>
                      <td className="p-3 text-dark fw-medium">Barchasi</td>
                      <td className="p-3 stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.jami}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="stats-col border rounded-2 overflow-hidden">
                <table className="stats-table w-100 mb-0">
                  <tbody>
                    <tr className={`stat-item ${activeStatFilter === "Aktiv" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Aktiv")}>
                      <td className="p-3 border-bottom text-muted">Aktiv</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.aktiv}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Demo" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Demo")}>
                      <td className="p-3 border-bottom text-muted">Demo</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.demo}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Muzlatilgan" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Muzlatilgan")}>
                      <td className="p-3 border-bottom text-muted">Muzlatilgan</td>
                      <td className="p-3 border-bottom stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.muzlatilgan}</td>
                    </tr>
                    <tr className={`stat-item ${activeStatFilter === "Barchasi" ? "active-stat" : ""}`} onClick={() => setActiveStatFilter("Barchasi")} style={{backgroundColor: '#f8fafc'}}>
                      <td className="p-3 text-dark fw-medium">Barchasi</td>
                      <td className="p-3 stat-count fw-bold text-end text-dark">{isLoading ? '...' : stats.jami}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* JADVAL QUTISI */}
          <div className="darslar-card" style={{minHeight: '400px'}}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
               <h4 className="darslar-card-title m-0 border-0 p-0">Ro'yxat <span className="text-muted fw-normal fs-6">({activeStatFilter})</span></h4>
               <span className="badge bg-light text-dark border px-3 py-2">{finalTableData.length} ta natija</span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{fontSize: '14px'}}>
                <thead className="bg-light text-muted">
                  <tr>
                    <th style={{fontWeight: '500', width: '30%'}}>Ism <i className="fa-solid fa-sort ms-1 opacity-50"></i></th>
                    <th style={{fontWeight: '500', width: '25%'}}>Holati <i className="fa-solid fa-sort ms-1 opacity-50"></i></th>
                    <th style={{fontWeight: '500', width: '25%'}}>Guruh <i className="fa-solid fa-sort ms-1 opacity-50"></i></th>
                    <th style={{fontWeight: '500', width: '20%'}}>Davomat <i className="fa-solid fa-sort ms-1 opacity-50"></i></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                     <tr><td colSpan="4" className="text-center py-5 text-primary">Yuklanmoqda...</td></tr>
                  ) : finalTableData.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-5 text-muted"><i className="fa-regular fa-folder-open fs-2 mb-2 opacity-50 d-block"></i>Ushbu shartlarga mos ma'lumot topilmadi</td></tr>
                  ) : (
                    finalTableData.map(student => (
                      <tr key={student.id}>
                        <td className="fw-medium text-primary cursor-pointer">{student.ism}</td>
                        <td>
                           <span className={`badge ${student.holati === 'Aktiv' || student.holati === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} px-3 py-1 rounded-pill`}>
                             {student.holati}
                           </span>
                        </td>
                        <td className="text-dark fw-medium">{student.guruh}</td>
                        <td>
                          <div className="d-flex gap-1">
                            {student.squares.length === 0 && <span className="text-muted small">Yo'q</span>}
                            {student.squares.map((status, i) => (
                              <div 
                                key={i} 
                                style={{
                                  width: '12px', height: '12px', borderRadius: '3px',
                                  backgroundColor: status === 'present' ? '#22c55e' : (status === 'absent' ? '#ef4444' : '#e2e8f0')
                                }} 
                                title={status === 'present' ? 'Kelgan' : (status === 'absent' ? 'Kelmagan' : 'Belgilanmagan')}
                              ></div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🌟 O'NG TOMON: YON PANEL (FILTR) 🌟 */}
        <div className="darslar-sidebar">
          <div className="darslar-card sticky-sidebar">
            <h4 className="darslar-card-title">Filtr</h4>
            
            <div className="mb-3">
              <label className="darslar-label">Sanadan boshlab</label>
              <input type="date" className="darslar-input" value={filterInputs.dateFrom} onChange={(e) => setFilterInputs({...filterInputs, dateFrom: e.target.value})} />
            </div>

            <div className="mb-3">
              <label className="darslar-label">Sana gacha</label>
              <input type="date" className="darslar-input" value={filterInputs.dateTo} onChange={(e) => setFilterInputs({...filterInputs, dateTo: e.target.value})} />
            </div>

            <div className="mb-3">
              <label className="darslar-label">Filiallar</label>
              <select className="darslar-select" value={filterInputs.filial} onChange={(e) => setFilterInputs({...filterInputs, filial: e.target.value})}>
                <option value="">Barcha filiallar</option>
                {branchesList.map(branch => (
                  <option key={branch.id || branch.uuid} value={branch.id || branch.uuid}>
                    {branch.name || branch.title || 'Nomsiz filial'}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="darslar-label">Guruh</label>
              <select className="darslar-select" value={filterInputs.guruh} onChange={(e) => setFilterInputs({...filterInputs, guruh: e.target.value})}>
                <option value="">Barchasi</option>
                {groupsList.map(g => (
                  <option key={g.id || g.uuid} value={g.id || g.uuid}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn-darslar-reset" onClick={clearFilter}>Tozalash</button>
              <button className="btn-darslar-primary" onClick={applyFilter}>Filtr</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}