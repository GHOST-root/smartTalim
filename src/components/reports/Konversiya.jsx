import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';
import { reportsApi } from '../../api/reportsApi'; 
import { dashboardApi } from '../../api/dashboardApi'; 
import "./reports.css"; 

const DateInputWithIcon = ({ date, setDate }) => {
    const dateInputRef = useRef(null); 
    const openDatePicker = () => {
        if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
            dateInputRef.current.showPicker();
        } else if (dateInputRef.current) {
            dateInputRef.current.focus();
        }
    };
    return (
        <div className="cr-date-filter-wrapper">
            <input 
                ref={dateInputRef} type="date" value={date} 
                onChange={(e) => setDate(e.target.value)} onClick={openDatePicker} 
                className="cr-custom-input cr-date-input" 
            />
            <i className="fa-regular fa-calendar-days cr-date-icon" onClick={openDatePicker}></i>
        </div>
    );
};

const MyFunnel = ({ data }) => (
  <ResponsiveFunnel
    data={data}
    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    valueFormat=">-.4s"
    colors={{ scheme: 'spectral' }}
    borderWidth={20}
    labelColor={{ from: 'color', modifiers: [['darker', 3]] }}
    shapeBlending={0.4}
    spacing={2}
  />
);

const conversionStages = [
  { id: 'sorov', label: 'Soʻrovlar' },
  { id: 'kutish', label: 'Kutish' },
  { id: 'toplam', label: 'Toʻplam' },
  { id: 'davomat', label: 'Davomat' },
  { id: 'toxtagan', label: 'Toʻlangan' },
];

const Konversiya = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // 🌟 SETTINGS MENYUSI VA TANLANADIGAN FILTRLAR 🌟
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState({
    dates: true,
    source: true,
    employee: true
  });

  const [startDate, setStartDate] = useState('2025-01-01'); 
  const [endDate, setEndDate] = useState('2025-12-31');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const [sourceOptions, setSourceOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const [funnelStats, setFunnelStats] = useState(conversionStages.map(s => ({ ...s, value: 0 })));
  const [activeStage, setActiveStage] = useState('sorov'); 
  const [tableData, setTableData] = useState([]);

  const safeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.results || res.data || Object.values(res).find(Array.isArray) || [];
  };

  // 🌟 1. MANBALAR VA XODIMLARNI API'DAN BIR MARTA YUKLASH 🌟
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sourceRes, empRes] = await Promise.all([
          reportsApi.conversionReports?.getBySource({}).catch(()=>[]),
          reportsApi.conversionReports?.getByEmployee({}).catch(()=>[])
        ]);
        const sData = safeArray(sourceRes);
        setSourceOptions([...new Set(sData.map(i => i.source || i.name || i.label).filter(Boolean))]);

        const eData = safeArray(empRes);
        setEmployeeOptions([...new Set(eData.map(i => i.employee || i.name || i.full_name).filter(Boolean))]);
      } catch (error) {
        console.error("Filtr ma'lumotlarini yuklashda xato:", error);
      }
    };
    fetchOptions();
  }, []);

  // 🌟 2. VORONKANI YUKLASH (Sanalar o'zgarganda) 🌟
  useEffect(() => {
    const fetchFunnel = async () => {
      setIsLoading(true);
      try {
        const params = { 
          start_date: startDate, end_date: endDate,
          source: selectedSource || undefined, employee: selectedEmployee || undefined
        };
        const funnelRes = await reportsApi.conversionReports?.getFunnel(params).catch(()=>[]);
        const fData = safeArray(funnelRes);
        
        const newFunnel = conversionStages.map(stage => {
          let val = 0;
          const found = fData.find(item => 
             (item.stage || item.name || item.id || '').toLowerCase().includes(stage.id.substring(0,3)) ||
             (item.label || '').toLowerCase() === stage.label.toLowerCase()
          );
          if (found) val = found.count || found.value || found.total || 0;
          return { ...stage, value: val };
        });
        setFunnelStats(newFunnel);
      } catch (error) {
        console.error("Voronkani yuklashda xato:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFunnel();
  }, [startDate, endDate, selectedSource, selectedEmployee]);

  // 🌟 3. JADVALNI YUKLASH 🌟
  useEffect(() => {
    const fetchStageTable = async () => {
      setIsTableLoading(true);
      try {
        const params = { 
          start_date: startDate, end_date: endDate,
          source: selectedSource || undefined, employee: selectedEmployee || undefined, status: activeStage
        };
        const leadsRes = await dashboardApi.leads?.getAll(params);
        const leadsArr = safeArray(leadsRes);
        const formattedTable = leadsArr.map(lead => ({
          id: lead.id,
          fio: lead.full_name || lead.name || 'Ismsiz',
          date: lead.created_at ? lead.created_at.split('T').join(' ').substring(0, 16) : '-',
          phone: lead.phone_number || lead.phone || '-',
          status: lead.status || activeStage,
          employee: lead.employee?.full_name || lead.assigned_to || 'Biriktirilmagan'
        }));
        setTableData(formattedTable);
      } catch (error) {
        console.error("Jadvalni yuklashda xato:", error);
      } finally {
        setIsTableLoading(false);
      }
    };
    fetchStageTable();
  }, [activeStage, startDate, endDate, selectedSource, selectedEmployee]);

  return (
    <div className="cr-page-container">
      
      {/* SARLAVHA */}
      <div className="cr-header-row">
        <h2 className="report-title">Konversiya hisobotlari</h2>
      </div>

      {/* FILTRLAR QUTISI */}
      <div className="cr-filter-container">
        
        <div className="cr-filter-inputs">
          {/* Sanalar */}
          {visibleFilters.dates && (
            <>
              <DateInputWithIcon date={startDate} setDate={setStartDate} />
              <DateInputWithIcon date={endDate} setDate={setEndDate} />
            </>
          )}

          {/* Manbalar */}
          {visibleFilters.source && (
            <select className="cr-custom-select" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}>
              <option value="">Barcha manbalar</option>
              {sourceOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
            </select>
          )}

          {/* Xodimlar */}
          {visibleFilters.employee && (
            <select className="cr-custom-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Barcha xodimlar</option>
              {employeeOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
            </select>
          )}
        </div>

        {/* ⚙️ SETTINGS TUGMASI VA DROPDOWN MENYU */}
        <div className="cr-settings-wrapper">
          <button 
            className={`cr-settings-btn ${isSettingsOpen ? 'active' : ''}`} 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Filtrlarni sozlash"
          >
            <i className="fa-solid fa-gear"></i>
          </button>

          {isSettingsOpen && (
            <div className="cr-settings-dropdown">
              <div className="cr-settings-dropdown-title">Ko'rsatiladigan filtrlar</div>
              
              <label className="cr-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={visibleFilters.dates} 
                  onChange={(e) => setVisibleFilters({...visibleFilters, dates: e.target.checked})} 
                />
                Sanalar
              </label>
              
              <label className="cr-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={visibleFilters.source} 
                  onChange={(e) => setVisibleFilters({...visibleFilters, source: e.target.checked})} 
                />
                Manbalar
              </label>
              
              <label className="cr-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={visibleFilters.employee} 
                  onChange={(e) => setVisibleFilters({...visibleFilters, employee: e.target.checked})} 
                />
                Xodimlar
              </label>
            </div>
          )}
        </div>

      </div>

      {/* ASOSIY KONTENT */}
      <div className="cr-content-layout">
        
        {/* Chap panel */}
        <div className="cr-left-panel">
          <div className="cr-card">
            <h5 className="cr-card-title">Konversiya bosqichlari</h5>
            <div className="cr-buttons-row">
              {conversionStages.map((stage) => (
                <button 
                  key={stage.id}
                  className={`cr-stage-btn ${activeStage === stage.id ? 'active' : ''}`} 
                  onClick={() => setActiveStage(stage.id)}
                >
                  {stage.label}
                </button>
              ))}
            </div>
            <div className="cr-divider"></div>
            <div className="cr-counts-row">
              {funnelStats.map((stat) => (
                <div className="cr-count-item" key={stat.id}>
                  {isLoading ? '...' : stat.value}
                </div>
              ))}
            </div>
          </div>

          <div className="cr-card flex-grow-1">
            <h6 className="cr-card-title">Batafsil ro'yxat <span className="cr-title-badge">({conversionStages.find(s => s.id === activeStage)?.label})</span></h6>
            <div className="cr-table-wrapper">
              <table className="cr-table">
                <thead>
                  <tr>
                    <th>FIO va Sana</th>
                    <th>Telefon</th>
                    <th>Holati</th>
                    <th>Xodim</th>
                  </tr>
                </thead>
                <tbody>
                  {isTableLoading ? (
                    <tr><td colSpan="4" className="cr-empty-state">Ma'lumotlar tortilmoqda...</td></tr>
                  ) : tableData.length > 0 ? (
                    tableData.map((user, index) => (
                      <tr key={index}>
                        <td>
                          <div className="cr-user-name">{user.fio}</div>
                          <div className="cr-user-date"><i className="fa-regular fa-clock"></i> {user.date}</div>
                        </td>
                        <td className="cr-user-phone">{user.phone}</td>
                        <td><span className="cr-status-badge">{user.status}</span></td>
                        <td className="cr-user-employee">{user.employee}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="cr-empty-state">Ushbu bosqichda ma'lumot topilmadi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* O'ng panel: Voronka Grafigi */}
        <div className="cr-right-panel cr-card">
          <h5 className="cr-card-title">Sotuv voronkasi</h5>
          <div style={{height: '450px'}}>
            {isLoading ? (
               <div className="cr-chart-loading">Grafik chizilmoqda...</div>
            ) : (
               <MyFunnel data={funnelStats} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Konversiya;