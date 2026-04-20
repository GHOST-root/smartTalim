function LicenseBar() {
  return (
    <div className="license-bar mb-3">
      <div className="license-left">
        <span className="calendar">📅</span>
        <span>
          Litsenziyaning platformaga amal qilish muddati:
          <b className="danger"> 17.10.2025 - 23:59</b>
          <span className="warning"> 1 kundan kam vaqt qoldi</span>
        </span>
      </div>

      <button className="pay-btn">To‘lash</button>
    </div>
  );
}

export default LicenseBar;
