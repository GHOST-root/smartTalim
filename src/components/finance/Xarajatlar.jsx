import React, { useState, useEffect, useMemo } from "react";
import "./Xarajatlar.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend } from "chart.js";
import { financeApi } from "../../api/financeApi"; 

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend);
 
export default function Xarajatlar() {
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState([]);
  
  const [showAddPaymentInput, setShowAddPaymentInput] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState('');

  // 1. O'ZGARISH: Form statelariga 'izoh' qo'shildi
  const [form, setForm] = useState({ nomi: "", sana: "", turkum: "", oluvchi: "", sum: "", tolovTuri: "", izoh: "" });
  const [filterInputs, setFilterInputs] = useState({ start_date: "", end_date: "", search: "", category: "", payment_type: "" });

  const fetchPaymentTypes = async () => {
    try {
      const res = await financeApi.paymentTypes.getAll();
      const typesArray = res.results ? res.results : (Array.isArray(res) ? res : []);
      setPaymentTypes(typesArray);
    } catch (error) {
      console.error("To'lov turlarini yuklashda xato:", error);
    }
  };

  const fetchExpenses = async (filters = {}) => {
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.search) params.search = filters.search; 
      if (filters.category) params.expense_category = filters.category;
      if (filters.payment_type) params.payment_type = filters.payment_type;

      const res = await financeApi.expenses.getAll(params);
      const expensesArray = res.results ? res.results : (Array.isArray(res) ? res : []);
      setAllData(expensesArray);
    } catch (err) {
      console.error("Xarajatlarni yuklashda xato:", err);
      setAllData([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await financeApi.expenseCategories.getAll();
      const catsArray = res.results ? res.results : (Array.isArray(res) ? res : []);
      setCategories(catsArray);
    } catch (error) {
      console.error("Kategoriyalarni yuklashda xato:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPaymentTypes(); 
    fetchExpenses(); 
  }, []);

  const applyFilter = () => {
    fetchExpenses(filterInputs); 
  };

  const clearFilter = () => {
    const emptyFilters = { start_date: "", end_date: "", search: "", category: "", payment_type: "" };
    setFilterInputs(emptyFilters);
    fetchExpenses(emptyFilters); 
  };

  const getBarChartData = () => {
    const monthlyData = {};
    allData.forEach((item) => {
      const dateVal = item.sana || item.expense_date || item.created_at;
      if (dateVal) {
        const monthYear = new Date(dateVal).toLocaleString("uz-UZ", { year: "numeric", month: "short" });
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(item.sum || item.amount || 0);
      }
    });
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    return {
      labels: sortedMonths.length > 0 ? sortedMonths : ["Hozircha bo'sh"],
      datasets: [{ label: "Xarajatlar", data: sortedMonths.length > 0 ? sortedMonths.map(m => monthlyData[m]) : [0], backgroundColor: "#ff8383", borderRadius: 4 }],
    };
  };

  const getPieChartData = () => {
    const categoryData = {};
    allData.forEach((item) => {
      let catName = "Boshqa";
      if (item.turkum) catName = item.turkum;
      else if (item.expense_category?.name) catName = item.expense_category.name;
      else if (item.expense_category) {
        const found = categories.find(c => String(c.id) === String(item.expense_category));
        if (found) catName = found.name;
      }
      
      categoryData[catName] = (categoryData[catName] || 0) + Number(item.sum || item.amount || 0);
    });
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = ["#5ce1c5", "#4a5759", "#ff8383", "#ffd166", "#8b5cf6", "#0ea5e9", "#f59e0b"];

    return {
      labels: labels.length > 0 ? labels : ["Ma'lumot yo'q"],
      datasets: [{ data: data.length > 0 ? data : [1], backgroundColor: data.length > 0 ? colors.slice(0, labels.length) : ["#e0e0e0"], borderWidth: 0 }],
    };
  };

  // ================= 2. O'ZGARISH: XARAJAT SAQLASH (BACKEND TALABLARI) =================
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!form.nomi || !form.sana || !form.sum || !form.tolovTuri || !form.turkum || !form.izoh) {
      alert("Iltimos, barcha majburiy maydonlarni (jumladan Izohni) to'ldiring!"); return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.nomi,
        name: form.nomi,
        expense_date: form.sana, // date o'rniga expense_date
        amount: Number(form.sum),
        expense_type: form.turkum, 
        payment_type: form.tolovTuri, 
        recipient: form.oluvchi,
        comment: form.izoh,      // Majburiy izoh (comment) qo'shildi
        branch_id: 1 
      };

      await financeApi.expenses.create(payload);
      setForm({ nomi: "", sana: "", turkum: "", oluvchi: "", sum: "", tolovTuri: "", izoh: "" });
      setIsAddDrawerOpen(false); 
      fetchExpenses(filterInputs); 
      alert("Xarajat muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error("Xarajat saqlashda xato:", err);
      alert("Xatolik yuz berdi. Backend loglarini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Haqiqatan o'chirmoqchimisiz?")) return;
    try {
      await financeApi.expenses.delete(id);
      fetchExpenses(filterInputs);
    } catch (err) {
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await financeApi.expenseCategories.create({ 
        name: newCategoryName,
        branch_id: 1 
      });
      setNewCategoryName('');
      setShowAddCategoryInput(false);
      fetchCategories(); 
    } catch (err) {
      console.error("Kategoriya saqlashda xato", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bu toifani o'chirishni xohlaysizmi?")) {
      try {
        await financeApi.expenseCategories.delete(id);
        fetchCategories();
      } catch (err) {
        alert("O'chirishda xatolik. Unga xarajatlar ulangan bo'lishi mumkin.");
      }
    }
  };

  // ================= 3. O'ZGARISH: TO'LOV TURINI YARATISH (DROPDOWN) =================
  const handleAddPaymentType = async () => {
    if (!newPaymentName.trim()) return alert("Iltimos, ro'yxatdan to'lov turini tanlang!");
    
    try {
      const payload = {
        name: newPaymentName, // Backend qabul qiladigan aniq so'zlar
        branch_id: 1
      };
      
      const res = await financeApi.payments.create(payload);
      setPaymentTypes([...paymentTypes, res]);
      setForm({ ...form, tolovTuri: res.id });
      setNewPaymentName("");
      setShowAddPaymentInput(false);
    } catch (err) {
      console.error("To'lov turi saqlashda xato", err);
      alert("Ushbu to'lov turi oldin qo'shilgan yoki backend ruxsat bermayapti.");
    }
  };

  const totalSum = allData.reduce((t, i) => t + Number(i.sum || i.amount || 0), 0);

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      
      <div className="d-flex flex-column  mb-4">
        <h3 className="fw-bold text-dark m-2">Xarajatlar</h3>
        <div className="card border-0 shadow-sm px-4 py-2 d-flex flex-row align-items-center gap-4">
          <div>
            <div className="text-muted small fw-medium mb-1">Jami xarajatlar miqdori:</div>
            <h4 className="fw-bold text-danger m-0">{totalSum.toLocaleString()} UZS</h4>
          </div>
          <div className="fs-2">💰</div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-3 h-100">
            <div className="mb-3 d-flex align-items-center gap-2">
              <div style={{ width: '4px', height: '20px', backgroundColor: '#007bff', borderRadius: '2px' }}></div>
              <strong className="text-dark">Xarajatlar dinamikasi</strong>
            </div>
            <div style={{ height: '250px', position: 'relative' }}>
              <Bar data={getBarChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
 
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100">
            <div className="mb-3 d-flex align-items-center gap-2">
              <div style={{ width: '4px', height: '20px', backgroundColor: '#5ce1c5', borderRadius: '2px' }}></div>
              <strong className="text-dark">Turkumlar bo'yicha</strong>
            </div>
            <div style={{ height: '250px', position: 'relative' }}>
              <Pie data={getPieChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div className="filter-card mb-4">
        <div className="filter-grid">
          <div className="f-item">
            <label>Dan</label>
            <input type="date" value={filterInputs.start_date} onChange={(e) => setFilterInputs({ ...filterInputs, start_date: e.target.value })} />
          </div>
          <div className="f-item">
            <label>Gacha</label>
            <input type="date" value={filterInputs.end_date} onChange={(e) => setFilterInputs({ ...filterInputs, end_date: e.target.value })} />
          </div>
          <div className="f-item">
            <label>Qidiruv (Ism/Oluvchi)</label>
            <input type="text" placeholder="Qidirish..." value={filterInputs.search} onChange={(e) => setFilterInputs({ ...filterInputs, search: e.target.value })} />
          </div>
          <div className="f-item">
            <label>Kategoriya</label>
            <select value={filterInputs.category} onChange={(e) => setFilterInputs({ ...filterInputs, category: e.target.value })}>
              <option value="">Barchasi</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>
          <div className="f-item">
            <label>To'lov turi</label>
            <select value={filterInputs.payment_type} onChange={(e) => setFilterInputs({ ...filterInputs, payment_type: e.target.value })}>
              <option value="">Barchasi</option>
              {paymentTypes.map((pt) => (<option key={pt.id} value={pt.id}>{pt.name}</option>))}
            </select>
          </div>
        </div>
        <div className="filter-actions py-5">
        <button className="btn text-white px-3 fw-medium" style={{ backgroundColor: '#F27A21', border: 'none' }}onClick={applyFilter}   >
          Filtrlash
        </button>
        <button className="btn btn-light border px-3 fw-medium text-muted" onClick={clearFilter}   >
          Tozalash
        </button>
      </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        <div className="d-flex justify-content-end gap-3 p-3 bg-white border-bottom">
          <button className="btn btn-light border text-muted shadow-sm fw-medium px-4" onClick={() => setShowCategoryModal(true)}>
            <i className="fa-solid fa-list me-2"></i> Kategoriyalar
          </button>
          <button className="btn text-white fw-medium px-4" style={{ backgroundColor: '#ff7a00' }} onClick={() => setIsAddDrawerOpen(true)}>
            <i className="fa-solid fa-plus me-2"></i> Yangi xarajat
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
            <thead className="bg-light text-muted">
              <tr>
                <th className="py-3 px-4 border-0">Sana</th>
                <th className="py-3 border-0">Turkum</th>
                <th className="py-3 border-0">Nomi</th>
                <th className="py-3 border-0">Oluvchi</th>
                <th className="py-3 border-0">To'lov turi</th>
                <th className="py-3 border-0">Izoh</th>
                <th className="py-3 border-0">Sum</th>
                <th className="py-3 border-0 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {allData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-5 text-muted">Ma'lumot topilmadi.</td></tr>
              ) : (
                allData.map((i) => {
                  let catName = i.turkum || "Boshqa";
                  if (i.expense_category?.name) catName = i.expense_category.name;
                  else if (i.expense_category) {
                    const found = categories.find(c => String(c.id) === String(i.expense_category));
                    if (found) catName = found.name;
                  }
                  
                  let payName = i.tolovTuri || i.payment_type;
                  if(typeof payName === 'object') payName = payName.name;
                  else {
                     const foundPay = paymentTypes.find(p => String(p.id) === String(payName));
                     if(foundPay) payName = foundPay.name;
                  }

                  return (
                    <tr key={i.id}>
                      <td className="px-4 text-muted">{i.sana || i.expense_date || i.created_at}</td>
                      <td><span className="badge bg-light text-secondary border px-2 py-1">{catName}</span></td>
                      <td className="fw-medium text-dark">{i.nomi || i.title || i.name}</td>
                      <td className="text-muted">{i.oluvchi || i.recipient || "Ko'rsatilmagan"}</td>
                      <td className="text-muted">{payName}</td>
                      <td className="text-muted small" style={{maxWidth: '150px'}}>{i.izoh || i.comment || "-"}</td>
                      <td className="text-danger fw-bold">{Number(i.sum || i.amount).toLocaleString()} UZS</td>
                      <td className="text-center">
                        <i className="fa-regular fa-trash-can text-danger" style={{ cursor: 'pointer', fontSize: '16px' }} title="O'chirish" onClick={() => handleDeleteExpense(i.id)}></i>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
       
      {isAddDrawerOpen && (
        <div className="x-drawer-overlay" onClick={() => setIsAddDrawerOpen(false)}>
          <div className="x-drawer-container" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 className="m-0 fw-bold">Yangi xarajat</h5>
              <span style={{ cursor: "pointer", fontSize: '24px', color: '#888' }} onClick={() => setIsAddDrawerOpen(false)}>✕</span>
            </div>

            <form onSubmit={handleSaveExpense} className="expense-form">
              <div className="f-item tahrir">
                <label>Nomi *</label>
                <input type="text" value={form.nomi} onChange={(e) => setForm({ ...form, nomi: e.target.value })} required />
              </div>
              <div className="f-item">
                <label>Sana *</label>
                <input type="date" value={form.sana} onChange={(e) => setForm({ ...form, sana: e.target.value })} required />
              </div>
              <div className="f-item">
                <label>Turkum (Kategoriya) *</label>
                <select value={form.turkum} onChange={(e) => setForm({ ...form, turkum: e.target.value })} required>
                  <option value="">Tanlang</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <div className="f-item">
                <label>Oluvchi</label>
                <input type="text" value={form.oluvchi} onChange={(e) => setForm({ ...form, oluvchi: e.target.value })} />
              </div>
              <div className="f-item">
                <label>Summa (UZS) *</label>
                <input type="text" value={form.sum ? Number(form.sum).toLocaleString("en-US") : ""} onChange={(e) => setForm({ ...form, sum: e.target.value.replace(/[^\d]/g, "") })} placeholder="0" required />
              </div>

              {/* MAJBURUIY IZOH (COMMENT) */}
              <div className="f-item ">
                <label>Izoh *</label>
                <input type="text" placeholder="Nima maqsadda ishlatildi?" value={form.izoh} onChange={(e) => setForm({ ...form, izoh: e.target.value })} required />
              </div>

              <div className="f-item m-1">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="m-0">To'lov turi *</label>
                  
                  <button 
                    type="button"
                    className="btn btn-link p-0 text-decoration-none d-flex align-items-center" 
                    style={{ color: '#f97316', fontSize: '13px' }}
                    onClick={() => setShowAddPaymentInput(!showAddPaymentInput)}
                  >
                    <i className="fa-solid fa-circle-plus me-1"></i> Yangi
                  </button>
                </div>

                {/* YANGI TO'LOV TURINI DROPDOWN (SELECT) QILDIK */}
                {showAddPaymentInput && (
                  <div className="d-flex gap-2 mt-2 mb-2 p-2 bg-light rounded border">
                    <select 
                      className="form-select form-select-sm"
                      value={newPaymentName}
                      onChange={(e) => setNewPaymentName(e.target.value)}
                    >
                      <option value="">Tanlang...</option>
                      <option value="naqd">Naqd pul</option>
                      <option value="plastik">Plastik karta</option>
                      <option value="payme">Payme</option>
                      <option value="click">Click</option>
                      <option value="uzum">Uzum</option>
                      <option value="humo">Humo</option>
                      <option value="bank">Bank o'tkazma</option>
                    </select>
                    <button 
                      type="button" 
                      className="btn btn-sm text-white" 
                      style={{ backgroundColor: '#10B981' }} 
                      onClick={handleAddPaymentType}
                    >
                      Saqlash
                    </button>
                  </div>
                )}

                <div className="radio-grid mt-2">
                  {paymentTypes.length > 0 ? (
                    paymentTypes.map((pt) => {
                      const displayNames = {
                        "naqd": "Naqd pul", "plastik": "Plastik karta", "payme": "Payme", "click": "Click", "bank": "Bank o'tkazma", "uzum": "Uzum", "humo": "Humo"
                      };
                      const displayName = displayNames[pt.name] || pt.name;

                      return (
                        <label key={pt.id} className="radio-item m-0">
                          <input 
                            type="radio" 
                            name="tolovTuri" 
                            checked={form.tolovTuri === pt.id} 
                            onChange={() => setForm({ ...form, tolovTuri: pt.id })} 
                            required 
                          />
                          <span>{displayName}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-danger small" style={{gridColumn: 'span 2'}}>
                      To'lov turlari yo'q. Tepadagi (+) ni bosib qo'shing.
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="save-btn mt-4 w-100" style={{maxWidth: '100%'}} disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 10500 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px',width: '400px', textAlign:'center', justifyContent:'center', margin:'0 auto' }}>
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold text-dark">Xarajat toifalari </h5>
                <button className="btn text-white px-4 fw-medium" style={{ backgroundColor: '#ff7a00', borderRadius: '30px' }} onClick={() => setShowAddCategoryInput(true)}>+ Yangisini qo'shish</button>
              </div>
              <div className="modal-body p-4">
                {showAddCategoryInput && (
                  <div className="d-flex gap-2 mb-4 bg-light p-3 rounded border">
                    <input type="text" className="form-control" placeholder="Kategoriya nomi..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                    <button className="btn text-white px-4" style={{ backgroundColor: '#10B981' }} onClick={handleAddCategory}>Saqlash</button>
                    <button className="btn btn-light border" onClick={() => { setShowAddCategoryInput(false); setNewCategoryName(''); }}>Bekor qilish</button>
                  </div>
                )}
                <table className="table align-middle">
                  <thead className="text-muted"><tr style={{borderBottom: '2px solid #eaeaea'}}><th>ID</th><th>Nomi</th><th className="text-center">Amallar</th></tr></thead>
                  <tbody>
                    {categories.length > 0 ? categories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="text-muted">#{cat.id}</td><td className="fw-medium">{cat.name}</td>
                        <td className="text-center"><i className="fa-regular fa-trash-can text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteCategory(cat.id)}></i></td>
                      </tr>
                    )) : (<tr><td colSpan="3" className="text-center py-4 text-muted">Toifalar mavjud emas.</td></tr>)}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer p-3 border-top-0"><button className="btn btn-secondary px-4" onClick={() => setShowCategoryModal(false)}>Yopish</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}