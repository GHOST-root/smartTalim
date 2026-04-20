import { useState, useEffect } from "react";
import EditTeacherDrawer from "./EditTeacherDrawer";
import SmsDrawer from "./SmsDrawer";
import AddTeacherDrawer from "./AddTeacherDrawer";
import TeacherProfilePage from "./TeacherProfilePage";
import TeacherEmptyPage from "./TeacherEmptyPage";
import { teachersApi } from "../../api/teachersApi";
import './Teachers.css'; // O'ZINGIZNING CSS FAYLINGIZ ULANDI!

function TeachersPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Qidiruv uchun state
  const [searchQuery, setSearchQuery] = useState("");
  
  // 3 nuqtali menyuni ochish/yopish uchun
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchTeachersList = async () => {
    setIsLoading(true);
    try {
      const data = await teachersApi.getTeachers();
      const allEmployees = data.results || data || [];
      const onlyTeachers = allEmployees.filter(emp => 
        emp.position && emp.position.toLowerCase().includes('teacher')
      );
      
      const mappedTeachers = onlyTeachers.map(t => ({
        ...t,
        name: t.full_name || "Ismsiz",
        phone: t.phone ? (t.phone.includes('+') ? t.phone : `+${t.phone}`) : "---",
        group: "Hozircha yo'q"
      }));

      setTeachers(mappedTeachers);
    } catch (error) {
      console.error("Xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersList();
  }, []);

  if (viewOpen) {
    return (
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TeacherEmptyPage onBack={() => { setViewOpen(false); setViewTeacher(null); }}>
          <TeacherProfilePage teacher={viewTeacher} onBack={() => { setViewOpen(false); setViewTeacher(null); }} />
        </TeacherEmptyPage>
      </div>
    );
  }

  // O'qituvchilarni ism yoki telefon bo'yicha filtrlash
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await teachersApi.deleteTeacher(deleteId);
      setTeachers((prev) => prev.filter((t) => t.id !== deleteId));
      setConfirmOpen(false);
      setDeleteId(null);
      setActiveMenuId(null);
    } catch (error) {
      alert("O'chirishda xatolik yuz berdi!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Agar ekran bo'sh joyi bosilsa menyuni yopish */}
      <div className="content-container" onClick={() => setActiveMenuId(null)}>
        <div className="content">
          
          <div className="header-container d-flex justify-content-between mb-4">
          {/* Chap tomon: Sarlavha va Miqdor */}
          <div className="header-title-box d-flex gap-4">
            <h2 className="header-title">O'qituvchilar</h2>
            <span className="header-badge count-badge">Miqdor — {filteredTeachers.length}</span>
          </div>

          {/* O'ng tomon: Qidiruv va Tugmalar */}
          <div className="header-actions d-flex gap-4">
            <div className="search-box d-flex">
              <input 
                type="text" 
                className="search-input search-wrapper" 
                placeholder="Ism yoki raqam orqali..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn-outline-gray btn-import">
              Import
            </button>
            
            <button className="btn-primary-orange btn-add-new" onClick={() => setAddOpen(true)}>
              <i className="fa-solid fa-plus"></i> Yangisini qo'shish
            </button>
          </div>
        </div>

          {/* SIZNING CSS DIZAYNINGIZDAGI JADVAL */}
          <div className="table-container">
            
            <div className="table-header-row">
              <div className="col-name header-col">O'qituvchi</div>
              <div className="col-phone header-col">Telefon</div>
              <div className="col-group header-col">Guruhlar</div>
              <div className="col-action header-col">Amallar</div>
            </div>

            {isLoading ? (
              <div className="empty-state">Yuklanmoqda...</div>
            ) : teachers.length === 0 ? (
              <div className="empty-state">Hozircha o'qituvchilar yo'q</div>

            ) : (
              filteredTeachers.map((t) => (
                <div key={t.id} className="table-row">

                  <div 
                    className="col-name" 
                    onClick={(e) => { e.stopPropagation(); setViewTeacher(t); setViewOpen(true); }}
                  >
                    <strong>{t.name}</strong>
                  </div>

                  <div className="col-phone">{t.phone}</div>
                  
                  <div className="col-group">{t.group}</div>

                  <div className="col-action">
                    <div
                      className="menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === t.id ? null : t.id);
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </div>

                    {/* 3 NUQTALI MENYU */}
                    {activeMenuId === t.id && (
                      <div className="context-menu">
                        <div onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setSelectedTeacher(t); setEditOpen(true); }}>
                          <i className="fa-solid fa-pen text-orange"></i> Tahrirlash
                        </div>

                        <div onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setSelectedTeacher(t); setSmsOpen(true); }}>
                          <i className="fa-solid fa-comment text-green"></i> SMS yuborish
                        </div>

                        <div onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); setDeleteId(t.id); setConfirmOpen(true); }}>
                          <i className="fa-solid fa-trash text-red"></i> O'chirish
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* MODALLAR */}
      {addOpen && (
        <AddTeacherDrawer onClose={() => setAddOpen(false)} onRefresh={fetchTeachersList} />
      )}

      {editOpen && (
        <EditTeacherDrawer teacher={selectedTeacher} onClose={() => setEditOpen(false)} onRefresh={fetchTeachersList} />
      )}

      {smsOpen && <SmsDrawer teacher={selectedTeacher} onClose={() => setSmsOpen(false)} />}

      {/* SIZNING CSS'ingizdagi O'CHIRISH MODALI */}
      {confirmOpen && (
        <div className="modal-bg" onClick={() => setConfirmOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{marginTop: 0}}>Ogohlantirish</h3>
            <p style={{color: '#666', marginBottom: '20px'}}>Rostdan ham shu o'qituvchini o'chirasizmi?</p>

            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setConfirmOpen(false)}>Bekor qilish</button>
              <button className="btn-delete" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeachersPage;