import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Table, Badge } from "react-bootstrap";
import "./IshHaqi.css";
import { financeApi } from "../../api/financeApi"; 
import axiosInstance from "../../api/axiosInstance";

const IshHaqi = () => {
  const [hisobUsuli, setHisobUsuli] = useState("");
  const [xarajatQiymati, setXarajatQiymati] = useState("");
  const [xarajatQiymati2, setXarajatQiymati2] = useState("");
  const [xarajatTuri, setXarajatTuri] = useState("O'zgarmas");
  const [xarajatTuri2, setXarajatTuri2] = useState("O'zgarmas");
  
  const [selectedMonth, setSelectedMonth] = useState("2025-10");
  const [xodim, setXodim] = useState("");
  const [xodimlar, setXodimlar] = useState([]); 

  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  const [showStandartModal, setShowStandartModal] = useState(false);
  const [pendingStandart, setPendingStandart] = useState(null);
  
  const [rows, setRows] = useState([]); // Qoidalar (Rules)
  const [editingId, setEditingId] = useState(null);

  // ============= BAZADAN MA'LUMOTLARNI YUKLASH =============
  const fetchData = async () => {
    try {
      // 1. Qoidalarni olamiz
      const rulesRes = await financeApi.salaryRules.getAll();
      const rulesData = rulesRes.results ? rulesRes.results : (Array.isArray(rulesRes) ? rulesRes : []);
      setRows(rulesData);

      // 2. Xodimlarni olamiz
      const empRes = await axiosInstance.get('/api/v1/accounts/employees/'); 
      const empData = empRes.data.results ? empRes.data.results : (Array.isArray(empRes.data) ? empRes.data : []);
      setXodimlar(empData);
    } catch (error) {
      console.error("API dan yuklashda xato:", error);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  const formatNumber = (value) => {
    if (!value) return "";
    const numbers = value.toString().replace(/\D/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleXarajatChange = (e, setter) => setter(formatNumber(e.target.value));

  const createPayload = (qiymat, turi, isStandard) => {
    const tozaQiymat = Number(qiymat.replace(/\D/g, ""));
    const isFoiz = turi === "Foiz";
    const bugun = new Date().toISOString().split('T')[0];
    const kelasiYil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

    return {
      percent_per_student: isFoiz ? tozaQiymat : 0,
      fixed_bonus: !isFoiz ? tozaQiymat : 0,
      effective_from: bugun,
      effective_to: kelasiYil,
      teacher: isStandard ? null : xodim, 
      branch_id: 1
    };
  };

  // ============= TAHRIRLASH (Individual qoidani formaga tushirish) =============
  const handleEditClick = (item) => {
    setEditingId(item.id);
    const isFoiz = item.fixed_bonus === 0;
    setXarajatTuri2(isFoiz ? "Foiz" : "O'zgarmas");
    setXarajatQiymati2(isFoiz ? formatNumber(item.percent_per_student.toString()) : formatNumber(item.fixed_bonus.toString()));
    const xodimId = typeof item.teacher === 'object' && item.teacher ? item.teacher.id : item.teacher;
    setXodim(xodimId || "");
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setXarajatQiymati2("");
    setXarajatTuri2("O'zgarmas");
    setXodim("");
  };

  // ============= QO'SHISH VA YANGILASH MANTIG'I =============
  const handleAddRow = async (isStandard) => {
    const qiymat = isStandard ? xarajatQiymati : xarajatQiymati2;
    const turi = isStandard ? xarajatTuri : xarajatTuri2;
    
    if (!qiymat) return alert("Xarajat qiymatini kiriting!");
    if (!isStandard && !xodim) return alert("Iltimos, Xodimni tanlang!"); 

    if (isStandard) {
      // Standart qoida o'rnatish
      const hasIndividual = rows.some(r => r.teacher !== null);
      if (hasIndividual) {
        setPendingStandart({ qiymat, turi });
        setShowStandartModal(true);
      } else {
        await saveStandardRule(false, qiymat, turi);
      }
    } else {
      // Shaxsiy qoida o'rnatish (2-qadam)
      const payload = createPayload(qiymat, turi, false);
      try {
        if (editingId) {
          await financeApi.salaryRules.update(editingId, payload);
        } else {
          // Xodimga oldin shaxsiy qoida qo'shilgan bo'lsa, o'shani tahrirlaymiz
          const existingRule = rows.find(r => (typeof r.teacher === 'object' ? r.teacher?.id : r.teacher) === xodim);
          if(existingRule) {
            await financeApi.salaryRules.update(existingRule.id, payload);
          } else {
            await financeApi.salaryRules.create(payload);
          }
        }
        fetchData();
        cancelEdit();
      } catch (err) {
        alert("Backend Xatosi (Console'ni ko'ring)");
      }
    }
  };

  const saveStandardRule = async (overrideAll, qymt, tr) => {
    const finalQiymat = qymt || pendingStandart.qiymat;
    const finalTuri = tr || pendingStandart.turi;
    const payload = createPayload(finalQiymat, finalTuri, true);
    payload.override_all = overrideAll; 

    try {
      // Agar bazada allaqachon standart qoida bor bo'lsa, uni UPDATE qilamiz
      const stdRule = rows.find(r => r.teacher === null);
      if (stdRule) {
        await financeApi.salaryRules.update(stdRule.id, payload);
      } else {
        await financeApi.salaryRules.create(payload);
      }
      
      fetchData();
      setXarajatQiymati(""); setXarajatTuri("O'zgarmas");
      setShowStandartModal(false);
      setPendingStandart(null);
    } catch (err) {
      alert("Saqlashda xato yuz berdi");
      setShowStandartModal(false);
    }
  };

  const handleDeleteRow = (item) => {
    setSelectedIndex(item.id);
    setSelectedName("Shaxsiy qoidani");
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedIndex) await financeApi.salaryRules.delete(selectedIndex);
      fetchData();
      setShowModal(false);
      setSelectedIndex(null);
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const handleCalculate = async () => {
    try {
      await financeApi.salaryCalculations.calculate({ month: selectedMonth });
      alert(`${selectedMonth} oyi uchun hisoblash muvaffaqiyatli amalga oshirildi!`);
    } catch (err) {
      console.error(err);
      alert(`Hisoblashda xatolik yuz berdi! Backend javobini tekshiring.`);
    }
  };

  // ============= JADVAL MANTIG'I (XODIMLAR RO'YXATI BO'YICHA) =============
  // Avval bazadagi Standart qoidani topib olamiz
  const standardRule = rows.find(r => r.teacher === null);

  return (
    <Container fluid className="ish-haqi-page">
      <h4 className="mb-4 text-dark fw-bold">Ish haqi</h4>

      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4 text-primary fw-bold">
            <i className="fa-solid fa-gear me-2"></i> Ish haqi kalkulyatorini sozlash
          </div>

          <div className="step border rounded-3 p-3 mb-4 bg-light">
            <h6 className="step-text m-0 d-flex align-items-center text-secondary">
              <span className="nambevan bg-secondary text-white rounded me-3 px-3 py-2 fs-5">1</span>
              Barcha xodimlar uchun standart xarajatlarni belgilash
            </h6>
          </div>

          <div className="xarajat-row mb-5">
            <div className="f-item grow">
              <label>Xarajat qiymati</label>
              <input placeholder="0" value={xarajatQiymati} onChange={(e) => handleXarajatChange(e, setXarajatQiymati)} />
            </div>
            <div className="f-item small">
              <label>&nbsp;</label>
              <select value={xarajatTuri} onChange={(e) => setXarajatTuri(e.target.value)}>
                <option>O'zgarmas</option>
                <option>Foiz</option>
              </select>
            </div>
            <div className="f-item btn-wrap">
              <label>&nbsp;</label>
              <button className="btn-outline" onClick={() => handleAddRow(true)}>Qo'shish</button>
            </div>
          </div>

          <hr className="my-4 text-muted" />

          <div className="step border rounded-3 p-3 mb-4 bg-light">
            <h6 className="step-text m-0 d-flex align-items-center text-secondary">
              <span className="nambevan bg-secondary text-white rounded me-3 px-3 py-2 fs-5">2</span>
              Siz har qanday xodim uchun individual hisob-kitobni belgilashingiz mumkin.
            </h6>
          </div>

          <div className="hisob-row p-3 border rounded-3 mb-4" style={{ backgroundColor: editingId ? '#f0fdf4' : 'transparent', transition: '0.3s' }}>
            <div className="f-item grow">
              <label>Xodimni tanlang</label>
              <select className="form-select" style={{height: '38px', fontSize: '14px'}} value={xodim} onChange={(e) => setXodim(e.target.value)}>
                <option value="">Tanlang</option>
                {xodimlar.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || emp.first_name || emp.name || "Nomsiz xodim"}
                  </option>
                ))}
              </select>
            </div>

            <div className="f-item grow">
              <label>Xarajat qiymati</label>
              <input placeholder="0" value={xarajatQiymati2} onChange={(e) => handleXarajatChange(e, setXarajatQiymati2)} />
            </div>

            <div className="f-item xs">
              <label>&nbsp;</label>
              <select value={xarajatTuri2} onChange={(e) => setXarajatTuri2(e.target.value)}>
                <option>O'zgarmas</option>
                <option>Foiz</option>
              </select>
            </div>

            <div className="f-item btn-wrap d-flex gap-2">
              <label>&nbsp;</label>
              <button 
                className="btn-outline flex-grow-1" 
                style={{ borderColor: editingId ? '#16a34a' : '', color: editingId ? '#16a34a' : '', fontWeight: editingId ? 'bold' : 'normal' }} 
                onClick={() => handleAddRow(false)}
              >
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
              {editingId && (
                <button className="btn-outline text-secondary border-secondary" onClick={cancelEdit}>Bekor</button>
              )}
            </div>
          </div>

          {/* ================= JADVAL (FAQAT XODIMLAR CHIQADI) ================= */}
          <div className="table-wrapper mt-5 border rounded-3 overflow-hidden p-3 bg-white">
            <Table hover responsive className="mb-0 border-0">
              <thead className="bg-light text-secondary" style={{ fontSize: '14px' }}>
                <tr>
                  <th className="py-3 px-4 border-bottom-0">Xodim nomi</th>
                  <th className="py-3 border-bottom-0">Maosh turi</th>
                  <th className="py-3 border-bottom-0">Miqdori</th>
                  <th className="py-3 px-4 text-end border-bottom-0">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {xodimlar.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">Hali xodimlar qo'shilmagan</td>
                  </tr>
                ) : (
                  xodimlar.map((emp) => {
                    // Shu xodim uchun individual qoida bor-yo'qligini tekshiramiz
                    const individualRule = rows.find(r => {
                      if (!r.teacher) return false;
                      const teacherId = typeof r.teacher === 'object' ? r.teacher.id : r.teacher;
                      return teacherId === emp.id;
                    });

                    // Qaysi qoida kuchda ekanligini aniqlaymiz
                    const activeRule = individualRule || standardRule;

                    return (
                      <tr key={emp.id} className="align-middle">
                        <td className="px-4 fw-medium text-dark">
                          {emp.full_name || emp.first_name || emp.name || "Nomsiz xodim"}
                          {individualRule && <Badge bg="warning" text="dark" className="ms-2">Shaxsiy</Badge>}
                        </td>
                        
                        <td>
                          {activeRule ? (
                            activeRule.fixed_bonus > 0 ? (
                              <Badge bg="primary" pill className="px-3 py-2 fw-normal">O'zgarmas</Badge>
                            ) : (
                              <Badge bg="success" pill className="px-3 py-2 fw-normal">Foiz</Badge>
                            )
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        
                        <td className="fw-bold fs-6">
                          {activeRule ? (
                            activeRule.fixed_bonus > 0 
                              ? formatNumber(activeRule.fixed_bonus.toString()) + " UZS" 
                              : activeRule.percent_per_student + " %"
                          ) : (
                            <span className="text-muted fw-normal">Belgilanmagan</span>
                          )}
                        </td>
                        
                        <td className="px-4 text-end">
                          {individualRule ? (
                            <>
                              <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleEditClick(individualRule)}>
                                Tahrirlash
                              </Button>
                              <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteRow(individualRule)}>
                                O'chirish
                              </Button>
                            </>
                          ) : (
                            <span className="text-muted small fst-italic me-3">Standart bo'yicha</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          <div className="footer-actions d-flex gap-3 align-items-center mt-4 border-top pt-4">
            <Form.Control
              className="actions-1"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: '200px', height: '42px' }}
            />
            <Button className="button001 px-4" variant="warning" style={{ height: '42px', fontWeight: '500' }} onClick={handleCalculate}>
              Hisoblang
            </Button>
            <Button className="button001 px-4" variant="success" style={{ height: '42px', fontWeight: '500' }}>
              E'lon qilish
            </Button>
          </div>

        </Card.Body>
        <div className="dawnloade d-flex justify-content-end mb-4 me-4">
          <i className="fa-solid fa-circle-down text-success" style={{ cursor: "pointer", fontSize: "28px" }}></i>
        </div>
      </Card>

      {/* MODALLAR */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">O'chirishni tasdiqlang</h5>
              </div>
              <div className="modal-body text-secondary">
                Bu xodimning shaxsiy qoidasi o'chiriladi va u <strong>Standart</strong> tarifga o'tadi. Tasdiqlaysizmi?
              </div>
              <div className="modal-footer border-top-0">
                <Button variant="light" onClick={() => setShowModal(false)}>Bekor qilish</Button>
                <Button variant="danger" onClick={confirmDelete}>O'chirish</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStandartModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title text-danger fw-bold">Diqqat!</h5>
                <button className="btn-close" onClick={() => setShowStandartModal(false)}></button>
              </div>
              <div className="modal-body pt-2 text-secondary">
                <p>Sistemada <strong>Alohida (shaxsiy)</strong> tariflar mavjud. Yangi standart tarifni barchaga birdek qo'llaymizmi yoki shaxsiy tariflarga tegmaymizmi?</p>
              </div>
              <div className="modal-footer border-top-0 pt-0 d-flex gap-2">
                <button className="btn btn-outline-secondary w-100 mb-2" onClick={() => saveStandardRule(false, null, null)}>
                  Faqat standartlarni o'zgartirish
                </button>
                <button className="btn btn-primary w-100" onClick={() => saveStandardRule(true, null, null)}>
                  Hammasiga qo'llash (Ezish)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default IshHaqi;