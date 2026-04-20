import React from "react";
import "./StudentDashboard.css";
import { Link } from "react-router-dom";

export default function StudentDashboard({ onBack, student }) {
  const payments = [
    {
      date: "01.10.2025",
      type: "tizim",
      amount: -250000,
      info: "Frontend • 7 dars",
      employee: "Hojimurod Nasriddinov",
      extra: "17.10.2025—31.10.2025",
      color: "danger",
    },
    {
      date: student?.date || "17.10.2025",
      type: "to'lov",
      amount: student?.sum || 400000,
      info: "Naqd pul",
      employee: "Hojimurod Nasriddinov",
      color: "success",
    },
  ];

  const studentData = student || {
    name: "Faxriddin",
    id: "1488166",
    balance: "150 000 UZS",
    phone: "91 123 44 56",
    joinDate: "17 oktabr 2025"
  };

  const tabs = [
    { name: "Guruhlar", active: true },
    { name: "Izohlar", active: false },
    { name: "Qo'ng'iroq tarixi", active: false },
    { name: "SMS", active: false },
    { name: "Tarix", active: false },
    { name: "Lid tarixi", active: false }
  ];
   
  return (
    <div className="row">
      {/* LEFT SIDEBAR - Student Card */}
      <div className="col-lg-3">
        <button className="btn btn-secondary mb-3" onClick={onBack}>
          ⬅️ Orqaga qaytish
        </button>
        <div className="card shadow-sm" style={{borderRadius: '12px', border: 'none'}}>
          <div className="card-body p-4">
            {/* Avatar and Action Icons */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-start">
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <i className="bi bi-person" style={{fontSize: '28px', color: '#6c757d'}}></i>
                </div>
                <div>
                  <h5 className="mb-0" style={{fontWeight: '600'}}>{studentData.name}</h5>
                  <small className="text-muted">id: {studentData.id}</small>
                </div>
              </div>
              
              <div className="d-flex flex-column gap-2">
                <button className="btn btn-sm rounded-circle" style={{width: '32px', height: '32px', padding: '0', border: '1px solid #ffc107'}}>
                  <i className="bi bi-pencil" style={{color: '#ffc107', fontSize: '14px'}}></i>
                </button>
                <button className="btn btn-sm rounded-circle" style={{width: '32px', height: '32px', padding: '0', border: '1px solid #ffc107'}}>
                  <i className="bi bi-envelope" style={{color: '#ffc107', fontSize: '14px'}}></i>
                </button>
                <button className="btn btn-sm rounded-circle" style={{width: '32px', height: '32px', padding: '0', border: '1px solid #dc3545'}}>
                  <i className="bi bi-trash" style={{color: '#dc3545', fontSize: '14px'}}></i>
                </button>
                <button className="btn btn-sm rounded-circle" style={{width: '32px', height: '32px', padding: '0', border: '1px solid #ffc107'}}>
                  <i className="bi bi-clock" style={{color: '#ffc107', fontSize: '14px'}}></i>
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-3">
              <span className="badge" style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                {studentData.balance}
              </span>
              <span className="text-muted ms-2" style={{fontSize: '13px'}}>balans</span>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <small className="text-muted d-block">Telefon:</small>
              <a href={`tel:${studentData.phone}`} className="text-primary" style={{
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '15px'
              }}>
                {studentData.phone}
              </a>
            </div>

            {/* Join Date */}
            <div className="mb-4">
              <small className="text-muted">
                Talaba qo'shilgan sana: <strong className="text-dark">{studentData.joinDate}</strong>
              </small>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mb-3">
              <button className="btn btn-outline-primary flex-fill" style={{fontSize: '13px', padding: '8px'}}>
                <i className="bi bi-people me-1"></i>
                Guruhga qo'shish
              </button>
              <button className="btn btn-outline-success flex-fill" style={{fontSize: '13px', padding: '8px'}}>
                <i className="bi bi-credit-card me-1"></i>
                To'lov
              </button>
            </div>

            {/* Notes */}
            <div style={{borderLeft: '4px solid #0d6efd', paddingLeft: '12px'}}>
              <textarea
                className="form-control"
                placeholder="Eslatma"
                rows="3"
                style={{
                  fontSize: '13px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  resize: 'none'
                }}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Main Content */}
      <div className="col-lg-9">
        {/* Tabs */}
        <div className="card shadow-sm mb-3" style={{borderRadius: '12px', border: 'none'}}>
          <div className="card-body p-3">
            <ul className="nav nav-tabs border-0 mb-4" style={{gap: '8px'}}>
              {tabs.map((tab, idx) => (
                <li className="nav-item" key={idx}>
                  <button 
                    className={`nav-link ${tab.active ? 'active' : ''}`} 
                    style={{
                      border: 'none',
                      borderBottom: tab.active ? '3px solid #0d6efd' : 'none',
                      color: tab.active ? '#0d6efd' : '#6c757d',
                      fontWeight: tab.active ? '500' : 'normal',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Group Info Card */}
            <div className="border rounded p-3 mb-3" style={{backgroundColor: '#ffffff'}}>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="badge bg-light text-dark mb-2" style={{fontSize: '11px'}}>FrontEnd</span>
                  <h6 className="mb-1" style={{fontWeight: '600'}}>First Course</h6>
                  <small className="text-muted">First teacher</small>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">17.10.2025 —</small>
                  <small className="text-muted d-block">17.01.2026</small>
                  <small className="text-muted d-block">Toq kunlar • 09:00</small>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <p className="mb-2" style={{fontSize: '13px'}}>
                    Holat: <span className="text-success fw-semibold">Faol (O'qishni to'laydi)</span>
                  </p>
                  <p className="mb-2" style={{fontSize: '13px'}}>
                    Talaba qo'shilgan sana: <strong>17.10.2025</strong>
                  </p>
                  <p className="mb-2" style={{fontSize: '13px'}}>
                    Faollashtirilgan: <strong>17.10.2025</strong>
                  </p>
                  <p className="mb-2" style={{fontSize: '13px'}}>
                    Bu talaba uchun narx: <strong>500000 UZS</strong>
                  </p>
                  <p className="mb-0" style={{fontSize: '13px'}}>
                    Guruh bo'yicha: 🎓 #/
                  </p>
                </div>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-outline-info btn-sm" style={{width: '40px'}}>⏸️</button>
                  <button className="btn btn-outline-danger btn-sm" style={{width: '40px'}}>👻</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Balance */}
        <div className="card shadow-sm mb-3" style={{borderRadius: '12px', border: 'none'}}>
          <div className="card-body p-3">
            <h6 className="mb-3" style={{fontWeight: '600'}}>Oylik balans xolati</h6>
            <div className="d-inline-block border rounded p-3" style={{backgroundColor: '#f8f9fa'}}>
              <small className="text-muted d-block">2025 M10 1</small>
              <h4 className="mb-0 text-success fw-bold">150,000</h4>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card shadow-sm" style={{borderRadius: '12px', border: 'none'}}>
          <div className="card-body p-3">
            <h6 className="mb-3" style={{fontWeight: '600'}}>To'lovlar</h6>
            <div className="table-responsive">
              <table className="table table-hover" style={{fontSize: '14px'}}>
                <thead style={{backgroundColor: '#f8f9fa'}}>
                  <tr>
                    <th style={{fontWeight: '500', color: '#6c757d', fontSize: '13px'}}>Sana</th>
                    <th style={{fontWeight: '500', color: '#6c757d', fontSize: '13px'}}>Turi</th>
                    <th style={{fontWeight: '500', color: '#6c757d', fontSize: '13px'}}>Miqdor</th>
                    <th style={{fontWeight: '500', color: '#6c757d', fontSize: '13px'}}>Izoh</th>
                    <th style={{fontWeight: '500', color: '#6c757d', fontSize: '13px'}}>Xodim</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{verticalAlign: 'middle'}}>{p.date}</td>
                      <td style={{verticalAlign: 'middle'}}>
                        <span className={`badge bg-${p.color}`} style={{fontSize: '11px'}}>
                          {p.type}
                        </span>
                      </td>
                      <td className={p.amount > 0 ? "text-success fw-semibold" : "text-danger fw-semibold"} style={{verticalAlign: 'middle'}}>
                        {p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()} UZS
                      </td>
                      <td style={{verticalAlign: 'middle'}}>
                        <div>{p.info}</div>
                        {p.extra && <small className="text-muted">{p.extra}</small>}
                      </td>
                      <td style={{verticalAlign: 'middle'}}>
                        <div>{p.employee}</div>
                        <small className="text-muted">17.10.2025 16:40:14</small>
                      </td>
                      <td style={{verticalAlign: 'middle'}}>
                        {p.amount > 0 ? (
                          <button className="btn btn-outline-primary btn-sm" style={{fontSize: '12px'}}>
                            <i className="bi bi-printer me-1"></i>
                            Chop etish
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              
            </div>
          </div>
          
        </div>
        <Link to="/Qarizdorlar">
      <button>Qarizdorlar</button>
        </Link>
      </div>
    </div>
  );
}