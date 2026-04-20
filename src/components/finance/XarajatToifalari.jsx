import { useState, useEffect } from "react";
import "./XarajatToifalari.css";
import { Link, Outlet } from "react-router-dom";
import { financeApi } from "../../api/financeApi";

export default function XarajatToifalari() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const result = await financeApi.expenseCategories.getAll();
      setData(result);
    } catch (err) {
      console.error("Xato:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPanel = () => {
    setForm({ name: "" });
    setEditId(null);
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Kategoriya nomi to'ldirilsin!");
    setLoading(true);

    try {
      if (editId) {
        await financeApi.expenseCategories.update(editId, form);
      } else {
        await financeApi.expenseCategories.create(form);
      }
      setOpen(false);
      loadData();
    } catch (err) {
      console.error("Saqlashda xato:", err);
      alert("Saqlashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  const edit = (item) => {
    setForm({ name: item.name });
    setEditId(item.id);
    setOpen(true);
  };

  const remove = async (id) => {
    if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    try {
      await financeApi.expenseCategories.delete(id);
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error("O'chirishda xato:", err);
      alert("Kategoriyani o'chirib bo'lmaydi.");
    }
  };

  return (
    <div className="xarajat-container">
      <div className="xarajat-header">
        <h1>
          <i className="fa-solid fa-list"></i>
          Xarajat toifalari
        </h1>
        <button className="btn-add-modern" onClick={openPanel}>
          <i className="fa-solid fa-plus"></i>
          Yangisini qo'shish
        </button>
      </div>

      <div className="content-wrapper">
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th width="15%">ID</th>
                <th>Kategoriya nomi</th>
                <th width="25%" className="text-center">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id}>
                    <td className="id-cell">{item.id}</td>
                    <td className="name-cell">{item.name}</td>
                    <td className="text-center">
                      <div className="actions-cell">
                        <div
                          className="action-icon edit"
                          onClick={() => edit(item)}
                          title="Tahrirlash"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        <div
                          className="action-icon delete"
                          onClick={() => remove(item.id)}
                          title="O'chirish"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <i className="fa-solid fa-inbox"></i>
                      </div>
                      <p className="empty-state-text">Toifalar mavjud emas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Link
            to="/Tolovlar"
            style={{ textDecoration: "none", display: "block" }}
          >
            <button className="btn-next">
              <i className="fa-solid fa-arrow-right me-2"></i>
              Tolovlar qismiga o'tish
            </button>
          </Link>
        </div>

        {open && (
          <div className="panel-card">
            <div className="panel-header">
              <h2>
                <i className="fa-solid fa-edit"></i>
                {editId ? "Tahrirlash" : "Yangi kategoriya"}
              </h2>
              <button
                className="btn-close-panel"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Kategoriya nomi *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Kategoriya nomini kiriting"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && save()}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-save"
                onClick={save}
                disabled={loading || !form.name.trim()}
              >
                {loading ? (
                  <>
                    <span className="loading-text">Saqlanmoqda</span>
                    <span className="loading-spinner"></span>
                  </>
                ) : (
                  <div >
                    <i className="fa-solid fa-check me-2"></i>
                    Saqlash
                  </div>
                )}
              </button>
              <button className="btn-cancel" onClick={() => setOpen(false)}>
                <i className="fa-solid fa-times me-2"></i>
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
}
