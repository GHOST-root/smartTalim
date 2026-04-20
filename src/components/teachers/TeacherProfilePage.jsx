import { useState } from "react";

function TeacherProfilePage({ teacher, onBack }) {
  const [tab, setTab] = useState("profile");
  if (!teacher) return null;

  return (
    <div className="page-wrapper">
      {/* ORQAGA */}
        {/* <button
          className="btn btn-light shadow-sm mb-3"
          onClick={onBack}
        >
          ⬅ Orqaga qaytish
        </button> */}

      <h3 className="mb-3">{teacher.name}</h3>

      {/* TABLAR */}
      <div className="d-flex gap-4 border-bottom mb-4">
        {[
          { key: "profile", label: "Profil" },
          { key: "history", label: "Tarix" },
          { key: "salary", label: "Ish haqi" },
        ].map((t) => (
          <div
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              cursor: "pointer",
              paddingBottom: 8,
              borderBottom:
                tab === t.key ? "2px solid orange" : "none",
              color: tab === t.key ? "orange" : "#555",
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* PROFIL ICHI */}
      {tab === "profile" && (
        <div className="row g-4 align-items-start">
          {/* 1️⃣ PROFIL CARD */}
          <div className="col-md-4">
            <div className="card p-4 h-100">
              <div className="d-flex justify-content-between">
                <img
                  src={teacher.photo || "https://via.placeholder.com/80"}
                  alt=""
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <span className="me-2">🇺🇿</span>
                  <span>✏️</span>
                </div>
              </div>

              <div className="mt-3 fw-bold">
                {teacher.name}
              </div>

              <div className="small text-muted">
                Telefon:{" "}
                <a href={`tel:${teacher.phone.replace(/\s/g, "")}`}>
                  {teacher.phone}
                </a>
              </div>

              <div className="mt-3 small">Rollar:</div>
              <div className="small">Filiallar:</div>

              <button className="btn badge bg-warning text-dark mt-3 align-self-center">
                itbooster
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 rounded bg-light h-100">
              <div className="d-flex justify-content-between">
                <div>
                  <span className="badge bg-secondary mb-1">
                    FrontEnd
                  </span>
                  <div className="fw-bold">First Course</div>
                </div>

                <div className="text-end ">
                  <div className="small text-muted ">
                    17.10.2025 — 17.10.2026
                  </div>
                  <div className="small">
                    Toq kunlar • 09:00
                  </div>
                  <span className="badge bg-warning text-dark mt-1">
                    
                  </span>
                  
                </div>
              </div>
            </div>
          </div>

          {/* 3️⃣ GURUHLAR – O‘NG */}
          <div className="col-md-4">
            <div className="card p-3 h-100">
              <span className="badge bg-light text-dark mb-2">
                FrontEnd
              </span>
              <div className="fw-bold">First Course</div>
              <div>Xona: Room #1</div>
              <div>Boshlash: 09:00</div>

              <hr />

              {[
                { name: "Kamoliddin", tel: "908256308" },
                { name: "Jumaozi", tel: "911234331" },
                { name: "Faxriddin", tel: "911234456" },
              ].map((p) => (
                <div
                  key={p.tel}
                  className="d-flex justify-content-between small"
                >
                  <span>{p.name}</span>
                  <a href={`tel:${p.tel}`}>{p.tel}</a>
                </div>
              ))}

              <div className="text-end mt-auto pt-3">
                Guruhga o‘tish →
              </div>
            </div>
          </div>
        </div>
      )}

     {tab === "salary" && (
  <div className="mt-3">

    <div className="mb-3">
      <div className="fw-semibold">— —</div>
      <div className="text-muted small">Jami: 0</div>
    </div>

    <div className="table-responsive">
      <table className="table table-bordered align-middle text-center">
        <thead className="table-light">
          <tr>
            <p>No</p>
            <th>Guruh / Kurs</th>
            <th>Talaba</th>
            <th>
              Darslar / Keldi / Kelmadi <br />
              / Belgilanmagan
            </th>
            <th>Belgilangan miqdor</th>
            <th>Hisoblangan miqdor</th>
            <th>Hisoblash usuli</th>
            <th>Maosh turi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="8" className="py-4 text-muted">
              Bo‘sh
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
)}

    </div>
  );
}

export default TeacherProfilePage;
