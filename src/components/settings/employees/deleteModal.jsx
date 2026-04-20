import React from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  // 1. State kelmasa, umuman chizilmaydi
  if (!isOpen) return null;

  // 2. 100% eng ustki qatlamda chiqishi kafolatlangan dizayn
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999999 // Hamma narsadan ustun turishi kafolatlangan
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center',
          width: '350px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <i className="fa-solid fa-triangle-exclamation text-danger" style={{ fontSize: '45px' }}></i>
        </div>
        <h4 style={{ fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>O'chirasizmi?</h4>
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '15px' }}>
          Haqiqatan ham ushbu xodimni tizimdan o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={onClose}
            className="btn btn-light border"
            style={{ padding: '8px 20px', fontWeight: '500' }}
          >
            Bekor qilish
          </button>
          <button 
            onClick={onConfirm}
            className="btn btn-danger"
            style={{ padding: '8px 20px', fontWeight: '500' }}
          >
            Ha, o'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;