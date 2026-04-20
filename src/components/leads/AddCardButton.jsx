import React from "react";

function AddCardButton({ onAdd }) {
  return (
    <button
      onClick={onAdd}
      className="btn btn-sm d-flex align-items-center gap-2 px-2"
      style={{
        background: "#e9f4ff",
        borderRadius: 8,
        color: "#0d6efd"
      }}
    >
      <span
        style={{
          background: "#0d6efd",
          color: "#fff",
          borderRadius: "50%",
          width: 22,
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14
        }}
      >
        +
      </span>
      Card qo‘shish
    </button>
  );
}

export default AddCardButton;
