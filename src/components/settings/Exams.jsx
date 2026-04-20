import React, { useState, useEffect } from 'react';
import '../settings/styles/rooms.css'; // O'zingizdagi to'g'ri css yo'lini qo'ying
import { settingsApi } from '../../api/settingsApi'; 
import axiosInstance from '../../api/axiosInstance'; // Guruhlarni tortib kelish uchun qo'shildi
import { Plus, FileText, Pencil, Trash2, X, Calendar, Users, Award } from 'lucide-react';

// Forma komponenti
const InputForm = ({ onSubmit, initialData, loading, groups }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    group_id: '',
    exam_date: '',
    max_score: '',
    min_score: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        title: initialData.title || initialData.name || '', 
        group_id: initialData.group_id || initialData.group?.id || '',
        exam_date: initialData.exam_date || initialData.date || '',
        max_score: initialData.max_score || '',
        min_score: initialData.min_score || ''
      });
    } else {
      setFormData({ title: '', group_id: '', exam_date: '', max_score: '', min_score: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className='custom-form-wrapper' onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <div className='custom-form-scroll'>
        
        <div className='field'>
          <label>Imtihon nomi <span className="text-danger">*</span></label>
          <input
            type='text'
            name='title'
            value={formData.title}
            onChange={handleChange}
            placeholder='Masalan: Qishki oraliq nazorat'
            required
          />
        </div>

        <div className='field'>
          <label>Qaysi guruh uchun? <span className="text-danger">*</span></label>
          <select
            name='group_id'
            value={formData.group_id}
            onChange={handleChange}
            required
          >
            <option value="">Guruhni tanlang...</option>
            {groups.map((g) => (
              <option key={g.id || g.uuid} value={g.id || g.uuid}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className='field'>
          <label>Sana <span className="text-danger">*</span></label>
          <input
            type='date'
            name='exam_date'
            value={formData.exam_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🌟 Ikkita input yonma-yon */}
        <div className="roww">
          <div className='field'>
            <label>O'tish balli <span className="text-danger">*</span></label>
            <input
              type='number'
              name='min_score'
              value={formData.min_score}
              onChange={handleChange}
              placeholder='Masalan: 60'
              required
            />
          </div>

          <div className='field'>
            <label>Maksimal ball <span className="text-danger">*</span></label>
            <input
              type='number'
              name='max_score'
              value={formData.max_score}
              onChange={handleChange}
              placeholder='Masalan: 100'
              required
            />
          </div>
        </div>

      </div>
      
      {/* 🌟 Saqlash tugmasi pastga taqalib turadi */}
      <button type='submit' className='modal-submit' disabled={loading}>
        {loading ? 'Kuting...' : 'Saqlash'}
      </button>
    </form>
  );
};

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [groupsList, setGroupsList] = useState([]); // 🌟 Guruhlar ro'yxati saqlanadi
  const [isLoading, setIsLoading] = useState(true);

  // Modal statelari
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('add'); 
  const [selectedExam, setSelectedExam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. IMTIHONLAR VA GURUHLARNI BIRGALIKDA YUKLASH
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Ikkala API ni bir vaqtda chaqiramiz
      const [examsRes, groupsRes] = await Promise.all([
        settingsApi.exams?.getAll().catch(() => []),
        axiosInstance.get('/api/v1/academics/groups/').catch(() => []) // Guruhlarni olish
      ]);

      const examsData = Array.isArray(examsRes?.results) ? examsRes.results : (Array.isArray(examsRes) ? examsRes : []);
      const groupsData = Array.isArray(groupsRes?.data?.results) ? groupsRes.data.results : (Array.isArray(groupsRes?.data) ? groupsRes.data : []);

      setExams(examsData);
      setGroupsList(groupsData);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. MODALNI OCHISH
  const openPanel = (mode, exam = null) => {
    setPanelMode(mode);
    setSelectedExam(exam);
    setShowPanel(true);
  };

  // 3. QO'SHISH, TAHRIRLASH VA O'CHIRISH
  const handleAction = async (formData = null) => {
    setIsSaving(true);
    try {
      
      const payload = formData ? {
        ...formData,
        // Raqamlarga o'g'iramiz (xatolik bo'lmasligi uchun)
        max_score: Number(formData.max_score),
        min_score: Number(formData.min_score),
        branch_id: 1, 
        organization_id: localStorage.getItem('org_id') 
      } : null;

      if (panelMode === 'add') {
        await settingsApi.exams?.create(payload);
      } 
      else if (panelMode === 'edit' && selectedExam) {
        await settingsApi.exams?.update(selectedExam.id || selectedExam.uuid, payload);
      } 
      else if (panelMode === 'delete' && selectedExam) {
        await settingsApi.exams?.delete(selectedExam.id || selectedExam.uuid);
      }

      setShowPanel(false);
      fetchData(); // Jadvalni yangilaymiz
    } catch (error) {
      console.error("Amalni bajarishda xato:", error);
      alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rooms-dashboard">
      
      {/* HEADER QISMI */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fw-semibold text-dark" style={{fontSize: '24px'}}>Imtihonlar ro'yxati</h2>
        <button className="premium-add-btn" onClick={() => openPanel('add')}>
          <Plus size={18} /> Yangi imtihon
        </button>
      </div>

      {/* ASOSIY JADVAL / GRID */}
      {isLoading ? (
        <div className="text-center py-5 text-muted">Ma'lumotlar yuklanmoqda...</div>
      ) : (
        <div className="row g-4">
          {exams.length > 0 ? exams.map((exam) => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={exam.id || exam.uuid}>
              
              {/* IMTIHON KARTASI */}
              <div className="premium-room-card h-100">
                <div className="room-header">
                  <h4>{exam.title || exam.name || "Nomsiz imtihon"}</h4>
                  <span className="room-capacity text-primary">
                    <Calendar size={14} className="me-1" /> {exam.exam_date || exam.date || "Sana yo'q"}
                  </span>
                </div>

                <div className="mt-2 mb-3 text-muted" style={{fontSize: '13px'}}>
                  <div><Award size={14} className="me-1"/> O'tish balli: <b>{exam.min_score || 0} / {exam.max_score || 0}</b></div>
                </div>
                
                {/* TUGMALAR */}
                <div className="room-actions mt-auto">
                  <button className="action-btn edit" onClick={() => openPanel('edit', exam)}>
                    <Pencil size={14} /> Tahrirlash
                  </button>
                  <button className="action-btn delete" onClick={() => openPanel('delete', exam)}>
                    <Trash2 size={14} /> O'chirish
                  </button>
                </div>
              </div>

            </div>
          )) : (
            <div className="col-12 text-center py-5">
              <div className="mb-3"><FileText size={48} className="text-muted opacity-50 mx-auto" /></div>
              <p className="text-muted fs-5">Hali imtihonlar qo'shilmagan</p>
            </div>
          )}
        </div>
      )}

      {/* YON PANEL (MODAL) */}
      <div className={`side-panel-overlay ${showPanel ? 'active' : ''}`} onClick={() => !isSaving && setShowPanel(false)}></div>
      
      <div className={`side-panel ${showPanel ? 'show' : ''}`}>
        
        <div className="panel-header flex-shrink-0">
          <h5>
            {panelMode === 'add' ? 'Yangi imtihon qo`shish' : panelMode === 'edit' ? 'Imtihonni tahrirlash' : 'Imtihonni o`chirish'}
          </h5>
          <button className="close-x-btn" onClick={() => setShowPanel(false)} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-body" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {panelMode !== 'delete' ? (
            <InputForm onSubmit={handleAction} initialData={selectedExam} loading={isSaving} groups={groupsList} />
          ) : (
            <div className="custom-form-wrapper">
              <div className="custom-form-scroll mt-2">
                
                {/* 🌟 Bootstrap alert o'rniga Custom Box */}
                <div className="delete-warning-box">
                  <strong>Diqqat!</strong> Ushbu amalni ortga qaytarib bo'lmaydi.
                </div>
                
                <p className="text-dark mt-3" style={{fontSize: '15px'}}>
                  Haqiqatan ham <strong>{selectedExam?.title || selectedExam?.name}</strong> imtihonini butunlay o'chirib tashlamoqchimisiz?
                </p>
              </div>
              
              {/* 🌟 O'chirish tugmasi qizil rangda */}
              <button 
                className="modal-submit danger" 
                onClick={() => handleAction()} 
                disabled={isSaving}
              >
                {isSaving ? 'O`chirilmoqda...' : 'Ha, o`chirilsin'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}