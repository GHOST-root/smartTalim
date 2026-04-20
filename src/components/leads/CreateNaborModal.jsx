import React, { useState, useEffect } from 'react';
import { leadsApi } from '../../api/leadsApi'; // API yo'lini o'zingizga moslang
import "./styles/leads.css";

function CreateNaborModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    columnId: "",
    course_id: "",
    teacher_id: "",
    days: "",
    time: ""
  });

  // API dan keladigan ro'yxatlar
  const [columnsList, setColumnsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal ochilganda API dan ma'lumotlarni tortib kelish
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [colsRes, coursesRes, teachersRes] = await Promise.all([
            leadsApi.getColumns().catch(() => []),
            leadsApi.getCourses().catch(() => []),
            leadsApi.getEmployees().catch(() => [])
          ]);

          setColumnsList(colsRes.results || colsRes || []);
          setCoursesList(coursesRes.results || coursesRes || []);
          setTeachersList(teachersRes.results || teachersRes || []);
        } catch (error) {
          console.error("Ma'lumotlarni yuklashda xato:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name.trim() || !formData.columnId) {
      alert("Iltimos, Nabor nomi va Ustunni albatta tanlang!");
      return;
    }

    // 🌟 YECHIM: onSave ga jo'natishdan oldin organization_id ni qo'shib yuboramiz
    onSave({
      ...formData,
      organization_id: localStorage.getItem("org_id")
    });
    
    // Formani tozalash va yopish
    setFormData({ name: "", columnId: "", course_id: "", teacher_id: "", days: "", time: "" });
    onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-verlay">
      <div className="modal-bbox">

        <div className="modal-header">
          <h3>Yangi Nabor Yaratish</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="text-center text-muted py-4">Ma'lumotlar yuklanmoqda...</div>
          ) : (
            <>
              {/* MAJBURIY QISM */}
              <div className="field">
                <label>Qaysi ustunga qo'shamiz? <span className="text-danger">*</span></label>
                <select name="columnId" value={formData.columnId} onChange={handleChange}>
                  <option value="">Ustunni tanlang...</option>
                  {columnsList.map((col) => (
                    <option key={col.id} value={col.id}>{col.title || col.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Nabor nomi <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masalan: Ingliz 34 yoki SMM"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-divider"></div>
              <p className="optional-text">Quyidagilar ixtiyoriy:</p>

              {/* IXTIYORIY QISM */}
              <div className="field">
                <label>Kurs tanlash</label>
                <select name="course_id" value={formData.course_id} onChange={handleChange}>
                  <option value="">Tanlanmagan...</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>O‘qituvchi</label>
                <select name="teacher_id" value={formData.teacher_id} onChange={handleChange}>
                  <option value="">Tanlanmagan...</option>
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name || t.first_name || t.name}</option>
                  ))}
                </select>
              </div>

              <div className="roww">
                <div className="field">
                  <label>Kunlar</label>
                  <select name="days" value={formData.days} onChange={handleChange}>
                    <option value="">Tanlanmagan</option>
                    <option value="Toq kunlar">Toq kunlar</option>
                    <option value="Juft kunlar">Juft kunlar</option>
                    <option value="Har kuni">Har kuni</option>
                  </select>
                </div>

                <div className="field">
                  <label>Vaqt</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button className="modal-submit" onClick={handleSave}>
                Yaratish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateNaborModal;