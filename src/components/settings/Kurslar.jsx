// CenterAutomation.jsx (Yakuniy Versiya: CourseId asosida ma'lumotlarni ajratish)
import './styles/Kurslar.css'
import React, { useState, useEffect } from 'react';

// Font Awesome ikonkalari ulangan bo'lishi kerak.

// --- Rang Palitrasi va Yordamchi Funksiyalar ---
const colorPalette = [
    '#9060c5', '#72d897', '#3498db', '#f7931e', '#e74c3c', '#8e44ad', '#1abc9c', '#f1c40f', '#34495e'
];

const getRandomColor = (dataId) => {
    const id = dataId || Math.floor(Math.random() * 100); 
    const index = id % colorPalette.length;
    return colorPalette[index];
};

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase(); 
};

// LOCAL STORAGE YUKLASH FUNKSIYASI (Xatolikni boshqarish bilan)
const getInitialData = (key) => {
    try {
        const storedData = localStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error(`Error loading data from localStorage for key ${key}:`, error);
        return [];
    }
};

// YORDAMCHI FUNKSIYA: Narx formatlash
const formatPrice = (value) => {
    const number = value ? value.toString().replace(/\D/g, '') : '';
    if (!number) return '';
    return new Intl.NumberFormat('uz-UZ').format(Number(number)).replace(/,/g, ' ');
};

// ==========================================================
// *** ASOSIY KOMPONENT ***
// ==========================================================
const CenterAutomation = () => {
    // ==========================================================
    // --- State'lar ---
    // ==========================================================
    const [courses, setCourses] = useState(() => getInitialData('courses'));
    const [levels, setLevels] = useState(() => getInitialData('levels'));
    const [lessons, setLessons] = useState(() => getInitialData('lessons'));
    const [folders, setFolders] = useState(() => getInitialData('folders')); 
    
    const [activeCourseId, setActiveCourseId] = useState(null); 
    const [activeTab, setActiveTab] = useState('lessons'); 

    // Kurs Modal State'lari
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseFormData, setCourseFormData] = useState({ 
        name: '', courseCode: '', lessonDuration: 90, courseDurationMonths: '', price: '', description: '', students: 0, imageUrl: '', imageFileName: '' 
    });
    const [priceDisplay, setPriceDisplay] = useState('');
    const [courseFormErrors, setCourseFormErrors] = useState({}); 

    // Daraja Modal State'lari
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null); 
    // Daraja Form Data'sida courseId ni tekshirish shart emas, chunki u saqlashda qo'shiladi
    const [levelFormData, setLevelFormData] = useState({ name: '', price: '', description: '' }); 
    const [levelFormErrors, setLevelFormErrors] = useState({});

    // Dars Modal State'lari
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    // Dars Form Data'sida courseId ni tekshirish shart emas
    const [lessonFormData, setLessonFormData] = useState({ 
        title: '', group: '', date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' 
    });
    const [lessonFormErrors, setLessonFormErrors] = useState({});

    // Materiallar (Fayl) State'lari
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    // Fayl Form Data'sida courseId ni tekshirish shart emas
    const [fileFormData, setFileFormData] = useState({ 
        name: '', fileUrl: '', fileType: '', originalFileName: ''
    });
    const [fileFormErrors, setFileFormErrors] = useState({});

    // Tasdiqlash Modali State'lari
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ 
        type: '', itemId: null, itemType: '' 
    });

    // ==========================================================
    // --- Reset Funksiyalari ---
    // ==========================================================
    const resetCourseFormData = () => setCourseFormData({ 
        name: '', courseCode: '', lessonDuration: 90, courseDurationMonths: '', price: '', description: '', students: 0, imageUrl: '', imageFileName: '' 
    });
    const resetLessonFormData = () => setLessonFormData({ 
        title: '', group: '', date: new Date().toISOString().split('T')[0], description: '', attachmentUrl: '', attachmentName: '' 
    });
    const resetFileFormData = () => setFileFormData({ 
        name: '', fileUrl: '', fileType: '', originalFileName: ''
    });


    // ==========================================================
    // --- LOCAL STORAGE'GA SAQLASH (Xatolikni boshqarish bilan) ---
    // ==========================================================
    useEffect(() => { 
        try {
            localStorage.setItem('courses', JSON.stringify(courses)); 
        } catch (error) {
            console.error("Error saving 'courses' to localStorage. Data might be too large (e.g., large image).", error);
        }
    }, [courses]);

    useEffect(() => { localStorage.setItem('levels', JSON.stringify(levels)); }, [levels]);
    useEffect(() => { localStorage.setItem('lessons', JSON.stringify(lessons)); }, [lessons]);
    useEffect(() => { localStorage.setItem('folders', JSON.stringify(folders)); }, [folders]);


    // ==========================================================
    // *** I. Kurs CRUD Funksiyalari ***
    // ==========================================================
    const handleOpenCourseModal = (courseToEdit = null) => {

        console.log("🛠 1. Kurs modali tugmasi bosildi!");
        console.log("📦 2. Kelgan ma'lumot (courseToEdit):", courseToEdit);

        setEditingCourse(courseToEdit);
        if (courseToEdit) {
            setCourseFormData(courseToEdit);
            setPriceDisplay(formatPrice(courseToEdit.price));
        } else {
            resetCourseFormData();
            setPriceDisplay('');
        }
        setIsCourseModalOpen(true);
        setCourseFormErrors({}); 
    };
    const handleCloseCourseModal = () => {
        setIsCourseModalOpen(false);
        setEditingCourse(null);
        setCourseFormErrors({}); 
    };
    
    const handleNumberInput = (e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/\D/g, ''); 

        if (name === 'price') {
            setPriceDisplay(formatPrice(numericValue));
            setCourseFormData(prev => ({ ...prev, price: numericValue }));
        } else {
            setCourseFormData(prev => ({ ...prev, [name]: numericValue }));
        }
    };

    const handleCourseFormChange = (e) => {
        const { name, value } = e.target;
        if (['courseCode', 'courseDurationMonths'].includes(name) || name === 'price') {
            handleNumberInput(e);
            return;
        }
        setCourseFormData(prev => ({ ...prev, [name]: value }));
    };

    // Rasm yuklash va xato boshqaruvi
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onloadend = () => {
                try {
                    // Base64 ma'lumotini saqlash
                    setCourseFormData(prev => ({ 
                        ...prev, 
                        imageUrl: reader.result, 
                        imageFileName: file.name
                    }));
                } catch (error) {
                    alert("Kechirasiz, rasm fayli juda katta. Kichikroq rasm tanlang.");
                    setCourseFormData(prev => ({ 
                        ...prev, 
                        imageUrl: '', 
                        imageFileName: ''
                    }));
                    console.error("Rasm yuklashda xato:", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const validateCourseForm = () => {
        const errors = {};
        if (!courseFormData.name) errors.name = true;
        if (!courseFormData.price) errors.price = true;
        setCourseFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Kursni saqlash
    const handleSaveCourse = (e) => {
        e.preventDefault();
        if (!validateCourseForm()) return;

        const dataToSave = { 
            ...courseFormData, 
            price: courseFormData.price ? courseFormData.price.replace(/\D/g, '') : '', 
            courseDurationMonths: Number(courseFormData.courseDurationMonths) || 0,
            students: courseFormData.students || 0
        };

        if (editingCourse) {
            setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...dataToSave } : c));
        } else {
            const newId = Date.now(); 
            const newCourse = { id: newId, color: getRandomColor(newId), ...dataToSave };
            setCourses([...courses, newCourse]);
        }
        handleCloseCourseModal();
    };

    const handleDeleteCourse = (courseId) => {
        setConfirmAction({ type: 'DELETE', itemId: courseId, itemType: 'course' });
        setIsConfirmModalOpen(true);
    };

    // ==========================================================
    // *** II. Daraja CRUD Funksiyalari ***
    // ==========================================================
    const handleOpenLevelModal = (levelToEdit = null) => { 
        setEditingLevel(levelToEdit);
        if (levelToEdit) setLevelFormData(levelToEdit);
        else setLevelFormData({ name: '', price: '', description: '' });
        setIsLevelModalOpen(true);
        setLevelFormErrors({});
    };
    const handleCloseLevelModal = () => { 
        setIsLevelModalOpen(false); 
        setEditingLevel(null); 
        setLevelFormErrors({});
    };
    const handleLevelFormChange = (e) => setLevelFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const validateLevelForm = () => {
        const errors = {};
        if (!levelFormData.name) errors.name = true;
        setLevelFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // TUZATILDI: Daraja saqlashda activeCourseId ni qo'shish
    const handleSaveLevel = (e) => { 
        e.preventDefault();
        if (!validateLevelForm()) return;
        const dataToSave = { 
            ...levelFormData, 
            price: levelFormData.price.replace(/\D/g, ''),
            courseId: activeCourseId // <--- QO'SHILDI
        };

        if (editingLevel) {
            setLevels(levels.map(l => l.id === editingLevel.id ? { ...l, ...dataToSave } : l));
        } else {
            const newId = Date.now() + 1; 
            const newLevel = { id: newId, color: getRandomColor(newId), ...dataToSave };
            setLevels([...levels, newLevel]);
        }
        handleCloseLevelModal();
    };
    const handleDeleteLevel = (levelId) => {
        setConfirmAction({ type: 'DELETE', itemId: levelId, itemType: 'level' });
        setIsConfirmModalOpen(true);
    };


    // ==========================================================
    // *** III. Dars CRUD Funksiyalari ***
    // ==========================================================
    const handleOpenLessonModal = (lessonToEdit = null) => {
        setEditingLesson(lessonToEdit);
        if (lessonToEdit) {
            setLessonFormData(lessonToEdit);
        } else {
            resetLessonFormData();
        }
        setIsLessonModalOpen(true);
        setLessonFormErrors({});
    };
    
    const handleLessonFormChange = (e) => setLessonFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCloseLessonModal = () => { setIsLessonModalOpen(false); setEditingLesson(null); resetLessonFormData(); setLessonFormErrors({}); };
    
    // Dars uchun fayl yuklash
    const handleLessonAttachmentUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLessonFormData(prev => ({
                    ...prev,
                    attachmentUrl: reader.result,
                    attachmentName: file.name
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const validateLessonForm = () => {
        const errors = {};
        if (!lessonFormData.title) errors.title = true;
        if (!lessonFormData.group) errors.group = true;
        setLessonFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // TUZATILDI: Dars saqlashda activeCourseId ni qo'shish
    const handleSaveLesson = (e) => {
        e.preventDefault();
        if (!validateLessonForm()) return;

        const dataToSave = { 
            ...lessonFormData, 
            date: lessonFormData.date || new Date().toISOString().split('T')[0],
            courseId: activeCourseId // <--- QO'SHILDI
        };

        if (editingLesson) {
            setLessons(lessons.map(l => l.id === editingLesson.id ? { ...l, ...dataToSave } : l));
        } else {
            const newId = Date.now();
            const newLesson = { id: newId, ...dataToSave };
            setLessons([...lessons, newLesson]);
        }
        
        handleCloseLessonModal();
    };
    
    const handleDeleteLesson = (lessonId) => {
        setConfirmAction({ type: 'DELETE', itemId: lessonId, itemType: 'lesson' });
        setIsConfirmModalOpen(true);
    };


    // ==========================================================
    // *** IV. Materiallar CRUD Funksiyalari ***
    // ==========================================================
    const handleOpenFileModal = (fileToEdit = null) => {
        setEditingFile(fileToEdit);
        if (fileToEdit) {
            setFileFormData({
                name: fileToEdit.name,
                fileUrl: fileToEdit.url,
                fileType: fileToEdit.type,
                originalFileName: fileToEdit.originalFileName || fileToEdit.name
            });
        } else {
            resetFileFormData();
        }
        setIsFileModalOpen(true);
        setFileFormErrors({});
    };
    const handleCloseFileModal = () => {
        setIsFileModalOpen(false);
        setEditingFile(null);
        resetFileFormData();
        setFileFormErrors({});
    };

    // Fayl yuklashni boshqarish
    const handleFileAttachmentUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileFormData(prev => ({
                    ...prev,
                    fileUrl: reader.result,
                    fileType: file.type || 'unknown',
                    originalFileName: file.name
                }));
            };
            reader.readAsDataURL(file);
            if (!fileFormData.name || editingFile) { 
                 if (!editingFile) setFileFormData(prev => ({ ...prev, name: file.name }));
            }
        }
    };
    
    const handleFileFormChange = (e) => setFileFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validateFileForm = () => {
        const errors = {};
        if (!fileFormData.name) errors.name = true;
        if (!fileFormData.fileUrl) errors.fileUrl = true;
        setFileFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    // TUZATILDI: Fayl saqlashda activeCourseId ni qo'shish
    const handleSaveFile = (e) => {
        e.preventDefault();
        if (!validateFileForm()) return;
        
        const dataToSave = { 
            name: fileFormData.name, 
            url: fileFormData.fileUrl, 
            type: fileFormData.fileType,
            originalFileName: fileFormData.originalFileName,
            size: "N/A",
            courseId: activeCourseId // <--- QO'SHILDI
        };
        
        if (editingFile) {
            setFolders(folders.map(f => f.id === editingFile.id ? { ...f, ...dataToSave } : f));
        } else {
            const newId = Date.now();
            const newFile = { id: newId, ...dataToSave };
            setFolders([...folders, newFile]);
        }
        
        handleCloseFileModal();
    };
    const handleDeleteFile = (fileId) => {
        setConfirmAction({ type: 'DELETE', itemId: fileId, itemType: 'file' });
        setIsConfirmModalOpen(true);
    };


    // ==========================================================
    // *** V. Maxsus Tasdiqlash Modali Funksiyalari ***
    // ==========================================================
    const handleConfirm = () => {
        const { type, itemId, itemType } = confirmAction;
        setIsConfirmModalOpen(false);
        setConfirmAction({ type: '', itemId: null, itemType: '' });

        if (type === 'DELETE') {
            if (itemType === 'course') {
                setCourses(courses.filter(c => c.id !== itemId));
                // Kurs o'chirilganda, unga tegishli barcha ichki ma'lumotlarni ham o'chirish muhim!
                setLevels(prev => prev.filter(l => l.courseId !== itemId));
                setLessons(prev => prev.filter(l => l.courseId !== itemId));
                setFolders(prev => prev.filter(f => f.courseId !== itemId));
                
                if (activeCourseId === itemId) setActiveCourseId(null);
            } else if (itemType === 'level') {
                setLevels(levels.filter(l => l.id !== itemId));
            } else if (itemType === 'lesson') {
                setLessons(lessons.filter(l => l.id !== itemId));
            } else if (itemType === 'file') {
                setFolders(folders.filter(f => f.id !== itemId));
            }
        }
    };

    const handleCancelConfirm = () => {
        setIsConfirmModalOpen(false);
        setConfirmAction({ type: '', itemId: null, itemType: '' });
    };

    const renderConfirmModal = () => {
        if (!isConfirmModalOpen) return null;
        const itemName = confirmAction.itemType === 'course' ? 'kursni' : 
                         confirmAction.itemType === 'level' ? 'darajani' : 
                         confirmAction.itemType === 'lesson' ? 'darsni' : 'faylni';
        
        return (
            <div className="modal-overlay">
                <div className="confirmation-modal"> 
                    <h3>Tasdiqlash</h3>
                    <p>Rostdan ham bu {itemName} o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</p>
                    <div className="modal-actions">
                        <button className="cancel-button" onClick={handleCancelConfirm}>Bekor qilish</button>
                        <button className="confirm-delete-button" onClick={handleConfirm}>O'chirish</button>
                    </div>
                </div>
            </div>
        );
    };


    // ==========================================================
    // --- VI. Render Modallar (To'liq) ---
    // ==========================================================
    
    // 1. Kurs qo'shish/tahrirlash modali
    const renderCourseModal = () => {
        console.log("🖥 4. renderCourseModal tekshirilmoqda. Ochiqmi?:", isCourseModalOpen);
        
        if (!isCourseModalOpen) return null;
        
        console.log("🎯 5. Modal ekranga chizilmoqda!");

        const durationOptions = [60, 90, 120, 150, 180, 210, 240, 270, 300];

        return (
          <div className="modal-overlay" style={{ zIndex: 999999 }}>
            <div className="add-course-modal modal-right-slide">
              <div className="modal-header">
                <h3>{editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}</h3>
                <button className="close-button" onClick={handleCloseCourseModal}>
                  <i className="fas fa-times"></i> 
                </button>
              </div>
              <form onSubmit={handleSaveCourse} className="modal-body">
                <div className="form-group">
                    <label htmlFor="name">Ism</label>
                    <input type="text" id="name" name="name" value={courseFormData.name} onChange={handleCourseFormChange} className={courseFormErrors.name ? 'input-error' : ''} autoFocus />
                </div>
                
                <div className="form-group attachment-group course-image-upload">
                    <label>Kurs rasmi</label>
                    <input 
                        type="file" 
                        id="courseImageFile" 
                        name="courseImageFile" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <div className="attachment-display">
                        <span className="file-name file-preview-text">
                            {courseFormData.imageFileName || "Rasm tanlanmagan"}
                        </span>
                        <button type="button" className="upload-btn small-btn" onClick={() => document.getElementById('courseImageFile').click()}>
                            <i className="fas fa-upload"></i> Browse
                        </button>
                        {courseFormData.imageFileName && (
                            <button type="button" className="remove-btn small-btn" onClick={() => setCourseFormData(prev => ({ ...prev, imageUrl: '', imageFileName: '' }))}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    {courseFormData.imageUrl && (
                        <img src={courseFormData.imageUrl} alt="Kurs rasmi" className="image-preview-small" />
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="courseCode">Kurs kodi (faqat raqam)</label>
                    <input type="text" id="courseCode" name="courseCode" value={courseFormData.courseCode} onChange={handleNumberInput} inputMode="numeric" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lessonDuration">Dars davomiyligi (daqiqada)</label>
                  <select id="lessonDuration" name="lessonDuration" value={courseFormData.lessonDuration} onChange={handleCourseFormChange}>
                    {durationOptions.map(min => (<option key={min} value={min}>{min} daqiqa</option>))}
                  </select>
                </div>
                
                <div className="form-group">
                    <label htmlFor="courseDurationMonths">Kurs davomiyligi (oylarda)</label>
                    <input type="text" id="courseDurationMonths" name="courseDurationMonths" value={courseFormData.courseDurationMonths} onChange={handleNumberInput} inputMode="numeric" />
                </div>
                
                <div className="form-group">
                    <label htmlFor="price">Narx (UZS)</label>
                    <input 
                        type="text" 
                        id="price" 
                        name="price" 
                        value={priceDisplay} 
                        onChange={handleNumberInput} 
                        inputMode="numeric"
                        placeholder="123 456" 
                        className={courseFormErrors.price ? 'input-error' : ''}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Izoh</label>
                    <textarea id="description" name="description" value={courseFormData.description} onChange={handleCourseFormChange} />
                </div>
                <button type="submit" className="save-button">Saqlash</button>
              </form>
            </div>
          </div>
        );
    };
    
    // 2. Daraja qo'shish/tahrirlash modali
    const renderLevelModal = () => {
        if (!isLevelModalOpen) return null;
        
        const priceDisplayLevel = formatPrice(levelFormData.price);

        return (
            <div className="modal-overlay">
                <div className="add-course-modal modal-right-slide level-modal-wider"> 
                  <div className="modal-header">
                    <h3>{editingLevel ? 'Darajani tahrirlash' : 'Yangi daraja qo\'shish'}</h3>
                    <button className="close-button" onClick={handleCloseLevelModal}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleSaveLevel} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="levelName">Nomi</label>
                        <input 
                            type="text" 
                            id="levelName" 
                            name="name" 
                            value={levelFormData.name} 
                            onChange={handleLevelFormChange} 
                            className={levelFormErrors.name ? 'input-error' : ''} 
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="levelPrice">Narx (UZS)</label>
                        <input 
                            type="text" 
                            id="levelPrice" 
                            name="price" 
                            value={priceDisplayLevel} 
                            onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, '');
                                setLevelFormData(prev => ({ ...prev, price: numericValue }));
                            }} 
                            inputMode="numeric"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="levelDescription">Izoh</label>
                        <textarea id="levelDescription" name="description" value={levelFormData.description} onChange={handleLevelFormChange} />
                    </div>
                    <button type="submit" className="save-button">Saqlash</button>
                  </form>
                </div>
            </div>
        );
    }; 

    // 3. Dars qo'shish modali (KALENDAR CHEKLOVLARI BILAN)
    const renderLessonModal = () => {
        if (!isLessonModalOpen) return null;

        const minDateLimit = '1500-01-01'; 
        const maxDateLimit = '2060-12-31'; 
        
        return (
            <div className="modal-overlay">
                <div className="add-lesson-modal modal-right-slide lesson-modal-wider">
                    <span className='exit'  >x</span>
                    <div className="modal-header">
                        <h3>{editingLesson ? 'Darsni Tahrirlash' : 'Yangi Dars qo\'shish'}</h3>
                        <button className="close-button" onClick={handleCloseLessonModal}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleSaveLesson} className="modal-body">
                        <div className="form-group">
                            <label htmlFor="title">Sarlavha (Title)</label>
                            <input type="text" id="title" name="title" value={lessonFormData.title} onChange={handleLessonFormChange} className={lessonFormErrors.title ? 'input-error' : ''} autoFocus/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="group">Guruh (Group)</label>
                            <input type="text" id="group" name="group" value={lessonFormData.group} onChange={handleLessonFormChange} className={lessonFormErrors.group ? 'input-error' : ''}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Sana (Date)</label>
                            <input 
                                type="date" 
                                id="date" 
                                name="date" 
                                value={lessonFormData.date} 
                                onChange={handleLessonFormChange} 
                                min={minDateLimit}  
                                max={maxDateLimit} 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Izoh</label>
                            <textarea id="description" name="description" value={lessonFormData.description} onChange={handleLessonFormChange} />
                        </div>

                        <div className="form-group attachment-group">
                            <label>Fayl biriktirish (Ixtiyoriy)</label>
                            <input 
                                type="file" 
                                id="lessonAttachment" 
                                onChange={handleLessonAttachmentUpload}
                                style={{ display: 'none' }}
                            />
                            <div className="attachment-display">
                                <span className="file-name file-preview-text">
                                    {lessonFormData.attachmentName || "Fayl tanlanmagan"}
                                </span>
                                <button type="button" className="upload-btn small-btn" onClick={() => document.getElementById('lessonAttachment').click()}>
                                    <i className="fas fa-upload"></i> Yuklash
                                </button>
                                {lessonFormData.attachmentName && (
                                    <button type="button" className="remove-btn small-btn" onClick={() => setLessonFormData(prev => ({ ...prev, attachmentUrl: '', attachmentName: '' }))}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="save-button">Saqlash</button>
                    </form>
                </div>
             </div>
        );
    };
    
    // 4. Materiallar (Fayl) qo'shish modali
    const renderFileModal = () => {
        if (!isFileModalOpen) return null;
        return (
             <div className="modal-overlay">
                <div className="add-course-modal modal-right-slide level-modal-wider"> 
                  <div className="modal-header">
                    <h3>{editingFile ? 'Faylni Tahrirlash' : 'Yangi Fayl (Material) qo\'shish'}</h3>
                    <button className="close-button" onClick={handleCloseFileModal}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <form onSubmit={handleSaveFile} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="name">Fayl nomi</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={fileFormData.name} 
                            onChange={handleFileFormChange} 
                            placeholder="Masalan: 1-Dars taqdimoti.pdf"
                            className={fileFormErrors.name ? 'input-error' : ''}
                        />
                    </div>
                    <div className="form-group attachment-group">
                        <label>Faylni tanlang</label>
                        <input 
                            type="file" 
                            id="materialFile" 
                            onChange={handleFileAttachmentUpload}
                            style={{ display: 'none' }}
                        />
                        <div className="attachment-display">
                            <span className={`file-name file-preview-text ${fileFormErrors.fileUrl ? 'input-error' : ''}`}>
                                {fileFormData.originalFileName || "Fayl tanlanmagan"}
                            </span>
                            <button type="button" className="upload-btn" onClick={() => document.getElementById('materialFile').click()}>
                                <i className="fas fa-cloud-upload-alt"></i> Yuklash
                            </button>
                            {fileFormData.originalFileName && (
                                <button type="button" className="remove-btn" onClick={resetFileFormData}>
                                    <i className="fas fa-times"></i> O'chirish
                                </button>
                            )}
                        </div>
                        {fileFormErrors.fileUrl && <span className="error-text-small">Fayl yuklanishi shart!</span>}
                    </div>
                    <button type="submit" className="save-button">Saqlash</button>
                  </form>
                </div>
              </div>
        );
    };

    // ==========================================================
    // --- VII. Asosiy Content Render Funksiyalari ---
    // ==========================================================
    const renderCourseCard = (course) => {
        const style = course.imageUrl ? { backgroundImage: `url(${course.imageUrl})` } : { backgroundColor: course.color || getRandomColor(course.id) };
        return (
            <div key={course.id} className="course-card">
                <div 
                    className={`card-image-container ${course.imageUrl ? 'has-image' : ''}`} 
                    style={style} 
                    onClick={() => setActiveCourseId(course.id)}
                >
                    <span className="card-initials">{getInitials(course.name)}</span>
                    <div className="card-actions">
                        <button className="action-button edit-btn" onClick={(e) => { e.stopPropagation(); handleOpenCourseModal(course); }} title="Tahrirlash"><i className="fas fa-pen"></i></button>
                        <button className="action-button delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} title="O'chirish"><i className="fas fa-trash"></i></button>
                    </div>
                </div>
                <div className="card-info" onClick={() => setActiveCourseId(course.id)}>
                    <h3 className="course-name">{course.name}</h3>
                    <p className="course-price">
                        {course.price ? `${formatPrice(course.price)} UZS` : 'Narx belgilanmagan'}
                    </p>
                </div>
            </div>
        );
    };

    const renderCourseDashboard = () => (
        <div className="course-dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Kurslar</h2>
                <button className="add-course-button" onClick={() => handleOpenCourseModal()}>
                    <i className="fas fa-plus"></i> Yangisini qo'shish
                </button>
            </div>
            <div className="course-list-content">
                {courses.length === 0 ? (
                    <div className="empty-state"><p>Hozircha kurslar mavjud emas. Yangi kurs qo'shish tugmasi orqali boshlang.</p></div>
                ) : (
                    <div className="course-grid">
                        {courses.map(renderCourseCard)}
                    </div>
                )}
            </div>
        </div>
    );

    const renderCourseDetails = () => {
        const course = courses.find(c => c.id === activeCourseId);
        if (!course) return <button className="back-button" onClick={() => setActiveCourseId(null)}><i className="fas fa-arrow-left"></i> Kurs topilmadi. Ortga qaytish</button>;

        const courseStyle = course.imageUrl 
            ? { backgroundImage: `url(${course.imageUrl})` } 
            : { backgroundColor: course.color || getRandomColor(course.id) };

        const renderTabContent = () => {
            // TUZATILDI: JORIY KURSGA TEGISHLI MALUMOTLARNI FILTRLASH
            const currentCourseLevels = levels.filter(l => l.courseId === activeCourseId); 
            const currentCourseLessons = lessons.filter(l => l.courseId === activeCourseId); 
            const currentCourseFiles = folders.filter(f => f.courseId === activeCourseId); 

            switch (activeTab) {
                case 'levels': // Darajalar 
                    return (
                        <div className="tab-content">
                            <div className="levels-header">
                                <button className="add-level-button" onClick={() => handleOpenLevelModal(null)}>
                                    <i className="fas fa-plus"></i> Daraja qo'shish
                                </button>
                            </div>
                            {currentCourseLevels.length === 0 ? ( // FILTRLANGAN RO'YXAT
                                <div className="empty-tab-state"><p>Hozircha darajalar yo'q.</p></div>
                            ) : (
                                <div className="course-grid level-grid">
                                    {currentCourseLevels.map(level => ( // FILTRLANGAN RO'YXAT
                                        <div key={level.id} className="course-card level-card" style={{ cursor: 'default' }}>
                                            <div className="card-image-container" style={{ backgroundColor: level.color || getRandomColor(level.id) }}>
                                                <span className="card-initials">{getInitials(level.name)}</span>
                                                <div className="card-actions">
                                                    <button className="action-button edit-btn" onClick={(e) => { e.stopPropagation(); handleOpenLevelModal(level); }} title="Tahrirlash"><i className="fas fa-pen"></i></button>
                                                    <button className="action-button delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteLevel(level.id); }} title="O'chirish"><i className="fas fa-trash"></i></button>
                                                </div>
                                            </div>
                                            <div className="card-info">
                                                <h4 className="course-name">{level.name}</h4>
                                                <p className="course-price">{formatPrice(level.price)} UZS</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                
                case 'lessons': // Onlayn Darslar
                    return (
                        <div className="tab-content">
                            <div className="lessons-header">
                                <button className="add-lesson-button" onClick={() => handleOpenLessonModal(null)}><i className="fas fa-plus"></i> Dars qo'shish</button>
                            </div>
                            {currentCourseLessons.length === 0 ? ( // FILTRLANGAN RO'YXAT
                                <div className="empty-tab-state"><p>Hozircha onlayn darslar yo'q.</p></div>
                            ) : (
                                <table className="data-table">
                                    <thead><tr><th>#</th><th>Title</th><th>Group</th><th>Date</th><th>Izoh</th><th>Fayl</th><th>Amallar</th></tr></thead>
                                    <tbody>
                                        {currentCourseLessons.map((lesson, index) => ( // FILTRLANGAN RO'YXAT
                                            <tr key={lesson.id}>
                                                <td>{index + 1}</td>
                                                <td>{lesson.title}</td>
                                                <td>{lesson.group}</td>
                                                <td>{lesson.date}</td>
                                                <td>{lesson.description || '-'}</td>
                                                <td>{lesson.attachmentName ? <a href={lesson.attachmentUrl} download={lesson.attachmentName} className="download-link"><i className="fas fa-download"></i> {lesson.attachmentName}</a> : '-'}</td>
                                                <td className="actions-cell">
                                                    <button className="action-icon-button edit" onClick={() => handleOpenLessonModal(lesson)} title="Tahrirlash"><i className="fas fa-pen"></i></button>
                                                    <button className="action-icon-button delete" onClick={() => handleDeleteLesson(lesson.id)} title="O'chirish"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    );

                case 'materials': // Materiallar
                    return (
                        <div className="tab-content materials-tab">
                            <div className="materials-header">
                                <button className="add-folder-button" onClick={() => handleOpenFileModal(null)}><i className="fas fa-plus"></i> Fayl qo'shish</button>
                            </div>
                            <table className="data-table file-table">
                                <thead><tr><th></th><th>Fayl nomi</th><th>Fayl turi</th><th>Amallar</th></tr></thead>
                                <tbody>
                                    {currentCourseFiles.length === 0 ? ( // FILTRLANGAN RO'YXAT
                                        <tr><td colSpan="4">Hozircha materiallar yo'q.</td></tr>
                                    ) : (
                                        currentCourseFiles.map(file => ( // FILTRLANGAN RO'YXAT
                                            <tr key={file.id}>
                                                <td><i className={`fas fa-${file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'file-pdf' : file.type.includes('zip') ? 'file-archive' : 'file'}`}></i></td>
                                                <td><a href={file.url} download={file.name} className="download-link">{file.name}</a></td>
                                                <td>{file.type}</td>
                                                <td className="actions-cell">
                                                    <button className="action-icon-button edit" onClick={() => handleOpenFileModal(file)} title="Tahrirlash"><i className="fas fa-pen"></i></button>
                                                    <button className="action-icon-button delete" onClick={() => handleDeleteFile(file.id)} title="O'chirish"><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );

                case 'groups':
                    return (
                        <div className="tab-content groups-tab">
                            <div className="groups-info-container">
                                <h4>Guruhlar bo'limi</h4>
            
                            </div>
                            
                            <table className="data-table group-table" style={{marginTop: '25px'}}>
                                <thead>
                                    <tr>
                                        <th>Guruh nomi</th>
                                        <th>O'qituvchi</th>
                                        <th>Dars vaqti</th>
                                        <th>Talabalar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Statik ma'lumotlar (Tugmasiz) */}
                                    <tr><td>Guruh A1 (Beginner)</td><td>Aliyev Doston</td><td>Du/Chor/Ju 14:00</td><td>15 ta</td></tr>
                                    <tr><td>Guruh B2 (Intermediate)</td><td>Valiyev Sobir</td><td>Se/Pay/Shan 18:30</td><td>12 ta</td></tr>
                                    <tr><td>Guruh C1 (Advanced)</td><td>Karimov Nodir</td><td>Har kuni ertalab</td><td>8 ta</td></tr>
                                    <tr><td>Guruh B1 (Pre-Intermediate)</td><td>Ahmadjonova Lola</td><td>Du/Chor/Ju 18:00</td><td>14 ta</td></tr>
                                </tbody>
                            </table>
                        </div>
                    );
                default: return (<div className="tab-content"><div className="empty-tab-state"><p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} bo'limida ma'lumot yo'q.</p></div></div>);
            }
        };

        return (
            <div className="course-details-page">
                <button className="back-button" onClick={() => setActiveCourseId(null)}><i className="fas fa-arrow-left"></i> Ortga</button>
                <div className="course-content-wrapper">
                    <div className="course-sidebar">
                        <div className={`course-image-big ${course.imageUrl ? 'has-image-details' : ''}`} style={courseStyle}>
                            <span className="card-initials-details">{getInitials(course.name)}</span>
                            <div className="image-actions-top">
                                <i className="fas fa-pen image-action-icon" onClick={() => handleOpenCourseModal(course)} title="Tahrirlash"></i>
                                <i className="fas fa-trash image-action-icon" onClick={() => handleDeleteCourse(course.id)} title="O'chirish"></i>
                            </div>
                            <h3>{course.name}</h3>
                        </div>
                        <div className="course-info-list detail-list-spaced">
                            <p><strong>Narx:</strong> {formatPrice(course.price)} UZS</p>
                            <p><strong>Talabalar soni:</strong> {course.students || 0}</p> 
                            <p><strong>Dars davomiyligi:</strong> {course.lessonDuration || 90} daqiqa</p>
                            <p><strong>Davomiyligi:</strong> {course.courseDurationMonths} oy</p>
                            <p className="course-description-text"><strong>Tavsif:</strong> {course.description || 'Tavsif kiritilmagan.'}</p>
                        </div>
                    </div>
                    <div className="course-main-content">
                        <div className="tabs-nav">
                            <button className={`tab-link ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>Guruhlar</button>
                            <button className={`tab-link ${activeTab === 'levels' ? 'active' : ''}`} onClick={() => setActiveTab('levels')}>Darajalar</button>
                            <button className={`tab-link ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Onlayn Darslar</button>
                            <button className={`tab-link ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Materiallar</button>
                        </div>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        );
    };
    
    // --- Asosiy Render Qismi ---
    return (
        <div className="center-automation-app">
            {activeCourseId ? renderCourseDetails() : renderCourseDashboard()}
            {renderCourseModal()}
            {renderLevelModal()}
            {renderLessonModal()}
            {renderFileModal()}
            {renderConfirmModal()}
        </div>
    );
};

export default CenterAutomation;