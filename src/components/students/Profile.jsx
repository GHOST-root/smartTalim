import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import { studentsApi } from "../../api/studentsApi";

import EditStudentModal from "./EditStudentModal";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
import AddGroupModal from "./AddGroupModal";
import SmsModal from "./SmsModal";

const Profile = ({ student: externalStudent, onClose }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("guruhlar");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "" });

  // SMS va To'lovlar tarixi
  const [smsList, setSmsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [receiptPayment, setReceiptPayment] = useState(null);

  // Modallar
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [historyList, setHistoryList] = useState([]);     
  const [leadHistoryList, setLeadHistoryList] = useState([]); 
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteValue, setNewNoteValue] = useState("");

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // ================= TALABANI YUKLASH =================
  useEffect(() => {
    const loadStudent = async () => {
      let foundStudent = null;

      // 1. Students sahifasidan navigate orqali state bilan kelgan (eng afzal)
      if (location.state?.student) {
        foundStudent = location.state.student;
      }
      // 2. Props orqali kelgan bo'lsa
      else if (externalStudent) {
        foundStudent = externalStudent;
      }
      // 3. URL dan ID orqali API dan qidirish
      else if (id) {
        try {
          foundStudent = await studentsApi.getStudent(id);
        } catch (error) {
          console.error("Talabani yuklashda xato:", error);
        }
      }

      if (foundStudent) {
        console.log("📌 Yuklangan student:", foundStudent);

        // ✅ FOTO - API dan kelayotgan rasm URL ni to'g'rilash
        const photoUrl = foundStudent.photo
          ? foundStudent.photo.startsWith("http")
            ? foundStudent.photo
            : `${process.env.REACT_APP_API_URL}${foundStudent.photo}`
          : foundStudent.profile_photo
            ? foundStudent.profile_photo.startsWith("http")
              ? foundStudent.profile_photo
              : `${process.env.REACT_APP_API_URL}${foundStudent.profile_photo}`
            : null;

        setStudent({
          ...foundStudent,
          photoUrl: photoUrl,
        });

        // API dan qo'shimcha ma'lumotlarni yukla
        try {
          if (foundStudent.id) {
            const fullData = await studentsApi.getStudents(foundStudent.id);
            if (fullData.sms_history) setSmsList(fullData.sms_history);
            if (fullData.payment_history)
              setPaymentsList(fullData.payment_history);
          }
        } catch (error) {
          console.error("Qo'shimcha ma'lumotlarni yuklashda xato:", error);
        }
      } else {
        setStudent({
          id: id || 999,
          full_name: "Talaba topilmadi",
          phone_number: "Noma'lum",
          groups: "Biriktirilmagan",
          teacher: "Biriktirilmagan",
          date: "Noma'lum",
          coins: 0,
          comment: "",
          status: "Noma'lum",
          photoUrl: null,
          balance: 0,
        });
      }

      setIsLoading(false);
    };

    loadStudent();
  }, [id, externalStudent, location.state]);

  // ================= BALANS YUKLASH =================
  useEffect(() => {
    const loadBalance = async () => {
      // ✅ HAQIQIY ID NI TOPISH
      const studentId = student?.id || student?.studentId;

      if (!studentId) {
        console.warn("⚠️ Student ID topilmadi:", student);
        return;
      }

      try {
        const balanceData = await studentsApi.balanceStatus(studentId, {});
        console.log(`✅ Balans yuklandi (${studentId}):`, balanceData);

        setStudent((prev) => ({
          ...prev,
          balance: balanceData.balance || balanceData?.data?.balance || 0,
        }));
      } catch (error) {
        console.error(`�� Balans yuklashda xato (${studentId}):`, error);
      }
    };

    if (student?.id || student?.studentId) {
      loadBalance();
    }
  }, [student?.id, student?.studentId]);

  // ================= TO'LOV TARIXI YUKLASH =================
  useEffect(() => {
    const fetchPayments = async () => {
      const studentId = student?.id || student?.studentId;

      if (!studentId) {
        setPayments([]);
        return;
      }

      try {
        console.log(`📥 Student ${studentId} uchun to'lovlar tarixini yuklash...`);
        const data = await studentsApi.getPaymentHistory(studentId);
        
        // Asosiy ro'yxatni olish
        let paymentsArray = data.results || data || [];
        
        // 🌟 1-YECHIM: Backend adashib hamma to'lovlarni yuborsa ham, 
        // faqat shu sahifadagi talabaga tegishli to'lovlarni filtrlab olamiz!
        const studentPayments = paymentsArray.filter(p => 
          String(p.student) === String(studentId) || 
          String(p.student_id) === String(studentId) || 
          String(p.student?.id) === String(studentId)
        );
        
        // 🌟 YECHIM: ID bo'yicha emas, yaratilgan vaqti (created_at) bo'yicha saralash!
        const sortedPayments = [...studentPayments].sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });
        
        setPayments(sortedPayments);
      } catch (error) {
        console.error("To'lovlar tarixini yuklashda xato:", error);
        setPayments([]);
      }
    };

    if (student?.id || student?.studentId) {
      fetchPayments();
    }
  }, [student?.id, student?.studentId]);

  // ================= TAB DATA YUKLASH (Tarixlar) =================
  useEffect(() => {
    const loadTabSpecificData = async () => {
      const studentId = student?.id || student?.studentId;
      if (!studentId) return;

      if (activeTab === "tarix" && historyList.length === 0) {
        try {
          const data = await studentsApi.getStudentHistory(studentId);
          setHistoryList(data.results || data || []);
        } catch (e) {
          console.error("Tarixni yuklashda xato:", e);
        }
      }

      if (activeTab === "lidtarixi" && leadHistoryList.length === 0) {
        try {
          const data = await studentsApi.getLeadHistory(studentId);
          setLeadHistoryList(data.results || data || []);
        } catch (e) {
          console.error("Lid tarixini yuklashda xato:", e);
        }
      }
    };

    loadTabSpecificData();
  }, [activeTab, student?.id]);

  // ================= HARAKATLAR =================
  const handleSendSMS = () => setIsSmsModalOpen(true);

  const confirmSendSms = async (message) => {
    try {
      const res = await studentsApi.sendSms(student.id, { message });

      const newSms = {
        id: res.id || Date.now(),
        date: new Date().toLocaleDateString("ru-RU"),
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: message,
        status: "Yuborildi",
      };
      setSmsList((prev) => [newSms, ...prev]);
      setIsSmsModalOpen(false);
      showToast("SMS muvaffaqiyatli yuborildi!");
    } catch (error) {
      console.error("SMS yuborishda xato:", error);
      alert("SMS yuborishda xatolik yuz berdi!");
    }
  };

  const handleEditSave = async (updatedData) => {
    try {
      let dataToSend;

      if (!(updatedData instanceof FormData)) {
        dataToSend = new FormData();
        Object.keys(updatedData).forEach((key) => {
          if (key === "photo" && updatedData[key] instanceof File) {
            dataToSend.append("photo", updatedData[key]);
          } else if (
            updatedData[key] !== null &&
            updatedData[key] !== undefined
          ) {
            dataToSend.append(key, updatedData[key]);
          }
        });
      } else {
        dataToSend = updatedData;
      }

      const res = await studentsApi.updateStudent(student.id, dataToSend);

      if (res) {
        const photoUrl = res.photo
          ? res.photo.startsWith("http")
            ? res.photo
            : `${process.env.REACT_APP_API_URL}${res.photo}`
          : res.profile_photo
            ? res.profile_photo.startsWith("http")
              ? res.profile_photo
              : `${process.env.REACT_APP_API_URL}${res.profile_photo}`
            : null;

        setStudent({
          ...res,
          photoUrl: photoUrl,
        });

        setIsEditOpen(false);
        showToast("Ma'lumotlar muvaffaqiyatli yangilandi!");
      }
    } catch (error) {
      console.error("Talabani yangilashda xato:", error);
      alert(
        "Xatolik: " +
          (error.response?.data?.detail || "Serverga yuborishda xato"),
      );
    }
  };

  // 🌟 ESLATMA QO'SHISH (API BILAN)
  const handleSaveNote = async () => {
    if (!newNoteValue.trim()) {
       setIsAddingNote(false);
       return;
    }
    
    // Eski izohning davomidan yangisini sana bilan qo'shib yozish
    const updatedNote = student.comment 
      ? `${student.comment}\n---\n${new Date().toLocaleDateString("ru-RU")}: ${newNoteValue}`
      : newNoteValue;

    try {
      const res = await studentsApi.updateStudent(student.id, { comment: updatedNote });
      setStudent((prev) => ({ ...prev, comment: res.comment }));
      setIsAddingNote(false);
      setNewNoteValue("");
      showToast("Eslatma saqlandi!");
    } catch (error) {
      alert("Eslatma qo'shishda xatolik yuz berdi!");
    }
  };

  const confirmDelete = async () => {
    try {
      if (student?.id) {
        await studentsApi.deleteStudent(student.id);
      }
      setIsDeleteOpen(false);
      showToast("Talaba o'chirildi!");
      setTimeout(() => {
        if (onClose) onClose();
        else navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  const handleTransfer = () => setIsGroupModalOpen(true);

  const handleFreeze = async () => {
    if (window.confirm("Talabani muzlatishni tasdiqlaysizmi?")) {
      try {
        const res = await studentsApi.updateStudent(student.id, {
          status: "Muzlatilgan",
        });
        setStudent((prev) => ({ ...prev, status: res.status }));
        showToast("Talaba muzlatildi!");
      } catch (error) {
        console.error("Muzlatishda xato:", error);
        alert("Muzlatishda xatolik yuz berdi!");
      }
    }
  };

  const handleDebtor = async () => {
    if (window.confirm("Talabani qarzdor holatiga o'tkazasizmi?")) {
      try {
        const res = await studentsApi.updateStudent(student.id, {
          status: "Qarzdor",
        });
        setStudent((prev) => ({ ...prev, status: res.status }));
        showToast("Talaba holati o'zgartirildi!");
      } catch (error) {
        console.error("Holatni o'zgartirishda xato:", error);
        alert("Holatni o'zgartirishda xatolik yuz berdi!");
      }
    }
  };

  const confirmAddToGroup = async (groupData) => {
    try {
      const newGroupName = groupData.groupName.split("(")[0].trim();
      const res = await studentsApi.addStudentToGroup(student.id, groupData);
      setStudent((prev) => ({ ...prev, groups: res.groups }));
      setIsGroupModalOpen(false);
      showToast(`Talaba ${newGroupName} guruhiga qo'shildi!`);
    } catch (error) {
      console.error("Guruhga qo'shishda xato:", error);
      alert("Guruhga qo'shishda xatolik yuz berdi!");
    }
  };

  const handleCloseProfile = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  if (isLoading)
    return (
      <div className="p-5 text-center text-muted">
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  if (!student)
    return <div className="p-5 text-center text-danger">Talaba topilmadi!</div>;

  return (
    <div className="profile-page-bg">
      <button className="profile-close" onClick={handleCloseProfile}>
        ×
      </button>

      {toast.show && (
        <div className="custom-toast">
          <i
            className="fa-solid fa-circle-check"
            style={{ marginRight: "8px" }}
          ></i>
          {toast.message}
        </div>
      )}

      <div className="row g-4">
        {/* CHAP USTUN */}
        <div className="col-lg-3">
          <div className="custom-card">
            <div className="profile-top-row">
              {/* ✅ FOTO - API DAN KELAYOTGAN RASM */}
              <div className="profile-avatar">
                {student.photo ? (
                  <img
                    width={100}
                    src={student.photo}
                    alt={student.full_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: student.photoUrl ? "none" : "flex",
                    width: "100px",
                    height: "100px",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "50%",
                  }}
                >
                  <i
                    className="fa-regular fa-image"
                    style={{ fontSize: "40px", color: "#999" }}
                  ></i>
                </div>
              </div>

              <div className="profile-actions-stack">
                <button
                  className="circle-action-btn orange"
                  title="Tahrirlash"
                  onClick={() => setIsEditOpen(true)}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  className="circle-action-btn orange"
                  title="SMS yuborish"
                  onClick={handleSendSMS}
                >
                  <i className="fa-regular fa-envelope"></i>
                </button>
                <button
                  className="circle-action-btn red"
                  title="O'chirish"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>

            <h3 className="profile-name mb-3">
              {student.full_name || student.name}
            </h3>

            <div>
              <span
                className={
                  student.balance < 0
                    ? "new_balance-badge bg-danger"
                    : "new_balance-badge bg-success"
                }
              >
                {Number(student.balance || 0).toLocaleString()} UZS
              </span>
              <span className="text-muted ms-2" style={{ fontSize: "13px" }}>
                balance
              </span>
            </div>

            <div className="coins-text mt-3">
              <i className="fa-solid fa-coins coin-icon text-warning"></i>{" "}
              {student.coins || 0} coins
            </div>

            <div className="info-text mt-4">Telefon:</div>
            <div className="info-value blue-link">
              {student.phone_number || student.phone || "Noma'lum"}
            </div>

            <hr style={{ borderColor: "#eaeaea", margin: "20px 0" }} />

            <div className="info-text">
              Qo'shilgan sana:{" "}
              <span className="info-value text-dark fw-medium ms-2">
                {student.date || "Noma'lum"}
              </span>
            </div>
            <div className="info-text mt-3">
              Filial:{" "}
              <span className="badge bg-light text-dark border ms-2 fw-normal">
                Yunusobod filiali
              </span>
            </div>

            <div className="profile-bottom-actions mt-4 d-flex flex-column gap-2">
              <button
                className="btn btn-light border text-start w-100"
                onClick={handleTransfer}
              >
                <i className="fa-solid fa-user-plus me-2"></i> Guruhga qo'shish
              </button>
              <button
                className="btn btn-success text-start w-100"
                onClick={() => setIsPaymentOpen(true)}
              >
                <i className="fa-solid fa-money-bill-1-wave me-2"></i> To'lov
                qilish
              </button>
            </div>
          </div>

          {/* Eslatma kartasi */}
          <div className="note-card mt-4 p-3 bg-white border rounded">
            {isAddingNote ? (
              <div className="w-100">
                <textarea 
                  className="form-control mb-2" 
                  rows="3" 
                  placeholder="Eslatma yozing..." 
                  value={newNoteValue}
                  onChange={(e) => setNewNoteValue(e.target.value)}
                  autoFocus
                />
                <div className="d-flex justify-content-end gap-2">
                   <button className="btn btn-sm btn-light border" onClick={() => setIsAddingNote(false)}>Bekor</button>
                   <button className="btn btn-sm btn-success" onClick={handleSaveNote}>Saqlash</button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-muted small d-block mb-2" style={{ whiteSpace: "pre-line" }}>
                  {student.comment || "Eslatma mavjud emas"}
                </span>
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-sm btn-outline-warning" onClick={() => setIsAddingNote(true)} title="Eslatma qo'shish">
                    <i className="fa-regular fa-flag"></i>
                  </button>
                  {student.comment && (
                     <button
                       className="btn btn-sm btn-outline-danger"
                       title="Eslatmani o'chirish"
                       onClick={async () => {
                         if(window.confirm("Barcha eslatmalarni o'chirasizmi?")){
                           try {
                             const res = await studentsApi.updateStudent(student.id, { comment: "" });
                             setStudent((prev) => ({ ...prev, comment: "" }));
                             showToast("Eslatma o'chirildi");
                           } catch (error) {
                             alert("Xatolik yuz berdi!");
                           }
                         }
                       }}
                     >
                       <i className="fa-regular fa-circle-xmark"></i>
                     </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

        {/* O'NG USTUN - Tablar */}
        <div className="col-lg-8">
          <div
            className="custom-card"
            style={{ border: "none", background: "transparent", padding: "0" }}
          >
            <div className="custom-tabs d-flex gap-2 overflow-auto pb-2 border-bottom mb-4">
              {[
                "Guruhlar",
                "Izohlar",
                "Qo'ng'iroq tarixi",
                "SMS",
                "Tarix",
                "Lid tarixi",
                "Coin Tarix",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm ${
                    activeTab === tab.toLowerCase().replace(/\s+/g, "")
                      ? "btn-primary"
                      : "btn-light border"
                  }`}
                  onClick={() =>
                    setActiveTab(tab.toLowerCase().replace(/\s+/g, ""))
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Guruhlar bo'limi */}
            {activeTab === "guruhlar" && (
              <>
                <div className="bg-white p-4 rounded border mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="badge bg-secondary mb-2">
                        {student.groups || "Biriktirilmagan"}
                      </span>
                      <h5 className="m-0 fw-bold">
                        {student.groups || "Biriktirilmagan"}
                      </h5>
                      <div className="text-muted small mt-1">
                        {student.teacher || "O'qituvchi biriktirilmagan"}
                      </div>
                    </div>
                    <div className="text-end small text-muted">
                      01.05.2025 — 31.05.2025
                      <br />
                      Juft kunlar • 07:00
                    </div>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-end mt-3">
                    <ul className="list-unstyled small text-muted m-0">
                      <li className="mb-1">
                        Holat:{" "}
                        <span className="text-success fw-medium">
                          {student.status || "Faol"}
                        </span>
                      </li>
                      <li className="mb-1">
                        Qo'shilgan sana:{" "}
                        <span className="text-dark">
                          {student.date || "Noma'lum"}
                        </span>
                      </li>
                      <li>
                        Narx:{" "}
                        <span className="text-dark fw-medium">300 000 UZS</span>
                      </li>
                    </ul>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={handleFreeze}
                      >
                        <i className="fa-solid fa-pause"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleDebtor}
                      >
                        <i className="fa-solid fa-ghost"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">To'lovlar tarixi</h5>
                <div className="table-responsive bg-white rounded border">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Sana</th>
                        <th>Turi</th>
                        <th>Miqdor</th>
                        <th>Izoh</th>
                        <th>Xodim</th>
                        <th>Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments && payments.length > 0 ? (
                        payments.map((payment, index) => (
                          <tr key={payment.id}>
                            <td>
                              {payment.created_at ? (
                                <>
                                  <div>
                                    {new Date(
                                      payment.created_at,
                                    ).toLocaleDateString("uz-UZ")}
                                  </div>
                                  <small style={{ color: "gray" }}>
                                    {new Date(
                                      payment.created_at,
                                    ).toLocaleTimeString("uz-UZ", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </small>
                                </>
                              ) : (
                                "--"
                              )}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {payment.type || payment.payment_type || "---"}
                              </span>
                            </td>
                            <td className="text-success fw-medium">
                              +{payment.amount} UZS
                            </td>
                            <td>{payment.comment || "---"}</td>
                            <td>{payment.employee || "---"}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setReceiptPayment(payment)}
                              >
                                Chek
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted py-4"
                          >
                            To'lovlar tarixi yo'q
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* SMS bo'limi */}
            {activeTab === "sms" && (
              <div className="bg-white p-4 rounded border">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="m-0 fw-bold">SMS Tarixi</h5>
                  <button
                    className="btn btn-sm btn-warning text-white"
                    onClick={handleSendSMS}
                  >
                    <i className="fa-regular fa-paper-plane me-2"></i> SMS
                    Yuborish
                  </button>
                </div>

                <div className="table-responsive">
                  {smsList && smsList.length > 0 ? (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Sana</th>
                          <th>Xabar matni</th>
                          <th>Holat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smsList.map((sms) => (
                          <tr key={sms.id}>
                            <td>
                              <div className="fw-medium small">{sms.date}</div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "11px" }}
                              >
                                {sms.time}
                              </div>
                            </td>
                            <td className="small">{sms.message}</td>
                            <td className="text-center">
                              <span className="badge bg-success bg-opacity-10 text-success rounded-pill">
                                <i className="fa-solid fa-check me-1"></i>{" "}
                                {sms.status || "Yuborildi"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-regular fa-comment-dots fs-1 mb-3 text-light"></i>
                      <p>Hozircha xabarlar yo'q</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🌟 YANGI TAB: TARIX */}
            {activeTab === "tarix" && (
               <div className="bg-white p-4 rounded border">
                 <h5 className="fw-bold mb-4">Tarix</h5>
                 <div className="table-responsive">
                  {historyList && historyList.length > 0 ? (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Sana</th>
                          <th>Harakat</th>
                          <th>Xodim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyList.map((item, i) => (
                          <tr key={i}>
                            <td>
                               {item.created_at ? new Date(item.created_at).toLocaleString("uz-UZ") : "---"}
                            </td>
                            <td>{item.action || item.description || "Tafsilot yo'q"}</td>
                            <td>{item.user || item.employee || "Tizim"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-solid fa-clock-rotate-left fs-1 mb-3 text-light"></i>
                      <p>Tarixiy ma'lumotlar topilmadi</p>
                    </div>
                  )}
                 </div>
               </div>
            )}

            {/* 🌟 YANGI TAB: LID TARIXI */}
            {activeTab === "lidtarixi" && (
               <div className="bg-white p-4 rounded border">
                 <h5 className="fw-bold mb-4">Lid Tarixi</h5>
                 <div className="table-responsive">
                  {leadHistoryList && leadHistoryList.length > 0 ? (
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Sana</th>
                          <th>Holat</th>
                          <th>Izoh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadHistoryList.map((item, i) => (
                          <tr key={i}>
                            <td>
                               {item.created_at ? new Date(item.created_at).toLocaleString("uz-UZ") : "---"}
                            </td>
                            <td>
                               <span className="badge bg-info">{item.status || "---"}</span>
                            </td>
                            <td>{item.comment || item.note || "---"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                     <div className="text-center py-5 text-muted">
                      <i className="fa-solid fa-list fs-1 mb-3 text-light"></i>
                      <p>Lid tarixi ma'lumotlari topilmadi</p>
                    </div>
                  )}
                 </div>
               </div>
            )}

            {/* Boshqa tablar (hozircha bo'sh) */}
            {[
              "izohlar",
              "qongiroqtarixi",
              "cointarix",
            ].includes(activeTab) && (
              <div className="bg-white p-5 rounded border text-center text-muted">
                Bu bo'lim yaqin orada qo'shiladi...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALLAR */}
      <EditStudentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSave}
        student={student}
      />

      {isDeleteOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="bg-white p-4 rounded text-center"
            style={{ width: "350px" }}
          >
            <h4 className="mb-3 text-dark">Haqiqatan ham o'chirasizmi?</h4>
            <p className="text-muted mb-4 small">
              Siz <b>{student.full_name || student.name}</b> profilini butunlay
              o'chirmoqchisiz.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-light border px-4"
                onClick={() => setIsDeleteOpen(false)}
              >
                Bekor
              </button>
              <button className="btn btn-danger px-4" onClick={confirmDelete}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={async (studentId, amount, formData) => {
          try {
            // ✅ STUDENT ID NI TEKSHIR
            console.log(
              `To'lov qo'shilmoqda: StudentID=${studentId}, Amount=${amount}`,
            );

            const paymentPayload = {
              amount: amount,
              payment_type: formData.paymentType || "naqd",
              comment: formData.comment,
              date: formData.date,
              student: studentId,
            };

            const res = await studentsApi.addPayment(studentId, paymentPayload);

            // ✅ BALANS YANGILANADI
            const balanceData = await studentsApi.balanceStatus(studentId, {});

            setStudent((prev) => ({
              ...prev,
              balance: balanceData.balance || balanceData?.data?.balance || 0,
            }));

            // 🌟 YECHIM: Jadval (table) tushunishi uchun created_at ga birlashtirdik
            const newPayment = {
              id: res.transaction_id || res.id || Date.now(),
              student: studentId,
              type: formData.paymentType || "naqd",
              amount: amount,
              comment: formData.comment || "",
              employee: "Joriy Foydalanuvchi",
              // Jadval aynan created_at ni qidiradi:
              created_at: new Date().toISOString() 
            };

            setPayments((prev) => [newPayment, ...prev]);
            setIsPaymentOpen(false);
            showToast(`To'lov muvaffaqiyatli saqlandi!`);
            setReceiptPayment(newPayment);
          } catch (error) {
            console.error("To'lovda xato:", error);
            alert("To'lovni saqlashda xatolik yuz berdi!");
          }
        }}
        student={student}
      />

      <ReceiptModal
        payment={receiptPayment}
        student={student}
        onClose={() => setReceiptPayment(null)}
      />
      <AddGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={confirmAddToGroup}
        selectedCount={1}

        studentIds={[student.id]}
      />
      <SmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        onSuccess={confirmSendSms}
        selectedCount={1}
      />
    </div>
  );
};

export default Profile;
