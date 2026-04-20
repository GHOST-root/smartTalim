import React, { useState } from 'react';

const Smshisob = () => {
  const [activePage, setActivePage] = useState(1);

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '24px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* 1. Litsenziya ogohlantirish paneli */}

      {/* Sarlavha va Miqdor */}
      
      {/* 2. Sahifa sarlavhasi */}
     <div className="">
     <div className="pt-3 pb-4 px-4 bg-white ">
       <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a202c', marginBottom: '24px' }}>
         Yuborilgan SMS jurnali
       </h1>
     </div>
     <div className="w-100 uzun">

</div>
     </div>
      {/* 3. Asosiy karta */}
      <div style={mainCardStyle}>
        
        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <button style={paginationArrowStyle}>&laquo;</button>
          <button style={paginationArrowStyle}>&lsaquo;</button>

          <button
            style={{
              ...paginationNumberStyle,
              backgroundColor: '#fff',
              border: '1px solid #ed8936',
              color: '#ed8936'
            }}
          >
            {activePage}
          </button>

          <button style={paginationArrowStyle}>&rsaquo;</button>
          <button style={paginationArrowStyle}>&raquo;</button>
        </div>

        {/* Empty table */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', minHeight: '300px' }}>
          {/* SMS list keyin qo‘shiladi */}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'right', marginTop: '40px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748' }}>
          mod<span style={{ color: '#f56565' }}>me</span>
        </span>
      </div>
    </div>
  );
};

// --- STYLES ---

const topBarStyle = {
  backgroundColor: '#fff',
  padding: '12px 20px',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  marginBottom: '24px',
  border: '1px solid rgb(215, 215, 215)'
};

const payButtonStyle = {
  backgroundColor: '#ed8936',
  color: 'white',
  border: 'none',
  padding: '6px 20px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '12px'
};

const mainCardStyle = {
  backgroundColor: 'transparent',
  borderRadius: '12px',
  padding: '30px',  
  minHeight: '400px'
};

const paginationArrowStyle = {
  backgroundColor: 'transparent',
  border: '1px solid #e2e8f0',
  color: '#a0aec0',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '18px'
};

const paginationNumberStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

export default Smshisob;