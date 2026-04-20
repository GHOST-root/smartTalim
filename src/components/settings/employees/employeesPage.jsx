import React, { useState, useRef, useEffect } from 'react';
import '../styles/staff.css';
import AddEmployeeDrawer from './addEmployeeDrawer';
import SmsDrawer from './smsDrawer';
import DeleteModal from './deleteModal';
import { employeesApi } from '../../../api/employeesApi';

const EmployeesPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modallar va Drawerlarni boshqarish
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Tahrirlash uchun state
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [approveId, setApproveId] = useState(null); 
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeesApi.getTeachers();
      setUsers(data.results || data || []); 
    } catch (error) {
      console.error("Xodimlarni yuklashda xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 YECHIM: Tasdiqlash logikasi (Ekranda darhol o'zgaradi)
  const confirmApprove = async () => {
    if (!approveId) return;
    
    try {
      await employeesApi.updateTeacher(approveId, { is_approved: true });
      
      // 🌟 ASOSIY QISM: Backendni kutib o'tirmay, ekranda o'sha zahoti holatni o'zgartirib qo'yamiz
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === approveId ? { ...u, is_approved: true } : u
        )
      );
      
      setApproveId(null); 
      
      setToastMessage({ type: 'success', text: "Xodim muvaffaqiyatli tasdiqlandi!" });
      setTimeout(() => setToastMessage(null), 3000);
      
    } catch (error) {
      console.error("Tasdiqlashda xato:", error);
      setApproveId(null);
      setToastMessage({ type: 'error', text: "Tasdiqlashda xatolik yuz berdi." });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const importFileRef = useRef(null);

  const handleDeleteClick = (employeeId) => {
    console.log("🗑 O'chirish bosildi! Kelgan ID:", employeeId);
    setDeleteId(employeeId);
    console.log("🔄 State (deleteId) quyidagiga o'zgardi:", employeeId);
  };

  const handleDeleteConfirm = async () => {
    try {
      await employeesApi.deleteTeacher(deleteId);
      setUsers(users.filter(u => u.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      setToastMessage("Xatolik yuz berdi. Xodim o'chirilmadi.");
      setDeleteId(null); 
    }
  };

  const handleImportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setToastMessage(`"${file.name}" fayli tanlandi! Bu yerdan backendga jo'natiladi.`);
      e.target.value = null; 
    }
  };

  // Tahrirlash tugmasi bosilganda
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  // Drawer yopilganda
  const handleCloseDrawer = () => {
    setIsFormOpen(false);
    setEditingEmployee(null); // Yopilganda tahrirlash holatini tozalaymiz
  };

  // --- SARALASH (SORTING) MANTIQI ---
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedUsers = React.useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        
        // Holat (is_approved) uchun maxsus solishtirish
        if (sortConfig.key === 'is_approved') {
          aVal = a.is_approved ? 1 : 0;
          bVal = b.is_approved ? 1 : 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "fa-solid fa-sort ms-2 text-muted opacity-25";
    return sortConfig.direction === 'asc' ? "fa-solid fa-sort-up ms-2 text-primary" : "fa-solid fa-sort-down ms-2 text-primary";
  };

  return (
    <div className="main-wrapper" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
      
      {/* YUQORI QISM */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Xodimlar</h2>
          <span className="text-muted" style={{ fontSize: '14px' }}>Jami: {users.length} ta xodim</span>
        </div>
        
        <div className="d-flex gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            hidden 
            ref={importFileRef} 
            onChange={handleImportChange} 
          />
          <button 
            className="btn btn-light shadow-sm border d-flex align-items-center gap-2 px-3 fw-medium" 
            onClick={() => importFileRef.current.click()}
          >
            <i className="fas fa-file-import" style={{ color: "#f27a21" }}></i> Import
          </button>
          
          <button 
            className="btn shadow-sm d-flex align-items-center gap-2 px-4 fw-medium"
            style={{ backgroundColor: "#f27a21", color: "#ffffff" }} 
            onClick={() => {
              setEditingEmployee(null); 
              setIsFormOpen(true);
            }}
          >
            <i className="fas fa-plus"></i> Yangisini qo'shish
          </button>
        </div>
      </div>

      {/* JADVAL QISMI */}
      <div className="bg-white rounded-3 shadow-sm border overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
            <thead className="bg-light border-bottom text-secondary">
              <tr>
                <th style={{ width: '3%', paddingLeft: '20px' }}>№</th>
                
                <th 
                  style={{ width: '25%', cursor: 'pointer', userSelect: 'none', fontWeight: '600' }}
                  onClick={() => requestSort('full_name')}
                >
                  Ism va Familiya <i className={getSortIcon('full_name')}></i>
                </th>
                
                <th 
                  style={{ width: '20%', cursor: 'pointer', userSelect: 'none', fontWeight: '600' }}
                  onClick={() => requestSort('position')}
                >
                  Lavozimi <i className={getSortIcon('position')}></i>
                </th>
                
                <th style={{ width: '20%', fontWeight: '600' }}>Telefon raqami</th>
                
                <th 
                  style={{ width: '15%', cursor: 'pointer', userSelect: 'none', fontWeight: '600' }}
                  onClick={() => requestSort('is_approved')}
                >
                  Holati <i className={getSortIcon('is_approved')}></i>
                </th>
                
                <th style={{ width: '15%', fontWeight: '600', textAlign: 'right', paddingRight: '20px' }}>Amallar</th>
              </tr>
            </thead>
            
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="fa-regular fa-folder-open fs-1 mb-3 opacity-50"></i>
                    <br />
                    Hozircha xodimlar kiritilmagan.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u, index) => (
                  <tr key={u.id}>
                    <td className="text-muted fw-medium" style={{ paddingLeft: '20px' }}>{index + 1}.</td>
                    
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="d-flex align-items-center justify-content-center bg-light border rounded-circle overflow-hidden"
                          style={{ width: '40px', height: '40px' }}
                        >
                          {u.photo ? (
                            <img src={u.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <i className="fas fa-user text-secondary"></i>
                          )}
                        </div>
                        <span className="fw-medium text-dark">{u.full_name || 'Ism kiritilmagan'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1">
                        {u.position || '—'}
                      </span>
                    </td>
                    
                    <td className="text-primary fw-medium">
                      {u.phone ? (u.phone.includes('+') ? u.phone : `+${u.phone}`) : '—'}
                    </td>
                    
                    <td>
                      {u.is_approved ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
                          <i className="fa-solid fa-check me-1"></i> Tasdiqlandi
                        </span>
                      ) : (
                        <button 
                          onClick={() => setApproveId(u.id)} 
                          className="btn btn-sm btn-warning rounded-pill shadow-sm"
                          style={{ fontSize: '12px', fontWeight: '600' }}
                          title="Tasdiqlash uchun bosing"
                        >
                          Kutilmoqda
                        </button>
                      )}
                    </td>
                    
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-sm btn-light border text-secondary" 
                          onClick={() => setIsSMSOpen(true)} 
                          title="SMS yuborish"
                        >
                          <i className="fas fa-envelope"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border text-primary" 
                          onClick={() => handleEditClick(u)} 
                          title="Tahrirlash"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-light border text-danger" 
                          onClick={() => handleDeleteClick(u.id)} 
                          title="O'chirish"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= MODALLAR ======================= */}

      <AddEmployeeDrawer 
        isOpen={isFormOpen} 
        onClose={handleCloseDrawer} 
        onRefresh={fetchEmployees}
        editingEmployee={editingEmployee}
      />

      <SmsDrawer 
        isOpen={isSMSOpen} 
        onClose={() => setIsSMSOpen(false)} 
      />

      <DeleteModal 
        isOpen={deleteId !== null && deleteId !== undefined} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDeleteConfirm} 
      />

      {/* TASDIQLASH MODALI */}
      {approveId && (
        <div className="mini-modal-overlay" onClick={() => setApproveId(null)} style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="mini-modal bg-white p-4 rounded text-center" style={{ width: "350px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>
            <div className="mb-3">
              <i className="fa-solid fa-user-check text-warning" style={{ fontSize: '40px' }}></i>
            </div>
            <h4 className="mb-3 text-dark fw-bold">Tasdiqlaysizmi?</h4>
            <p className="text-muted mb-4">Ushbu xodimga tizimdan to'liq foydalanishiga ruxsat bermoqchimisiz?</p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-light border" onClick={() => setApproveId(null)}>Bekor qilish</button>
              <button className="btn btn-success px-4 fw-medium" onClick={confirmApprove}>Ha, tasdiqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* CHIROYLI NOTIFICATION (TOAST) */}
      {toastMessage && (
        <div 
          className={`position-fixed top-0 start-50 translate-middle-x mt-4 badge px-4 py-3 shadow border ${toastMessage.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`} 
          style={{ zIndex: 9999, fontSize: '14px', animation: 'fadeInDown 0.3s ease' }}
        >
          <i className={`fa-solid ${toastMessage.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2`}></i>
          {toastMessage.text || toastMessage}
        </div>
      )}

    </div>
  );
};

export default EmployeesPage;