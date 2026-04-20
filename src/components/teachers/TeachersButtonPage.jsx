import React from 'react';

function TeachersButtonPage({ onOpen }) {
  return (
    <div className="container d-flex justify-content-center mt-5">
      <div
        className="teacher-card"
        role="button"
        tabIndex={0}
        onClick={() => onOpen && onOpen()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen && onOpen(); }}
      >
        <div className="teacher-avatar">
          <img
            src="./img/ChatGPT Image Dec 21, 2025, 03_55_30 PM.png"
            alt="O'qituvchilar logosi"
            className="teacher-icon"
            width={54}
            height={54}
          />
        </div>

        <div className="teacher-text">O‘qituvchilar</div>
      </div>
    </div>
  );
}

export default TeachersButtonPage;
