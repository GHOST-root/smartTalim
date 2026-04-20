import React from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ payment, student, onClose }) => {
  if (!payment || !student) return null;

  // Chop etish funksiyasi
  const handlePrint = () => {
    window.print(); 
  };

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="receipt-modal-header">
          <h2>Kvitansiya</h2>
          <button className="close-btn" onClick={onClose} style={{border:'none', background:'none', cursor:'pointer'}}>
            <i className="fa-solid fa-xmark text-muted"></i>
          </button>
        </div>

        <div className="receipt-modal-body">
          
          <div className="receipt-paper">
            <div className="receipt-logo">modme</div>
            
            <div className="receipt-barcode">
              <i className="fa-regular fa-image" style={{marginRight: '8px'}}></i> Shtrix-kod
            </div>

            <div className="receipt-info-row"><strong>Tekshirish raqami:</strong> №{payment.id || '8537098'}</div>
            <div className="receipt-info-row"><strong>Kompaniya:</strong> CRM2</div>
            <div className="receipt-info-row"><strong>Filial:</strong> Yunusobod filiali</div>
            <div className="receipt-info-row"><strong>Talaba:</strong> {student.name}</div>
            <div className="receipt-info-row"><strong>Telefon:</strong> {student.phone.replace('+998 ', '')}</div>
            <div className="receipt-info-row"><strong>Guruh:</strong> {student.groups}</div>
            <div className="receipt-info-row"><strong>Kurs narxi:</strong> 300 000 UZS</div>
            <div className="receipt-info-row"><strong>O'qituvchi:</strong> {student.teacher}</div>
            <div className="receipt-info-row"><strong>Turi:</strong> {payment.type}</div>
            <div className="receipt-info-row"><strong>To'lov miqdori:</strong> {payment.amount} UZS</div>
            <div className="receipt-info-row"><strong>Sana:</strong> {payment.date}</div>

            <div className="receipt-divider"></div>

            <div className="receipt-info-row receipt-footer-text"><strong>Xodim:</strong> {payment.employee}</div>
            <div className="receipt-info-row receipt-footer-text"><strong>Vaqt:</strong> {payment.time}</div>
          </div>

          <button className="receipt-print-btn" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Chop-etish
          </button>

        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;