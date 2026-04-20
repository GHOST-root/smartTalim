import React, { useState, useRef, useEffect } from 'react';
import './timetable.css';
import { timetableApi } from '../../api/timetableApi';

const START_HOUR = 7;
const END_HOUR = 20;
const PIXELS_PER_HOUR = 80;

const Timetable = ({ isGlobal = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('horizontal');
  const [dayTab, setDayTab] = useState('juft');
  
  const [rooms, setRooms] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [groups, setGroups] = useState([]); // Modal uchun guruhlar ro'yxati
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Modal statelari
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // group_id o'rniga group yozamiz
  const [newLesson, setNewLesson] = useState({
    group: '', 
    room_name: '',
    teachers_name: '',
    start_time: '08:00',
    end_time: '09:30'
  });

  const containerRef = useRef(null);
  const [resizingLesson, setResizingLesson] = useState(null);
  const [movingLesson, setMovingLesson] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Xonalarni yuklash
      const roomsRes = await timetableApi.getRooms();
      // 🌟 YECHIM: .results, .data yoki to'g'ridan-to'g'ri massiv kelsa ham ushlaydi
      const roomsData = roomsRes?.results || roomsRes?.data || (Array.isArray(roomsRes) ? roomsRes : []);
      const roomNames = roomsData.map(r => r.name || r.room_name || r);
      setRooms(roomNames.length > 0 ? roomNames : ['test']);

      // 2. Guruhlarni yuklash
      const groupsRes = await timetableApi.getGroups();
      const groupsData = groupsRes?.results || groupsRes?.data || (Array.isArray(groupsRes) ? groupsRes : []);
      setGroups(groupsData);

      // O'qituvchilarni yuklash
      const teachersRes = await timetableApi.getTeachers();
      const employeesData = teachersRes?.results || teachersRes?.data || (Array.isArray(teachersRes) ? teachersRes : []);
      
      const filteredTeachers = employeesData
        .filter(emp => emp.position && emp.position.toLowerCase() === 'teacher')
        .map(t => ({
          id: t.id || t.uuid,
          name: t.full_name || t.first_name || t.name || "Ismsiz o'qituvchi"
        }));
        
      setTeachers(filteredTeachers);

      // 3. Darslarni yuklash
      const schedulesRes = await timetableApi.getSchedules({ type: dayTab });
      const schedulesData = schedulesRes?.results || schedulesRes?.data || (Array.isArray(schedulesRes) ? schedulesRes : []);

      // AQLLI FORMATLASH:
      const formattedLessons = schedulesData.map(item => {
        // A) Guruh ismini UUID orqali qidirib topamiz:
        const matchedGroup = groupsData.find(g => g.id === item.group);
        const groupName = matchedGroup ? matchedGroup.name : 'Noma\'lum guruh';
        
        // --- O'QITUVCHINI TOPISH UCHUN YANGILANGAN MANTIQ ---
        let teacherName = 'O\'qituvchi ma\'lumoti yo\'q';
        
        if (item.teacher?.full_name || item.teacher_name || item.teacher) {
           teacherName = item.teacher?.full_name || item.teacher_name || item.teacher;
        } 
        else if (matchedGroup?.teacher?.full_name || matchedGroup?.teacher_name || matchedGroup?.teacher) {
           teacherName = matchedGroup.teacher?.full_name || matchedGroup.teacher_name || matchedGroup.teacher;
        }
        else if (matchedGroup?.course?.name || matchedGroup?.course_name) {
           teacherName = matchedGroup?.course?.name || matchedGroup?.course_name;
        }

        // B) Xonani qidiramiz 
        const roomName = item.room?.name || item.room_name || item.room || roomNames[0] || 'test';

        return {
          id: item.id || item.uuid,
          room: roomName,
          startHour: convertTimeToDecimal(item.start_time),
          endHour: convertTimeToDecimal(item.end_time),
          title: groupName, 
          course: teacherName, 
          students: '', 
          color: '#A7F3D0', text: '#064E3B'
        };
      });

      setLessons(formattedLessons);

    } catch (error) {
      console.error("Yuklashda xato:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dayTab]);

  const convertTimeToDecimal = (timeStr) => {
    if (!timeStr) return 8;
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) + (parseInt(minutes) / 60);
  };

  const convertDecimalToTime = (decimalTime) => {
    const hrs = Math.floor(decimalTime);
    const mins = Math.round((decimalTime - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  // --- QO'SHISH MODALI LOGIKASI ---
  const handleAddLessonSubmit = async (e) => {
    e.preventDefault();
    if (!newLesson.group || !newLesson.room_name) return alert("Guruh va xonani tanlang!");
    
    setIsSaving(true);
    try {
        let validDayType = dayTab === 'juft' ? 'even' : 'odd'; 

        const payload = {
            group: newLesson.group, 
            room_name: newLesson.room_name,
            start_time: newLesson.start_time,
            end_time: newLesson.end_time,
            day_type: validDayType, 
            teacher: newLesson.teachers_name, // Select'dan kelgan ID
            teacher_id: newLesson.teachers_name, // Backend ikkalasidan birini kutadi
            
            branch: 1,       
            branch_id: 1     
        };

        await timetableApi.createSchedule(payload);
        setShowAddModal(false);
        fetchData();
    } catch (error) {
        console.error("Backenddan kelgan xato:", error.response?.data);
        alert("Dars yaratishda xato! (Konsolni tekshiring)");
    } finally {
        setIsSaving(false);
    }
  };

  // --- O'CHIRISH LOGIKASI ---
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Haqiqatan ham bu darsni o'chirmoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await timetableApi.deleteSchedule(id);
      // O'chirilgach, darslar ro'yxatini qayta yuklaymiz (to'liq backend ma'lumoti)
      fetchData(); 
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert("Darsni o'chirishda xatolik yuz berdi!");
    } finally {
      setDeletingId(null);
    }
  };

  // --- DRAG & RESIZE LOGIKASI ---
  const handleResizeMouseDown = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingLesson(id);
  };

  const handleLessonMouseDown = (e, lesson) => {
    e.stopPropagation();
    if (resizingLesson) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gridX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const gridY = e.clientY - rect.top + containerRef.current.scrollTop;
    const style = getBlockStyle(lesson);
    setDragOffset({ x: gridX - parseFloat(style.left), y: gridY - parseFloat(style.top) });
    setMovingLesson(lesson.id);
  };

  const handlePanMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const gridX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const gridY = e.clientY - rect.top + containerRef.current.scrollTop;

    if (resizingLesson) {
      let currentPos = view === 'vertical' ? gridY - 50 : gridX - 150;
      let newEndHour = START_HOUR + (currentPos / PIXELS_PER_HOUR);
      newEndHour = Math.round(newEndHour * 2) / 2;

      setLessons(prev => prev.map(lesson => {
        if (lesson.id === resizingLesson) {
          const validEndHour = Math.max(lesson.startHour + 0.5, Math.min(newEndHour, END_HOUR));
          return { ...lesson, endHour: validEndHour };
        }
        return lesson;
      }));
    }
    else if (movingLesson) {
      let targetX = gridX - dragOffset.x;
      let targetY = gridY - dragOffset.y;
      let newStartHour, roomIndex;

      if (view === 'vertical') {
        newStartHour = START_HOUR + ((targetY - 50) / PIXELS_PER_HOUR);
        const blockCenterX = targetX + (170 / 2);
        roomIndex = Math.floor((blockCenterX - 80) / 180);
      } else {
        newStartHour = START_HOUR + ((targetX - 150) / PIXELS_PER_HOUR);
        const blockCenterY = targetY + (70 / 2);
        roomIndex = Math.floor((blockCenterY - 50) / 80);
      }

      newStartHour = Math.round(newStartHour * 2) / 2;
      roomIndex = Math.max(0, Math.min(rooms.length - 1, roomIndex));

      setLessons(prev => prev.map(lesson => {
        if (lesson.id === movingLesson) {
          const duration = lesson.endHour - lesson.startHour;
          const validStart = Math.max(START_HOUR, Math.min(newStartHour, END_HOUR - duration));
          return {
            ...lesson,
            startHour: validStart,
            endHour: validStart + duration,
            room: rooms[roomIndex]
          };
        }
        return lesson;
      }));
    }
    else if (isDragging) {
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const y = e.pageY - containerRef.current.offsetTop;
      containerRef.current.scrollLeft = scrollLeft - (x - startX);
      containerRef.current.scrollTop = scrollTop - (y - startY);
    }
  };

  const handleMouseUp = async () => {
    setIsDragging(false);
    const changedLessonId = movingLesson || resizingLesson;
    
    if (changedLessonId) {
      const updatedLesson = lessons.find(l => l.id === changedLessonId);
      if (updatedLesson) {
        try {
          const payload = {
            // Backend room yoki room_name qabul qilishiga qarab o'zgartiriladi
            room_name: updatedLesson.room, 
            start_time: convertDecimalToTime(updatedLesson.startHour),
            end_time: convertDecimalToTime(updatedLesson.endHour),
            // Har ehtimolga qarshi majburiy maydonlarni qo'shib yuboramiz:
            branch_id: 1
          };
          
          await timetableApi.updateSchedule(changedLessonId, payload);
          console.log("Muvaffaqiyatli saqlandi!");
        } catch (error) {
          console.error("Xato:", error);
          alert("Saqlashda xato yuz berdi. Backend UUID qabul qilishini tekshiring!");
          fetchData(); // Xato bo'lsa, darsni eski joyiga (bazadagi holatiga) qaytarib qo'yadi
        }
      }
    }
    setResizingLesson(null);
    setMovingLesson(null);
  };

  const times = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => `${(START_HOUR + i).toString().padStart(2, '0')}:00`);

  const getBlockStyle = (lesson) => {
    const roomIndex = rooms.indexOf(lesson.room);
    if (view === 'vertical') {
      return {
        top: `${50 + (lesson.startHour - START_HOUR) * PIXELS_PER_HOUR}px`,
        height: `${(lesson.endHour - lesson.startHour) * PIXELS_PER_HOUR}px`,
        left: `${80 + Math.max(0, roomIndex) * 180}px`,
        width: '170px'
      };
    } else {
      return {
        left: `${150 + (lesson.startHour - START_HOUR) * PIXELS_PER_HOUR}px`,
        width: `${(lesson.endHour - lesson.startHour) * PIXELS_PER_HOUR}px`,
        top: `${50 + Math.max(0, roomIndex) * 80}px`,
        height: '70px'
      };
    }
  };

  const timetableCoreContent = (
    <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div className="d-flex gap-4 fw-medium" style={{ fontSize: '15px' }}>
          <span className={`cursor-pointer pb-1 ${dayTab === 'toq' ? 'text-primary border-bottom border-primary border-2' : 'text-muted'}`} onClick={() => setDayTab('toq')}>Toq kunlar</span>
          <span className={`cursor-pointer pb-1 ${dayTab === 'juft' ? 'text-primary border-bottom border-primary border-2' : 'text-muted'}`} onClick={() => setDayTab('juft')}>Juft kunlar</span>
        </div>
        
        {/* YANGI DARS QO'SHISH VA O'CHIRISH TUGMALARI */}
            <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => setShowDeleteModal(true)}>
                    <i className="fa-solid fa-trash"></i> O'chirish
                </button>
                <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowAddModal(true)}>
                    + Yangi dars
                </button>
            </div>
      </div>

      <div 
        className="hide-scrollbars position-relative border rounded w-100 flex-grow-1" 
        style={{ height: isGlobal ? '100%' : '500px', backgroundColor: '#fcfcfc', overflow: 'auto', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handlePanMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        {isLoading && <div className="d-flex justify-content-center align-items-center h-100 w-100 position-absolute" style={{zIndex: 100, background: 'rgba(255,255,255,0.7)'}}><div className="spinner-border text-primary"></div></div>}

        <div style={{ 
          position: 'relative', 
          width: view === 'vertical' ? `${80 + rooms.length * 180}px` : `${150 + times.length * PIXELS_PER_HOUR}px`,
          height: view === 'vertical' ? `${50 + times.length * PIXELS_PER_HOUR}px` : `${50 + rooms.length * 80}px`,
          minWidth: '100%'
        }}>
          
          {view === 'vertical' ? (
            <>
              <div className="d-flex position-absolute top-0 w-100 bg-white border-bottom shadow-sm" style={{ height: '50px', zIndex: 10, position: 'sticky' }}>
                <div style={{ width: '80px', minWidth: '80px', borderRight: '1px solid #eaeaea', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 11 }}></div>
                {rooms.map(room => <div key={room} className="d-flex align-items-center justify-content-center text-muted fw-bold" style={{ width: '180px', minWidth: '180px', borderRight: '1px solid #eaeaea', fontSize: '14px' }}>{room}</div>)}
              </div>
              {times.map((time, i) => (
                <div key={time} className="position-absolute w-100 d-flex" style={{ top: `${50 + i * PIXELS_PER_HOUR}px`, height: `${PIXELS_PER_HOUR}px`, borderBottom: '1px dashed #eaeaea' }}>
                  <div className="d-flex justify-content-center pt-2 fw-medium text-dark bg-white" style={{ width: '80px', minWidth: '80px', borderRight: '1px solid #eaeaea', position: 'sticky', left: 0, zIndex: 5 }}>{time}</div>
                  {rooms.map(room => <div key={room} style={{ width: '180px', minWidth: '180px', borderRight: '1px dashed #f0f0f0' }}></div>)}
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="d-flex position-absolute top-0 w-100 bg-white border-bottom shadow-sm" style={{ height: '50px', zIndex: 10, position: 'sticky' }}>
                <div style={{ width: '150px', minWidth: '150px', borderRight: '1px solid #eaeaea', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 11 }}></div>
                {times.map(time => <div key={time} className="d-flex justify-content-start ps-2 pt-3 text-muted fw-bold" style={{ width: `${PIXELS_PER_HOUR}px`, minWidth: `${PIXELS_PER_HOUR}px`, borderRight: '1px solid #eaeaea', fontSize: '13px' }}>{time}</div>)}
              </div>
              {rooms.map((room, i) => (
                <div key={room} className="position-absolute w-100 d-flex" style={{ top: `${50 + i * 80}px`, height: '80px', borderBottom: '1px dashed #eaeaea' }}>
                  <div className="d-flex align-items-center px-3 fw-medium text-dark bg-white" style={{ width: '150px', minWidth: '150px', borderRight: '1px solid #eaeaea', position: 'sticky', left: 0, zIndex: 5 }}>{room}</div>
                  {times.map(time => <div key={time} style={{ width: `${PIXELS_PER_HOUR}px`, minWidth: `${PIXELS_PER_HOUR}px`, borderRight: '1px dashed #f0f0f0' }}></div>)}
                </div>
              ))}
            </>
          )}

          {lessons.map(lesson => {
            const isMoving = movingLesson === lesson.id;
            if (!rooms.includes(lesson.room) && rooms.length > 0) return null; 

            return (
              <div 
                key={lesson.id} 
                className="position-absolute rounded shadow-sm d-flex flex-column p-2 overflow-hidden"
                onMouseDown={(e) => handleLessonMouseDown(e, lesson)} 
                style={{
                  ...getBlockStyle(lesson),
                  backgroundColor: lesson.color,
                  color: lesson.text,
                  zIndex: isMoving ? 50 : 20, 
                  boxShadow: isMoving ? '0 10px 25px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)', 
                  transition: (resizingLesson === lesson.id || isMoving) ? 'none' : 'all 0.2s ease', 
                  cursor: isMoving ? 'grabbing' : 'move' 
                }}
              >
                {/* 10 TAL OLIB TASHLANDI, ISMLAR KATTAROQ KO'RINADI */}
                <div className="fw-bold" style={{ fontSize: '12px', lineHeight: '1.2' }}>{lesson.title}</div>
                <div className="mt-1" style={{ fontSize: '11px', opacity: 0.9 }}>{lesson.course}</div>
                
                {/* CHO'ZISH UCHUN TUGMA (RESIZE HANDLE) - XATO TO'G'RILANDI */}
                <div 
                  className="position-absolute"
                  onMouseDown={(e) => handleResizeMouseDown(e, lesson.id)} 
                  style={{
                    bottom: 0,
                    right: 0,
                    height: view === 'vertical' ? '14px' : '100%',
                    width: view === 'horizontal' ? '14px' : '100%',
                    cursor: view === 'vertical' ? 'ns-resize' : 'ew-resize',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderBottomRightRadius: '4px'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* DARS QO'SHISH MODALI */}
      {/* 🌟 1. DARS QO'SHISH MODALI (YANGI DIZAYN) 🌟 */}
      {showAddModal && (
        <div className="timetable-modal-overlay" onClick={() => setShowAddModal(false)} style={{zIndex: 10000}}>
          <div className="timetable-custom-modal" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h5 className="modal-title">Yangi dars jadvali yaratish</h5>
              <span className="close-btn" onClick={() => setShowAddModal(false)}>✕</span>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="modal-body">
              <div className="form-group">
                <label className="custom-label">Guruhni tanlang</label>
                <select className="custom-input" required value={newLesson.group} onChange={e => setNewLesson({...newLesson, group: e.target.value})}>
                    <option value="">Tanlash...</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name || g.group_name || g.title || "Nomsiz guruh"}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="custom-label">Xonani tanlang</label>
                <select className="custom-input" required value={newLesson.room_name} onChange={e => setNewLesson({...newLesson, room_name: e.target.value})}>
                    <option value="">Tanlash...</option>
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="custom-label">O'qituvchini tanlang</label>
                <select className="custom-input" required value={newLesson.teachers_name} onChange={e => setNewLesson({...newLesson, teachers_name: e.target.value})}>
                    <option value="">Tanlash...</option>
                    {/* EKRANDA ISM KO'RINADI, LEKIN ORQA FONDA ID TANLANADI */}
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="time-row">
                <div className="form-group flex-1">
                  <label className="custom-label">Boshlanish</label>
                  <input type="time" className="custom-input" required value={newLesson.start_time} onChange={e => setNewLesson({...newLesson, start_time: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                  <label className="custom-label">Tugash</label>
                  <input type="time" className="custom-input" required value={newLesson.end_time} onChange={e => setNewLesson({...newLesson, end_time: e.target.value})} />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="custom-save-btn w-100" disabled={isSaving}>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 2. DARS O'CHIRISH MODALI (JADVAL BILAN) 🌟 */}
      {showDeleteModal && (
        <div className="timetable-modal-overlay" onClick={() => setShowDeleteModal(false)} style={{zIndex: 10000}}>
          <div className="timetable-custom-modal" style={{width: '650px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Darslarni o'chirish</h5>
              <span className="close-btn" onClick={() => setShowDeleteModal(false)}>✕</span>
            </div>
            
            <div className="modal-body" style={{maxHeight: '400px', overflowY: 'auto'}}>
              <table className="table table-hover align-middle" style={{fontSize: '13px', margin: 0}}>
                <thead className="bg-light sticky-top" style={{top: 0, zIndex: 1}}>
                  <tr>
                    <th>Guruh</th>
                    <th>O'qituvchi</th>
                    <th>Xona</th>
                    <th>Vaqt</th>
                    <th className="text-end">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length > 0 ? lessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td className="fw-medium text-primary">{lesson.title}</td>
                      <td>{lesson.course}</td>
                      <td>{lesson.room}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {convertDecimalToTime(lesson.startHour).substring(0,5)} - {convertDecimalToTime(lesson.endHour).substring(0,5)}
                        </span>
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-danger px-3 py-1" 
                          onClick={() => handleDeleteSchedule(lesson.id)}
                          disabled={deletingId === lesson.id}
                        >
                          {deletingId === lesson.id ? '...' : <i className="fa-solid fa-trash-can"></i>}
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" className="text-center py-5 text-muted">Hozircha jadvalda darslar yo'q</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isGlobal) {
    return (
      <div className="dashboard-card mb-4 mt-4 bg-white p-3 border rounded shadow-sm" style={{ width: '100%' }}>
         <h4 className="fw-bold mb-4">Dars Jadvali</h4>
         {timetableCoreContent}
      </div>
    );
  }

  return (
    <>
      <div className="global-timetable-btn" onClick={() => setIsOpen(true)} title="Dars jadvalini ochish">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="timetable-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="timetable-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h3 className="m-0 fw-bold text-dark">Umumiy Dars Jadvali</h3>
              <button 
                className="btn btn-light rounded-circle border d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px' }} 
                onClick={() => setIsOpen(false)}
              >
                <i className="fa-solid fa-xmark fs-5 text-secondary"></i>
              </button>
            </div>
            {timetableCoreContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Timetable;