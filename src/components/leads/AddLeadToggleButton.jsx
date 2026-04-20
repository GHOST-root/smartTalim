import React from "react";

function AddLeadToggleButton({ onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="btn w-100 d-flex align-items-center justify-content-center gap-2"
      style={{
        background: "#2d9cdb",
        color: "#fff",
        height: 42,
        borderRadius: 8,
        whiteSpace: "nowrap" // 🔴 1 qatordan chiqmasin
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          color: "#2d9cdb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700
        }}
      >
        +
      </span>
      QO‘SHISH
    </button>
  );
}

export default AddLeadToggleButton;
