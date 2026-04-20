import React, { useState, useEffect } from "react";
import TopFilters from "./TopFilters";
import BoardColumn from "./BoardColumn";
import ColumnSettings from "./ColumnSettings";
import SourceManagerModal from "./SourceManagerModal";
import LeadArchiveModal from "./LeadArchiveModal";
import LeadFormBuilderModal from "./LeadFormBuilderModal";
import CreateNaborModal from "./CreateNaborModal";
import EditLeadDrawer from '/src/components/leads/EditLeadDrawer';
import { leadsApi } from "../../api/leadsApi";

function LeadsBoard() {
  // === 1. STATELAR (Boshida bo'sh) ===
  const [columns, setColumns] = useState([]);
  const [sections, setSections] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sources, setSources] = useState([]);
  const [archivedLeads, setArchivedLeads] = useState([]);
  const [loading, setLoading] = useState(true); // Yuklanish holati

  const [filters, setFilters] = useState({ search: "", section: "", course: "", tag: "", source: "", employee: "", startDate: "", endDate: "" });
  const [dragItem, setDragItem] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [addingLeadColumnId, setAddingLeadColumnId] = useState(null);
  
  // MODALLAR STATELARI
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showNaborModal, setShowNaborModal] = useState(false);

  // arxiv
  // ARXIVLASH MODALI UCHUN STATELAR
  const [leadToArchive, setLeadToArchive] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");

  // === 1. BAZADAN VA XOTIRADAN MA'LUMOTLARNI TORTIB KELISH (GET) ===
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // 1. Backenddan bor ma'lumotlarni tortamiz (Endi 4 ta so'rov)
        const [colsData, leadsData, srcsData, secsData] = await Promise.all([
          leadsApi.getColumns(),
          leadsApi.getLeads(),
          leadsApi.getSources(),
          leadsApi.getSections() // <--- YANGI!
        ]);

        const rawColumns = colsData?.results || colsData || [];
        const fetchedColumns = rawColumns
          .map(col => ({ ...col, title: col.title || col.name }))
          .sort((a, b) => (a.position || 0) - (b.position || 0)); // 🔥 MANA SHU YERDA TARTIBLANADI!
        setColumns(fetchedColumns);
        setSources(srcsData?.results || srcsData || []);
        
        // 2. NABORLARNI BAZADAN OLAMIZ (LocalStorage o'rniga)
        const rawSections = secsData?.results || secsData || [];
        const fetchedSections = rawSections.map(sec => ({
           ...sec,
           title: sec.title || sec.name,
           // Backend "pipeline" yoki "pipeline_id" deb yuborgan bo'lishi mumkin
           columnId: sec.pipeline || sec.pipeline_id || sec.columnId 
        }));
        setSections(fetchedSections);

        // 3. LIDLAR UCHUN XAVFSIZLIK QATLAMI
        const rawLeads = leadsData?.results || leadsData || [];
        const safeLeads = rawLeads.map(lead => {
          const backendPipelineId = lead.pipline || lead.pipeline || lead.columnId;
          return {
            ...lead,
            title: lead.full_name || lead.name,
            phone: lead.phone_number || lead.phone,
            
            // 🔥 MUHIM: Endi backenddan kelgan section ID sini to'g'ridan-to'g'ri olamiz
            sectionId: lead.section || lead.section_id || lead.sectionId, 
            columnId: backendPipelineId
          };
        });

        setLeads(safeLeads);

      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // === ORQAFONDA JIMJIT YANGILASH (POLLING) ===
  // Ekranni miltillatmasdan (loading=true qilmasdan) har 30 soniyada yangi lidlarni tekshiradi
  useEffect(() => {
    const fetchSilently = async () => {
      try {
        // Faqat eng muhim bo'lgan Lidlar va Naborlarni yangilaymiz
        const [leadsData, secsData] = await Promise.all([
          leadsApi.getLeads(),
          leadsApi.getSections()
        ]);

        const rawSections = secsData?.results || secsData || [];
        const fetchedSections = rawSections.map(sec => ({
           ...sec,
           title: sec.title || sec.name,
           columnId: sec.pipeline || sec.pipeline_id || sec.columnId 
        }));

        const rawLeads = leadsData?.results || leadsData || [];
        const safeLeads = rawLeads.map(lead => {
          const backendPipelineId = lead.pipline || lead.pipeline || lead.columnId;
          const sectionsInThisColumn = fetchedSections.filter(s => s.columnId === backendPipelineId);
          const fallbackSectionId = sectionsInThisColumn.length > 0 ? sectionsInThisColumn[0].id : null;

          return {
            ...lead,
            title: lead.full_name || lead.name,
            phone: lead.phone_number || lead.phone,
            sectionId: lead.section || lead.section_id || lead.sectionId || fallbackSectionId, 
            columnId: backendPipelineId
          };
        });

        // 🔥 loading ni ishga tushirmaymiz, shunchaki stateni almashtirib qo'yamiz.
        // React'ning o'zi faqat yangi qo'shilgan/o'zgargan lidlarni ekranga chizadi, miltillash bo'lmaydi.
        setSections(fetchedSections);
        setLeads(safeLeads);

      } catch (error) {
        console.error("Orqafonda yangilashda xatolik (bu foydalanuvchiga ta'sir qilmaydi):", error);
      }
    };

    // Har 30,000 millisoniyada (30 soniya) funksiyani qayta chaqirish
    const intervalId = setInterval(fetchSilently, 30000); 

    // Foydalanuvchi sahifadan chiqib ketsa, intervalni to'xtatish (Memory leak'ning oldini olish)
    return () => clearInterval(intervalId);
  }, []);

  /* ===== SECTION HARAKATLARI ===== */
  const handleAddSection = (columnId, title) => {
    setSections([...sections, { id: `sec-${Date.now()}`, title, columnId }]);
  };

  const handleEditSection = (id, newTitle) => {
    setSections(sections.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSection = (id) => {
    const hasLeads = leads.some(l => l.sectionId === id);
    if (hasLeads) {
      alert("Avval bu bo'limdagi lidlarni boshqa joyga ko'chiring!");
      return;
    }
    if (window.confirm("Bu bo'limni butunlay o'chirasizmi?")) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const handleSmsSection = (section) => {
    const sectionLeads = leads.filter(l => l.sectionId === section.id);
    alert(`"${section.title}" bo'limidagi ${sectionLeads.length} ta lidga SMS yuborish oynasi ochiladi!`);
  };

  /* ===== DRAG & DROP ===== */
  /* ===== DRAG & DROP ===== */
  const handleDragStart = (...args) => {
    // 1. Brauzerning 'dataTransfer' asab buzar kodlaridan butunlay voz kechamiz!
    
    // 2. BoardSection qanday ketma-ketlikda argument yubormasin, biz o'zimizga keragini ajratib olamiz:
    // Ichida "id" si bor obyektni (card) qidiramiz (eventni chetlab o'tamiz)
    const card = args.find(arg => arg && typeof arg === 'object' && arg.id && !arg.preventDefault);
    
    // Matn ko'rinishida kelgan narsani (sectionId) qidiramiz
    const fromSectionId = args.find(arg => typeof arg === 'string');

    // 3. Faqat React state'iga (xotiraga) saqlab qo'yamiz, handleDropCard shu yerdan o'qib oladi
    if (card && fromSectionId) {
      setDragItem({ card, fromSectionId });
    }
  };

  /* ===== DRAG & DROP ===== */
  /* ===== DRAG & DROP ===== */
  const handleDropCard = async (arg1, arg2) => {
    // 1. Agar kelayotgan narsa haqiqatan ham "event" bo'lsa, uni xavfsiz to'xtatamiz
    if (arg1 && typeof arg1.preventDefault === 'function') {
      arg1.preventDefault();
    }

    // 2. Qaysi Naborga (Section) tashlanayotganini topamiz
    // (BoardSection ikkita argument yuboryaptimi yoki bitta, farqi yo'q, xavfsiz ushlaymiz)
    const toSectionId = arg2 || arg1; 

    // 3. Bizda ushlab turilgan lid (dragItem) bormi? 
    // (Buni handleDragStart o'zi xotiraga yozib qo'ygan)
    if (!dragItem || !toSectionId || typeof toSectionId !== 'string') return;

    const cardId = dragItem.card.id;
    const fromSectionId = dragItem.fromSectionId;

    // Agar o'zining turgan joyiga qayta tashlansa, hech narsa qilmaymiz
    if (fromSectionId === toSectionId) {
      setDragItem(null);
      return;
    }

    const targetSection = sections.find(s => s.id === toSectionId);
    if (!targetSection) return;

    // 4. Ekranda darhol o'zgartiramiz (Tezkor UI)
    setLeads(prev => prev.map(l => l.id.toString() === cardId.toString() ? { ...l, sectionId: toSectionId, columnId: targetSection.columnId } : l));

    // 5. Orqafonda API ga xabar beramiz
    try {
      await leadsApi.updateLead(cardId, {
        pipline: targetSection.columnId, // Backend 'pipeline' yoki 'pipline' kutyapti
        section: toSectionId
      });
    } catch (error) {
      console.error("Lidni ko'chirishda xatolik:", error);
      alert("Xatolik! Lid bazada ko'chmadi. F12 -> Networkni tekshiring.");
    }

    // Jarayonni tozalaymiz
    setDragItem(null); 
  };

  /* ===== LID HARAKATLARI ===== */
  const handleAddLead = async (leadData, columnId) => {
    try {
      // 1. BACKEND KUTAYOTGAN ANIQ FORMATDA TAYYORLAYMIZ
      const payload = {
        full_name: leadData.name,       
        phone_number: leadData.phone,   
        source: leadData.source || null, 
        pipline: columnId,  
        section: leadData.sectionId, // <--- YANGI: Naborni bazaga jo'natamiz
        comment: leadData.comment,
        branch_id: 1, 
      };

      // 2. API orqali jo'natish
      const createdLead = await leadsApi.createLead(payload);

      // 3. UI (Doska) ga qo'shish. Backenddan kelgan ma'lumotni Frontend tushunadigan tilga o'giramiz
      setLeads([...leads, { 
        ...createdLead, 
        title: createdLead.full_name || leadData.name,     // UI uchun
        phone: createdLead.phone_number || leadData.phone, // UI uchun
        sectionId: leadData.sectionId 
      }]);
      
      setAddingLeadColumnId(null);
    } catch (error) {
      console.error("Lidni saqlashda xatolik:", error);
      
      // MUHIM: Backend qaytargan aynan shu xatoni tutib olamiz va chiroyli qilib ko'rsatamiz!
      if (error.response && error.response.data && error.response.data.phone_number) {
        alert("Diqqat! Bu telefon raqamiga ega mijoz bazada allaqachon mavjud. Boshqa raqam kiriting.");
      } else {
        alert("Xatolik! Lid bazaga saqlanmadi.");
      }
    }
  };

  /* ===== LID ARXIVLASH VA TIKLASH (ZAMONAVIY) ===== */
  // 1. Oynani ochish uchun
  const handleArchiveLead = (id) => {
    const lead = leads.find(l => l.id === id);
    setLeadToArchive(lead);
    setArchiveReason(""); // oldingi yozuvlarni tozalaymiz
  };

  // 2. Oynadagi "Arxivlash" tugmasi bosilganda
  const confirmArchive = async () => {
    if (!leadToArchive || !archiveReason.trim()) return;

    // Ekranda darhol o'chiramiz va arxivga qo'shamiz
    const archivedLead = { ...leadToArchive, archiveDate: new Date().toLocaleString('ru-RU'), archiveReason, archivedBy: "Joriy Xodim" };
    setArchivedLeads([archivedLead, ...archivedLeads]);
    setLeads(prev => prev.filter(c => c.id !== leadToArchive.id));

    try {
      await leadsApi.deleteLead(leadToArchive.id); // Bazadan o'chiramiz
    } catch (error) {
      console.error("Arxivlashda xatolik:", error);
    }
    
    setLeadToArchive(null); // Oynani yopamiz
  };

  // 3. Arxivdan tiklash (API orqali qayta yaratish)
  const handleRestoreLead = async (lead) => {
    if (columns.length === 0 || sections.length === 0) {
      console.warn("Lidni tiklash uchun kamida 1 ta ustun va nabor kerak.");
      return;
    }
    
    // Lidni eng birinchi ustun va naborga tushiramiz
    const targetCol = columns[0];
    const targetSec = sections.find(s => s.columnId === targetCol.id) || sections[0];

    try {
      const payload = {
        full_name: lead.title || lead.full_name || lead.name, // 🔥 XATO SHU YERDA EDI! 'name' emas, 'full_name' bo'lishi shart.
        phone_number: lead.phone,
        pipline: targetCol.id,
        section: targetSec.id,
        branch_id: 1,
      };
      
      const restoredLead = await leadsApi.createLead(payload);
      
      // UI ni yangilaymiz
      setLeads([...leads, { ...restoredLead, title: restoredLead.full_name || payload.name, phone: restoredLead.phone_number, sectionId: targetSec.id, columnId: targetCol.id }]);
      setArchivedLeads(archivedLeads.filter(l => l.id !== lead.id));
    } catch (error) {
      console.error("Tiklashda xatolik:", error);
    }
  };

  /* ===== FILTR ===== */
  /* ===== FILTR ===== */
  const filteredLeads = leads.filter(lead => {
    if (filters.search && !lead.title.toLowerCase().includes(filters.search.toLowerCase()) && !lead.phone.includes(filters.search)) return false;
    if (filters.section && lead.sectionId !== filters.section) return false;
    if (filters.course && lead.course !== filters.course) return false;
    if (filters.tag && lead.tag !== filters.tag) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.employee && lead.employee !== filters.employee) return false;
    
    // Sana bo'yicha filtr
    if (filters.startDate || filters.endDate) {
      if (lead.date) {
        try {
          const datePart = lead.date.split(',')[0]; // "24.03.2026"
          const [day, month, year] = datePart.split('.');
          const leadDate = new Date(`${year}-${month}-${day}`);
          
          if (filters.startDate && leadDate < new Date(filters.startDate)) return false;
          if (filters.endDate && leadDate > new Date(filters.endDate)) return false;
        } catch(e) {}
      }
    }
    return true;
  });

  return (
    <div className="container-fluid" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

      {/* Agar loading true bo'lsa, aylana chiqadi */}
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center gap-3 bg-white p-3 rounded shadow" style={{zIndex: 1000}}>
          <div className="spinner-border text-primary" role="status"></div>
          <span className="fw-medium text-muted">Ma'lumotlar yuklanmoqda...</span>
        </div>
      )}
      
      {/* SARLAVHA VA FILTRLAR UCHUN UMUMIY KONTEYNER */}
      <div className="w-100" style={{ flexShrink: 0 }}>
        
        {/* Sarlavha qismi */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold m-0 text-dark">Lidlar Doskasi</h4>
          
          <div className="d-flex gap-2 align-items-stretch">
            <button className="btn btn-light border text-danger fw-medium shadow-sm d-flex align-items-center gap-2" onClick={() => setShowArchive(true)}>
              <i className="fa-solid fa-box-archive"></i> Lid Arxivi
            </button>
            <button className="btn btn-light border text-muted fw-medium d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowSettings(true)}>
              <i className="fa-solid fa-list-ol"></i> Ustun sozlamalari
            </button>

            <button className="btn btn-light border text-info fw-medium shadow-sm d-flex align-items-center gap-2" onClick={() => setShowSourceManager(true)}>
              <i className="fa-solid fa-share-nodes"></i> Manbalar
            </button>
            
            <div className="dropdown d-flex">
              <button className="btn btn-light border shadow-sm px-3 d-flex align-items-center justify-content-center" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-1">
                <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => alert("Excel eksport funksiyasi ulangan")}><i className="fa-solid fa-file-excel text-success"></i> Excel'ga yuklab olish</button></li>
                <li><button className="dropdown-item d-flex align-items-center gap-2 text-primary" onClick={() => setShowFormBuilder(true)}><i className="fa-solid fa-wpforms"></i> Maxsus Lid Forma yaratish</button></li>
              </ul>
            </div>

            <button 
              className="btn btn-primary fw-medium shadow-sm d-flex align-items-center justify-content-center" 
              style={{ width: '40px', padding: '0', fontSize: '20px' }}
              onClick={() => setShowNaborModal(true)}
              title="Yangi Nabor (Guruh) yaratish"
            >
              =
            </button>
          </div>
        </div>

        {/* Filtrlar qismi */}
        <TopFilters filters={filters} setFilters={setFilters} sections={sections} sources={sources} />
      
      </div>

      {/* DOSKA - CSS GRID YORDAMIDA 3 TA USTUNLI DIZAYN */}
      <div 
        className="mt-2 pb-5 flex-grow-1" 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", /* Aniq 3 ta ustun */
          gap: "1.5rem", /* Ustunlar orasidagi ochiq masofa */
          alignItems: "start" /* Har bir ustun faqat o'ziga kerakli balandlikkacha cho'ziladi */
        }}
      >
        
        {/* Agar bazada ustunlar yo'q bo'lsa, ogohlantirish chiqaramiz */}
        {columns.length === 0 && !loading ? (
          <div className="w-100 d-flex flex-column align-items-center justify-content-center text-muted mt-5" style={{ gridColumn: "1 / -1" }}>
            <i className="fa-solid fa-folder-open fs-1 mb-3 text-secondary opacity-50"></i>
            <h5>Hali hech qanday ustun (Pipeline) yo'q</h5>
            <p><b>'Ustun sozlamalari'</b> tugmasi orqali yangi ustunlar qo'shing</p>
          </div>
        ) : (
          columns.map((col, index) => {
            
            // 🔥 MUHIM FIX: Raqam va Matn tushunmovchiligi bo'lmasligi uchun .toString() qo'shdik!
            const columnSections = sections.filter(s => s.columnId?.toString() === col.id?.toString());
            const columnLeads = filteredLeads.filter(l => l.columnId?.toString() === col.id?.toString());
            
            return (
              <div key={col.id} className="d-flex flex-column shadow-sm rounded">
                <BoardColumn
                  column={col} 
                  sections={columnSections}
                  leads={columnLeads}
                  sources={sources}
                  // qolgan hamma prop'lar o'z joyida qoladi...
                  isAddingLead={addingLeadColumnId === col.id}
                  onToggleAddLead={() => setAddingLeadColumnId(addingLeadColumnId === col.id ? null : col.id)}
                  showAddButton={index === 0} 
                  onAddLead={handleAddLead}
                  onOpenSourceManager={() => setShowSourceManager(true)}
                  onEditSection={handleEditSection}
                  onDeleteSection={handleDeleteSection}
                  onSmsSection={handleSmsSection}
                  onDragStart={handleDragStart}
                  onDropCard={handleDropCard}
                  onEditLead={(card) => setEditCard(card)}
                  onDeleteLead={handleArchiveLead}
                />
              </div>
            );
          })
        )}
      </div>

      {/* MODALLAR */}
      {showSettings && <ColumnSettings columns={columns} setColumns={setColumns} onClose={() => setShowSettings(false)} leads={leads} />}
      <SourceManagerModal isOpen={showSourceManager} onClose={() => setShowSourceManager(false)} sources={sources} setSources={setSources} />
      {/* YANGISI: */}
      <LeadArchiveModal isOpen={showArchive} onClose={() => setShowArchive(false)} archivedLeads={archivedLeads} setArchivedLeads={setArchivedLeads} onRestore={handleRestoreLead} />
      <LeadFormBuilderModal isOpen={showFormBuilder} onClose={() => setShowFormBuilder(false)} columns={columns} sources={sources} />
      
      {/* 6. NABOR YARATISH MODALI */}
      <CreateNaborModal 
        isOpen={showNaborModal} 
        onClose={() => setShowNaborModal(false)}
        courses={["Frontend", "Backend", "IELTS"]} 
        teachers={[{id: 1, name: "Behruz"}, {id: 2, name: "Azimjon"}]}
        columns={columns}
        onSave={async (data) => {
          try {
            // BACKEND KUTAYOTGAN ANIQ FORMAT:
            const payload = {
              name: data.name,           // <--- 'title' emas, 'name'
              pipeline: data.columnId,   
              branch_id: 1,              // <--- QO'SHILDI
            };
            
            const newSection = await leadsApi.createSection(payload);
            
            // Ekranga (UI) qo'shamiz
            setSections([...sections, {
               ...newSection,
               title: newSection.name || data.name, // UI 'title' ni tushunadi
               columnId: newSection.pipeline || data.columnId
            }]);
            
            alert(`${data.name} nabori bazaga muvaffaqiyatli qo'shildi!`);
          } catch (error) {
            console.error("Nabor yaratishda xatolik:", error);
            alert("Xatolik! Nabor saqlanmadi.");
          }
        }}
      />

      {/* TAHRIRLASH DRAWER */}
      <EditLeadDrawer 
        open={editCard !== null} 
        lead={editCard} 
        columns={columns}
        sections={sections}
        onClose={() => setEditCard(null)}
        onSave={async (updatedLead) => { 
          try {
            // Ekranni darhol yangilaymiz
            setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l)); 
            setEditCard(null); 
            
            // API ga o'zgarishlarni yuboramiz (faqat o'zgargan maydonlarni)
            await leadsApi.updateLead(updatedLead.id, {
              name: updatedLead.title, // Backend nomi title yoki name ekaniga e'tibor bering
              phone: updatedLead.phone,
              comment: updatedLead.comment,
              // qolgan maydonlar...
            });
          } catch (error) {
            console.error("Tahrirlashda xatolik:", error);
            alert("Saqlashda xatolik yuz berdi!");
          }
        }}
        
        // YANGILANISH: targetSectionId qo'shildi
        onTransfer={(leadId, targetColumnId, targetSectionId, branchId) => {
          if (branchId === "joriy") {
             // Lidni aynan tanlangan Ustun va Bo'limga (Section) o'tkazamiz
             setLeads(leads.map(l => l.id === leadId ? { ...l, columnId: targetColumnId, sectionId: targetSectionId } : l));
          } else {
             setLeads(leads.filter(l => l.id !== leadId)); 
             alert("Lid muvaffaqiyatli Boshqa filialga ko'chirildi!");
          }
          setEditCard(null);
        }}
        
        onConvertToStudent={(leadId) => { 
          // Lidni ekrandagi ro'yxatdan olib tashlaymiz
          setLeads(prevLeads => prevLeads.filter(l => l.id !== leadId)); 
        }}
      />

      {/* CHIROYLI ARXIVLASH MODALI */}
      {leadToArchive && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
          <div className="bg-white p-4 rounded shadow-lg" style={{ width: '400px', animation: 'fadeIn 0.2s ease-out' }}>
            <h5 className="mb-3 text-dark fw-bold">Lidni arxivlash</h5>
            <p className="text-muted mb-3" style={{ fontSize: '15px' }}>
              <strong>{leadToArchive.title}</strong> arxivga o'tkazilmoqda. Iltimos, uning sababini qisqacha yozib qoldiring:
            </p>
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Masalan: Narx qimmatlik qildi yoki telefonni ko'tarmadi..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              autoFocus
            ></textarea>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light border fw-medium" onClick={() => setLeadToArchive(null)}>Bekor qilish</button>
              <button className="btn btn-danger fw-medium" onClick={confirmArchive} disabled={!archiveReason.trim()}>Arxivlash</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LeadsBoard;