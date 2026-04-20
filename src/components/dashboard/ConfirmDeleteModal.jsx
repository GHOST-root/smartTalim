import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3 p-4 shadow-lg" 
        style={{ width: '100%', maxWidth: '380px', animation: 'fadeInDown 0.2s ease' }}
        onClick={(e) => e.stopPropagation()} // Oynani ichi bosilganda yopilib ketmasligi uchun
      >
        <div className="text-center mb-4">
          <div className="mx-auto bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h5 className="text-dark fw-semibold">O'chirishni tasdiqlaysizmi?</h5>
          <p className="text-muted small m-0 mt-2">
            Bu ma'lumotni ro'yxatdan butunlay o'chirib tashlamoqchisiz. Bu amalni ortga qaytarib bo'lmaydi.
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button className="btn btn-light w-50 fw-medium" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn btn-danger w-50 fw-medium" onClick={onConfirm}>
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;