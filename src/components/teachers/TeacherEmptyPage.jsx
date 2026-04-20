function TeacherEmptyPage({ onBack, children }) {
  const goBack = () => {
    // agar parent onBack bersa, uni chaqiramiz
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    // agar history bo‘lsa — orqaga qaytadi
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // agar to‘g‘ridan-to‘g‘ri kirilgan bo‘lsa
      window.location.href = "/";
    }
  };

  return (
    <div className="page-wrapper">
      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={(e) => { e.stopPropagation(); goBack(); }}
      >
        ⬅ Orqaga qaytish
      </button>

      <div className="container mt-4">
        {children ? (
          children
        ) : (
          <div className="card p-4">
            <p className="text-muted">Ichi bo‘sh, ataylab hech narsa yo‘q</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherEmptyPage;
