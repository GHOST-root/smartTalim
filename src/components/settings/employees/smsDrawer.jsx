import React from 'react';

const SmsDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay">
      <div className="drawer-content">
        <div className="drawer-header">
          <h4>SMS Yuborish</h4>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        <div className="drawer-body">
          <p className="modem-text">Yuboruvchi: <strong>Modem</strong></p>
          <textarea className="sms-input" placeholder="SMS matnini kiriting..."></textarea>
        </div>
        <div className="drawer-footer">
          <button className="btn-save" onClick={onClose}>Jo'natish</button>
        </div>
      </div>
    </div>
  );
};

export default SmsDrawer;