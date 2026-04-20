import React, { useState, useEffect } from 'react';
import './styles/rooms.css';
import { settingsApi } from '../../api/settingsApi'; // O'zingizdagi to'g'ri manzilni ko'rsating
import { Plus, Users, Pencil, Trash2, X } from 'lucide-react';

// Forma komponenti
const InputForm = ({ onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({ name: '', capacity: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name || '', capacity: initialData.capacity || '' });
    } else {
      setFormData({ name: '', capacity: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className='mt-3 d-flex flex-column h-100' onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <div className='flex-grow-1'>
        <div className='mb-4'>
          <label className='form-label'>Xona nomi</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Masalan: 101-xona'
            className='custom-input'
            required
          />
        </div>
        <div className='mb-4'>
          <label className='form-label'>Sig'imi (O'quvchilar soni)</label>
          <input
            type='number'
            name='capacity'
            value={formData.capacity}
            onChange={handleChange}
            placeholder='Masalan: 15'
            className='custom-input'
            required
          />
        </div>
      </div>
      <button type='submit' className='save-btn' disabled={loading}>
        {loading ? 'Kuting...' : 'Saqlash'}
      </button>
    </form>
  );
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal statelari
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. BARCHA XONALARNI YUKLASH
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.rooms?.getAll();
      // Kafolatlangan massiv (results ichida kelsa ajratib oladi)
      const data = Array.isArray(res?.results) ? res.results : (Array.isArray(res) ? res : []);
      setRooms(data);
    } catch (error) {
      console.error("Xonalarni yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 2. MODALNI OCHISH
  const openPanel = (mode, room = null) => {
    setPanelMode(mode);
    setSelectedRoom(room);
    setShowPanel(true);
  };

  // 3. QO'SHISH, TAHRIRLASH VA O'CHIRISH (API ORQALI)
  // 3. QO'SHISH, TAHRIRLASH VA O'CHIRISH (API ORQALI)
  const handleAction = async (formData = null) => {
    setIsSaving(true);
    try {
      
      // 🌟 YECHIM: Backend kutayotgan majburiy maydonlarni payload'ga qo'shamiz
      const payload = formData ? {
        ...formData,
        branch_id: 1, // Filial ID si (Guruhlarda qilganimizdek)
        organization_id: localStorage.getItem('org_id') // Aynan shu nomda yuboramiz
      } : null;

      if (panelMode === 'add') {
        // YANGI QO'SHISH
        await settingsApi.rooms?.create(payload);
      } 
      else if (panelMode === 'edit' && selectedRoom) {
        // TAHRIRLASH (ID orqali)
        await settingsApi.rooms?.update(selectedRoom.id, payload);
      } 
      else if (panelMode === 'delete' && selectedRoom) {
        // O'CHIRISH (ID orqali)
        await settingsApi.rooms?.delete(selectedRoom.id);
      }

      // Muvaffaqiyatli bo'lsa, oynani yopib ro'yxatni yangilaymiz
      setShowPanel(false);
      fetchRooms(); 
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
        <h2 className="m-0 fw-semibold text-dark" style={{fontSize: '24px'}}>Xonalar</h2>
        <button className="premium-add-btn" onClick={() => openPanel('add')}>
          <Plus size={18} /> Yangi xona
        </button>
      </div>

      {/* ASOSIY JADVAL / GRID */}
      {isLoading ? (
        <div className="text-center py-5 text-muted">Xonalar yuklanmoqda...</div>
      ) : (
        <div className="row g-4">
          {rooms.length > 0 ? rooms.map((room) => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={room.id}>
              
              {/* XONA KARTASI (OBYEKT) */}
              <div className="premium-room-card h-100">
                <div className="room-header">
                  <h4>{room.name}</h4>
                  <span className="room-capacity">
                    <Users size={14} /> {room.capacity || 0} o'rin
                  </span>
                </div>
                
                {/* TUGMALAR (Obyektni uzatamiz) */}
                <div className="room-actions">
                  <button className="action-btn edit" onClick={() => openPanel('edit', room)}>
                    <Pencil size={14} /> Tahrirlash
                  </button>
                  <button className="action-btn delete" onClick={() => openPanel('delete', room)}>
                    <Trash2 size={14} /> O'chirish
                  </button>
                </div>
              </div>

            </div>
          )) : (
            <div className="col-12 text-center py-5">
              <p className="text-muted fs-5">Hali xonalar qo'shilmagan</p>
            </div>
          )}
        </div>
      )}

      {/* YON PANEL (MODAL) */}
      <div className={`side-panel-overlay ${showPanel ? 'active' : ''}`} onClick={() => !isSaving && setShowPanel(false)}></div>
      
      <div className={`side-panel ${showPanel ? 'show' : ''}`}>
        
        <div className="panel-header">
          <h5>
            {panelMode === 'add' ? 'Yangi xona qo`shish' : panelMode === 'edit' ? 'Xonani tahrirlash' : 'Xonani o`chirish'}
          </h5>
          <button className="close-x-btn" onClick={() => setShowPanel(false)} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          {panelMode !== 'delete' ? (
            <InputForm onSubmit={handleAction} initialData={selectedRoom} loading={isSaving} />
          ) : (
            <div className="d-flex flex-column h-100">
              <div className="flex-grow-1 mt-2">
                <div className="alert alert-danger border-0 text-danger" style={{backgroundColor: '#fef2f2'}}>
                  <strong>Diqqat!</strong> Ushbu amalni ortga qaytarib bo'lmaydi.
                </div>
                <p className="text-dark mt-3" style={{fontSize: '15px'}}>
                  Haqiqatan ham <strong className="text-danger">{selectedRoom?.name}</strong> xonasini butunlay o'chirib tashlamoqchimisiz?
                </p>
              </div>
              <button 
                className="save-btn" 
                style={{backgroundColor: '#ef4444'}} 
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