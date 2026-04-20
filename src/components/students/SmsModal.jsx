import React, { useState, useEffect } from 'react';

const SmsModal = ({ isOpen, onClose, selectedCount, onSuccess }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) setMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      alert("Iltimos, xabar matnini kiriting!");
      return;
    }
    onSuccess(message);
  };

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%', maxWidth: '420px', backgroundColor: '#fff', 
          padding: '24px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
            SMS yuborish <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>({selectedCount} ta talaba)</span>
          </h4>
          <span style={{ cursor: 'pointer', fontSize: '24px', color: '#aaa', lineHeight: 1 }} onClick={onClose}>✕</span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>Xabar matni</label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hurmatli talaba, sizning darsingiz..."
            style={{
              width: '100%', padding: '12px', border: '1px solid #ddd', 
              borderRadius: '6px', fontSize: '14px', resize: 'none', 
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '10px 20px', backgroundColor: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Bekor qilish
          </button>
          <button 
            onClick={handleSubmit} 
            style={{ padding: '10px 20px', backgroundColor: '#F58634', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-regular fa-paper-plane"></i> Yuborish
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsModal;