import React from "react";
import BoardSection from "./BoardSection";
import AddLeadToggleButton from "./AddLeadToggleButton";
import AddLeadForm from "./AddLeadForm";

function BoardColumn({
  column,
  sections,
  leads,
  sources,
  isAddingLead,
  onToggleAddLead,
  onAddLead,
  onOpenSourceManager,
  showAddButton,
  // onAddSection olib tashlandi, unga hojat yo'q
  onEditSection,
  onDeleteSection,
  onSmsSection,
  onDragStart,
  onDropCard,
  onEditLead,
  onDeleteLead
}) {
  return (
    <div className="h-100 d-flex flex-column rounded shadow-sm" style={{ backgroundColor: '#ebecf0', maxHeight: '100%' }}>
      
      {/* COLUMN HEADER (Tahrirlash va chalg'ituvchi ☰ tugmasi to'liq olib tashlandi!) */}
      <div className="p-3 pb-2 d-flex justify-content-between align-items-center">
        <div className="fw-bold text-dark text-uppercase" style={{ fontSize: '15px' }}>
          {column.title} <span className="text-muted ms-1">({leads.length})</span>
        </div>
        {/* BU YERDAGI TUGMA O'CHIRILDI */}
      </div>

      {/* COLUMN BODY */}
      <div className="p-2 flex-grow-1 overflow-auto hide-scrollbars">
        
        {/* LID QO'SHISH TUGMASI VA FORMASI */}
        {showAddButton && (
          <div className="mb-3">
            {!isAddingLead ? (
              <AddLeadToggleButton onToggle={onToggleAddLead} />
            ) : (
              <AddLeadForm 
                sources={sources}
                sections={sections}
                currentSectionId={sections.length > 0 ? sections[0].id : ""}
                onSave={(data) => onAddLead(data, column.id)}
                onCancel={onToggleAddLead}
                onOpenSourceManager={onOpenSourceManager}
              />
            )}
          </div>
        )}

        {/* SECTION'LAR (Naborlar) */}
        {sections.map(sec => {
          const sectionLeads = leads.filter(l => l.sectionId === sec.id);
          return (
            <BoardSection
              key={sec.id}
              section={sec}
              cards={sectionLeads}
              onDragStart={onDragStart}
              onDropCard={onDropCard}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
              onSmsSection={onSmsSection}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
            />
          );
        })}

        {/* O'chirib tashlangan funksiya haqida eslatma ham to'g'rilandi */}
        {sections.length === 0 && <div className="text-center text-muted small mt-4">Ushbu ustunda naborlar yo'q. <br/> Tepadagi "=" tugmasi orqali qo'shing.</div>}

      </div>
    </div>
  );
}

export default BoardColumn;