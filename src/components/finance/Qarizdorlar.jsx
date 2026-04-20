import React, { useState, useEffect, useMemo } from "react";
import { Card, Container, Table, Button, Badge } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import { financeApi } from "../../api/financeApi"; 
import axiosInstance from "../../api/axiosInstance";
import './Qarzdorlar.css';
 
function Qarizdorlar() {
  const [allStudents, setAllStudents] = useState([]);
  const [qarzidolar, setQarzidolar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Filtr statelari 
  const [search, setSearch] = useState("");
  const [amountFrom, setAmountFrom] = useState(""); 
  const [amountTo, setAmountTo] = useState("");     
  const [dateFrom, setDateFrom] = useState("");     
  const [dateTo, setDateTo] = useState("");         

  // ================= 1. BAZADAN YUKLASH (IKKITA API NI BIRLASHTIRISH) =================
  // ================= 1. BAZADAN YUKLASH (IKKITA API NI BIRLASHTIRISH) =================
  const fetchDebtors = async () => {
    setLoading(true);
    try {
      // 1. Barcha talabalarni olib kelamiz (Ism va raqamlar uchun)
      const studentRes = await axiosInstance.get("/api/v1/academics/students/"); 
      const students = studentRes.data?.results ? studentRes.data.results : (Array.isArray(studentRes.data) ? studentRes.data : []);

      // 2. Rasmda ko'rsatilgan TO'G'RI manzil: student-balances/
      const balanceRes = await axiosInstance.get("/api/v1/academics/student-balances/");
      const balances = balanceRes.data?.results ? balanceRes.data.results : (Array.isArray(balanceRes.data) ? balanceRes.data : []);

      console.log("👤 Talabalar:", students);
      console.log("💰 Balanslar:", balances);

      // 3. Ikkalasini birlashtiramiz (Join)
      let debtorsOnly = [];

      balances.forEach(bal => {
        // Balansni aniqlaymiz va u manfiy (-) bo'lsa qarz hisoblaymiz
        const qarzSummasi = Number(bal.balance || bal.amount || bal.balans || bal.debt_amount || 0);
        
        if (qarzSummasi < 0) {
           // Shu qarz qaysi talabaga tegishli ekanligini topamiz
           // Eslatma: Odatda balans jadvalida talaba ID si 'student', 'student_id' deb yoki ob'ekt ichida keladi.
           let stId = bal.student?.id || bal.student || bal.student_id;
           
           const egasi = students.find(s => s.id === stId);
           
           if (egasi) {
              debtorsOnly.push({
                 ...egasi,                  // Talabaning ismi, telefoni, rasmi
                 balans: qarzSummasi,       // Uning hozirgi jami qarzi
                 davr_boyicha_jami: qarzSummasi,
                 // Agar guruh nomi API da boshqacha kelsa, shunga qarab yozamiz
                 guruh: egasi.groups?.length > 0 ? egasi.groups[0].name : "Guruhsiz", 
              });
           }
        }
      });

      console.log("🛑 Yakuniy Qarzdorlar Ro'yxati:", debtorsOnly);

      setAllStudents(debtorsOnly);
      setQarzidolar(debtorsOnly);
    } catch (err) {
      console.error("Yuklashda xato:", err);
      alert("Ma'lumotlarni yuklashda xatolik yuz berdi. Konsolni tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  // ================= 2. QAYTA HISOBLASH (Sinxronizatsiya) =================
  const handleRecalculate = async () => {
    // Ekranga oyna chiqarib so'zni so'raymiz
    const togriSoz = window.prompt(
      "Backend qaysi so'zni kutyapti? \n(Maslahat: Swagger /api/docs/ ga qarab ko'ring yoki bularni sinang: total, current, all_time, auto)", 
      "total"
    );
    
    if (!togriSoz) return; 
    
    setIsRecalculating(true);
    let xatoSoni = 0;

    try {
      for (let q of qarzidolar) {
        const stId = q.id || q.student_id; 
        
        if (stId) {
          try {
            const formData = new FormData();
            formData.append("student_id", stId);
            formData.append("recalc_type", togriSoz); // Oynadan kiritilgan so'z

            await axiosInstance.post("/api/v1/academics/students/balance/recalculate/", formData);
            
          } catch (innerErr) {
            console.error(`Talaba ${q.full_name || 'Noma\'lum'} da xato:`, innerErr.response?.data);
            xatoSoni++;
          }
        }
      }
      
      if (xatoSoni === 0) {
        alert(`🥳 ZO'R! "${togriSoz}" so'zi to'g'ri ekan! Balanslar hisoblandi. Endi kodga shu so'zni qotirib qo'ying.`);
      } else {
        alert(`❌ Xato: Backend "${togriSoz}" ni ham qabul qilmadi. \nIltimos, /api/docs/ dan aniq so'zni qarab oling.`);
      }
      
      fetchDebtors(); 
    } catch (err) {
      console.error("Umumiy xato:", err);
    } finally {
      setIsRecalculating(false);
    }
  };
  
  // ================= 3. FILTR MANTIG'I =================
  const handleFilter = (e) => {
    if (e) e.preventDefault();
    let filtered = allStudents;

    if (search) {
      const qidiruv = search.toLowerCase();
      filtered = filtered.filter((q) => {
        const ism = q.ism || q.name || q.full_name || q.student_name || "";
        const tel = q.telefon || q.phone || "";
        return ism.toLowerCase().includes(qidiruv) || tel.includes(qidiruv);
      });
    }
    if (amountFrom) {
      filtered = filtered.filter((q) => Math.abs(Number(q.balans || q.balance || q.debt_amount || 0)) >= Number(amountFrom));
    }
    if (amountTo) {
      filtered = filtered.filter((q) => Math.abs(Number(q.balans || q.balance || q.debt_amount || 0)) <= Number(amountTo));
    }
    if (dateFrom) {
      filtered = filtered.filter((q) => (q.created_at || q.date || "").split('T')[0] >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((q) => (q.created_at || q.date || "").split('T')[0] <= dateTo);
    }

    setQarzidolar(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [search, amountFrom, amountTo, dateFrom, dateTo]);

  const onClear = () => {
    setSearch(""); setAmountFrom(""); setAmountTo(""); setDateFrom(""); setDateTo("");
    setQarzidolar(allStudents);
  };

  // ================= FORMATLASH =================
  const formatBalance = (amount) => {
    if (!amount && amount !== 0) return "0";
    const num = Number(amount);
    const sign = num < 0 ? "-" : "";
    return sign + Math.abs(num).toLocaleString("en-US").replace(/,/g, " ");
  };

  const getBalanceColor = (balance) => {
    const num = Number(balance || 0);
    return num < 0 ? "#dc2626" : (num > 0 ? "#16a34a" : "#6b7280");
  };

  const { jamiBalans, jamiDavr } = useMemo(() => {
    let b = 0; let d = 0;
    qarzidolar.forEach(curr => {
      b += Number(curr.balans || curr.balance || curr.debt_amount || curr.amount || 0);
      d += Number(curr.davr_boyicha_jami || curr.balans || curr.balance || curr.debt_amount || curr.amount || 0);
    });
    return { jamiBalans: b, jamiDavr: d };
  }, [qarzidolar]);

  return (
    <Container fluid className="qarzdorlar-page" style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4 ps-3">
        <div className="d-flex align-items-center">
          <h3 className="fw-bold m-0 text-dark">Qarzdorlar</h3>
          <Badge bg="light" text="secondary" className="ms-3 fs-6 border px-3 py-2">
            Miqdor — {loading ? "..." : qarzidolar.length}
          </Badge>
        </div>
        
        <Button 
          variant="outline-primary" 
          className="fw-medium px-4 d-flex align-items-center gap-2 shadow-sm bg-white"
          onClick={handleRecalculate}
          disabled={isRecalculating}
        >
          {isRecalculating ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Hisoblanmoqda...</>
          ) : (
            <><i className="fa-solid fa-arrows-rotate"></i> Balanslarni yangilash</>
          )}
        </Button>
      </div>

      <Card className="mb-3 border-0 shadow-sm" style={{ borderLeft: '4px solid #0ea5e9' }}>
        <Card.Body className="py-3 px-4">
          <h5 className="m-0 fw-bold text-dark d-flex justify-content-between align-items-center">
            <span>Jami: <span className="text-danger ms-2">{formatBalance(jamiBalans)} UZS</span></span>
            <i className="fa-solid fa-coins text-info opacity-50 fs-4"></i>
          </h5>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm" style={{ borderLeft: '4px solid #0ea5e9' }}>
        <Card.Body className="py-3 px-4">
          <h5 className="m-0 fw-bold text-dark d-flex justify-content-between align-items-center">
            <span>Davr bo'yicha jami: <span className="text-danger ms-2">{formatBalance(jamiDavr)} UZS</span></span>
            <i className="fa-solid fa-calendar-check text-info opacity-50 fs-4"></i>
          </h5>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="filter-grid-custom">
            <div className="f-item">
              <label>Qidiruv (Ism/Tel)</label>
              <input type="text" placeholder="Kiriting..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="f-item">
              <label>Qarz miqdori (dan)</label>
              <input type="number" placeholder="Summa..." value={amountFrom} onChange={(e) => setAmountFrom(e.target.value)} />
            </div>
            <div className="f-item">
              <label>Qarz miqdori (gacha)</label>
              <input type="number" placeholder="Summa..." value={amountTo} onChange={(e) => setAmountTo(e.target.value)} />
            </div>
            <div className="f-item">
              <label>Sanadan boshlab</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="f-item">
              <label>Sana bo'yicha</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className="filter-actions py-5">
        <button className="btn text-white px-3 fw-medium" style={{ backgroundColor: '#F27A21', border: 'none' }}  onClick={handleFilter}   >
          Filtrlash
        </button>
        <button className="btn btn-light border px-3 fw-medium text-muted" onClick={onClear}  >
          Tozalash
        </button>
      </div>
         
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table hover responsive className="mb-0 align-middle" style={{ fontSize: '14.5px' }}>
          <thead className="bg-light text-secondary">
            <tr>
              <th className="py-3 px-4 border-0 fw-semibold">Ism</th>
              <th className="py-3 border-0 fw-semibold">Telefon</th>
              <th className="py-3 border-0 fw-semibold">Balans</th>
              <th className="py-3 border-0 fw-semibold">Davr bo'yicha jami</th>
              <th className="py-3 border-0 fw-semibold">Guruh</th>
              <th className="py-3 border-0 fw-semibold">Izoh</th>
              <th className="py-3 border-0 text-center fw-semibold">Holati</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-5 text-muted">Talabalar tekshirilmoqda...</td></tr>
            ) : qarzidolar.length > 0 ? (
              qarzidolar.map((q, idx) => {
                // 👇 MANA SHU YERDA API DAN KELAYOTGAN TO'G'RI NOMLARNI QO'SHDIK 👇
                const qName = q.full_name || q.ism || q.name || q.student_name || "Noma'lum";
                const qPhone = q.phone_number || q.telefon || q.phone || "-";
                
                const qBal = q.balans || q.balance || q.debt_amount || q.amount || 0;
                const qDavrBal = q.davr_boyicha_jami || q.balans || q.balance || q.debt_amount || q.amount || 0;
                const qGroup = q.guruh || q.group?.name || q.group || "-";
                const qDate = q.created_at?.split('T')[0] || q.date || "-";
                const qNote = q.izoh || q.note || "-";

                return (
                  <tr key={q.id || idx}>
                    <td className="px-4 fw-medium text-dark">{qName}</td>
                    <td className="text-muted">{qPhone}</td>
                    <td className="fw-bold" style={{ color: getBalanceColor(qBal) }}>
                      {formatBalance(qBal)} UZS
                    </td>
                    <td className="fw-bold" style={{ color: getBalanceColor(qDavrBal) }}>
                      {formatBalance(qDavrBal)} UZS
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border py-2 px-3 fw-normal text-start">
                        {qGroup} <br/>
                        <span className="text-muted small">{qDate}</span>
                      </Badge>
                    </td>
                    <td className="text-muted small" style={{ maxWidth: '150px' }}>{qNote}</td>
                    <td className="text-center">
                      <FaCircle style={{ color: getBalanceColor(qBal) }} size={14} />
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-5 text-muted">
                  <i className="fa-solid fa-folder-open fs-1 mb-3 opacity-25"></i>
                  <br />
                  Qarzdorlar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

    </Container>
  );
}

export default Qarizdorlar;