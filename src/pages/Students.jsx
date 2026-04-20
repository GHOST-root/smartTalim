// ================= STUDENTS.JS =================
// Talabalar jadvali foto bilan

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import "../components/students/students.css";
import "../styles/Students.css";
import AddStudentModal from "../components/students/AddStudentModal";
import EditStudentModal from "../components/students/EditStudentModal";
import PaymentModal from "../components/students/PaymentModal";
import AddGroupModal from "../components/students/AddGroupModal";
import SmsModal from "../components/students/SmsModal";
import { useNavigate } from "react-router-dom";
import { studentsApi } from "../api/studentsApi";

const Students = () => {
  // --- Asosiy statelar ---
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- Modallar uchun statelar ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null,
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    student: null,
  });
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [noteModal, setNoteModal] = useState({
    isOpen: false,
    studentName: "",
    note: "",
  });
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  // --- Filtrlar va Saralash (Sorting) holati ---
  const formatBalance = (amount) => {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount);

    if (abs < 1000) return sign + abs;

    const rounded = Math.floor(abs / 1000) * 1000;

    return sign + rounded.toLocaleString("en-US").replace(/,/g, ".");
  };

  const formatPhoneNumber = (phone) => {
    if (!phone || phone === "---") return "+998 (--) --- -- --";
    // Faqat raqamlarni ajratib olish
    let digits = phone.replace(/\D/g, "");
    // Agar 998 dan boshlanmasa, 998 ni qo'shib qo'yamiz
    if (!digits.startsWith("998")) digits = "998" + digits;

    // 12 ta raqam bo'lsa chiroyli qilib formatlaymiz
    digits = digits.slice(0, 12);
    if (digits.length >= 12) {
      return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
    }
    return "+" + digits; // Agar raqam chala bo'lsa, borini qaytaradi
  };

  const [filters, setFilters] = useState({
    search: "",
    course: "",
    status: "",
    finance: "",
    tag: "",
    extraId: "",
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [groupsList, setGroupsList] = useState([]);
  const [isColumnsMenuOpen, setIsColumnsMenuOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState({
    search: true,
    course: false,
    status: true,
    finance: true,
    startDate: false,
  });

  const [toast, setToast] = useState({ show: false, message: "" });
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const currentStudent = studentsData.find((s) => s.id === activeDropdown);

  // ================= TALABALARNI API DAN YUKLASH =================
  const fetchStudents = async () => {
    try {
      console.log("📥 [GET] Talabalarni bazadan yuklash boshlandi...");

      const data = await studentsApi.getStudents();
      console.log("✅ [GET] Backenddan JAVOB KELDI:", data);

      const studentsArray = data.results
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      console.log("🎓 Massiv (Array) ajratib olindi:", studentsArray);

      // ✅ YANGI: Har bir talaba uchun balans yuklash
      const studentsWithBalance = await Promise.all(
        studentsArray.map(async (s) => {
          let balance = s.balance || 0;

          // Agar balance yo'q bo'lsa API dan olish
          if (balance === 0 || !balance) {
            try {
              const balanceData = await studentsApi.balanceStatus(s.id, {});
              balance = balanceData.balance || balanceData?.data?.balance || 0;
            } catch (error) {
              console.warn(`Balance yuklashda xato (ID: ${s.id}):`, error);
            }
          }

          return {
            id: s.id,
            name: s.full_name || s.name || "Ismsiz",
            phone: s.phone_number || s.phone || "---",
            groups: s.groups || "Guruhsiz",
            time: s.time || "",
            teacher: s.teacher || "O'qituvchisiz",
            date: s.created_at
              ? s.created_at.split("T")[0]
              : s.date || "Noma'lum",
            balance: balance,
            coins: s.coins || 0,
            note: s.extra_info || s.note || "",
            status: s.status || "Faol",
            // ✅ FOTO - API dan kelayotgan rasm
            photo: s.photo
              ? s.photo.startsWith("https")
                ? s.photo
                : `${process.env.REACT_APP_API_URL}${s.photo}`
              : s.profile_photo
                ? s.profile_photo.startsWith("https")
                  ? s.profile_photo
                  : `${process.env.REACT_APP_API_URL}${s.profile_photo}`
                : null,
          };
        }),
      );

      console.log(
        "✨ Jadvalga chizish uchun tayyorlangan ma'lumot:",
        studentsWithBalance,
      );
      setStudentsData(studentsWithBalance);
    } catch (error) {
      console.error("❌ Talabalarni yuklashda xato:", error);
    }
  };

  useEffect(() => {
    fetchStudents();

    // 🌟 YECHIM: Filtr uchun guruhlarni backenddan tortib kelish
    const fetchGroupsForFilter = async () => {
      try {
        const res = await studentsApi.getGroupsFromGroups();
        setGroupsList(res.results || res.data || res || []);
      } catch (error) {
        console.error("Filtr uchun guruhlarni yuklashda xato:", error);
      }
    };
    fetchGroupsForFilter();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    if (activeDropdown !== null)
      document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeDropdown]);

  // ================= FILTRLASH MANTIQI =================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.phone.includes(filters.search);
      const matchesCourse = filters.course
        ? student.groups.includes(filters.course)
        : true;
      const matchesStatus = filters.status
        ? student.status === filters.status
        : true;

      let matchesFinance = true;
      if (filters.finance === "Qarzdor") matchesFinance = student.balance < 0;
      if (filters.finance === "To'lov amalga oshirilgan")
        matchesFinance = student.balance >= 0;

      const matchesDate = filters.startDate
        ? student.date.includes(
            filters.startDate.split("-").reverse().join("."),
          )
        : true;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus &&
        matchesFinance &&
        matchesDate
      );
    });
  }, [studentsData, filters]);

  // ================= SARALASH (SORTING) MANTIQI =================
  const sortedStudents = useMemo(() => {
    let sortableItems = [...filteredStudents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key] ?? "";
        let bVal = b[sortConfig.key] ?? "";

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStudents, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return "fa-solid fa-sort ms-1 text-muted opacity-25";
    return sortConfig.direction === "asc"
      ? "fa-solid fa-sort-up ms-1 text-primary"
      : "fa-solid fa-sort-down ms-1 text-primary";
  };

  // ================= HARAKATLAR =================
  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedStudents(sortedStudents.map((s) => s.id));
    else setSelectedStudents([]);
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleActionClick = (e, id) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + 4, left: rect.left - 100 });
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  // --- Ommaviy harakatlar ---
  const confirmAddToGroup = async (groupData) => {
    try {
      await Promise.all(
        selectedStudents.map((id) =>
          studentsApi.addStudentToGroup(id, groupData),
        ),
      );

      await fetchStudents();
      setSelectedStudents([]);
      setIsGroupModalOpen(false);
      showToast(`${selectedStudents.length} ta talaba guruhga qo'shildi!`);
    } catch (error) {
      console.error("Guruhga qo'shishda xato:", error);
      alert("Guruhga qo'shishda xatolik yuz berdi!");
    }
  };

  const confirmSendSms = async (message) => {
    try {
      await Promise.all(
        selectedStudents.map((id) => studentsApi.sendSms(id, { message })),
      );

      console.log("Jo'natildi:", selectedStudents, message);
      setIsSmsModalOpen(false);
      setSelectedStudents([]);
      showToast(`${selectedStudents.length} ta talabaga SMS yuborildi!`);
    } catch (error) {
      console.error("SMS yuborishda xato:", error);
      alert("SMS yuborishda xatolik yuz berdi!");
    }
  };

  const confirmBulkDelete = async () => {
    if (window.confirm("Belgilangan talabalarni o'chirishni xohlaysizmi?")) {
      try {
        await Promise.all(
          selectedStudents.map((id) => studentsApi.deleteStudent(id)),
        );

        setSelectedStudents([]);
        fetchStudents();
        showToast("Tanlangan talabalar o'chirildi!");
      } catch (error) {
        console.error("Ommaviy o'chirishda xato:", error);
        alert("O'chirishda xatolik yuz berdi!");
      }
    }
  };

  // --- Individual harakatlar ---
  const handleEdit = (student) => {
    setActiveDropdown(null);
    setStudentToEdit(student);
    setEditModalOpen(true);
  };

  const confirmEdit = async () => {
    await fetchStudents();
    showToast("Talaba ma'lumotlari yangilandi!");
  };

  const handlePayment = (student) => {
    setActiveDropdown(null);
    setPaymentModal({ isOpen: true, student });
  };

  const confirmPayment = async (studentId, amount, paymentDetails) => {
    try {
      const res = await studentsApi.addPayment(studentId, {
        amount,
        payment_type: paymentDetails.type || "naqd",
        note: paymentDetails.note,
        date: paymentDetails.date,
      });

      // ✅ YANGI: To'lovdan keyin balans yangilash
      await fetchStudents();
      setPaymentModal({ isOpen: false, student: null });
      showToast(`To'lov saqlandi`);
    } catch (error) {
      console.error("To'lovda xato:", error);
      alert("To'lovni saqlashda xatolik yuz berdi!");
    }
  };

  const handleDelete = (student) => {
    setActiveDropdown(null);
    setDeleteModal({ isOpen: true, student });
  };

  const confirmDelete = async () => {
    if (!deleteModal.student) return;

    try {
      await studentsApi.deleteStudent(deleteModal.student.id);

      setDeleteModal({ isOpen: false, student: null });
      fetchStudents();
      showToast("Talaba o'chirildi!");
    } catch (error) {
      console.error("O'chirishda xato:", error);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  // --- EXCEL (.xlsx) YUKLAB OLISH ---
  const exportToExcel = () => {
    if (sortedStudents.length === 0) {
      alert("Yuklab olish uchun talabalar yo'q!");
      return;
    }

    const excelData = sortedStudents.map((student, index) => ({
      "№": index + 1,
      "Ism va Familiya": student.name,
      "Telefon raqami": student.phone,
      Holati: student.status,
      "Guruh nomi": student.groups,
      "Moliyaviy holati (New_balance)": student.balance + " UZS",
      Teglar: student.note || "Yo'q",
      "Yaratilgan sana": student.date.split("—")[0].trim(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talabalar ro'yxati");
    XLSX.writeFile(workbook, "Talabalar_Royxati.xlsx");

    showToast("Excel fayli muvaffaqiyatli yuklab olindi!");
  };

  return (
    <div className="students-container">
      {/* Yashil xabarnoma */}
      {toast.show && (
        <div className="custom-toast">
          <i
            className="fa-solid fa-circle-check"
            style={{ marginRight: "8px" }}
          ></i>
          {toast.message}
        </div>
      )}

      {/* Sarlavha */}
      <div className="page-header">
        <div className="title-section">
          <h1>Talabalar</h1>
          <span>Miqdor — {sortedStudents.length}</span>
        </div>
        <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
          Yangisini qo'shish
        </button>
      </div>

      {/* 1 & 2. FILTRLAR VA USTUNLAR TUGMASI */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
        <div className="filter-grid-2" style={{ flex: 1, marginRight: "15px" }}>
          {visibleFilters.search && (
            <input
              type="text"
              placeholder="Ism yoki telefon orqali qidirish"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="wide"
            />
          )}

          {visibleFilters.course && (
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
            >
              <option value="">Barcha guruhlar</option>
              {/* BACKENDDAN KELGAN GURUHLAR */}
              {groupsList.map((g) => (
                <option key={g.id} value={g.name || g.title || g.group_name}>
                  {g.name || g.title || g.group_name}
                </option>
              ))}
            </select>
          )}

          {visibleFilters.status && (
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Talaba holati</option>
              <option value="Faol">Aktiv (Faol)</option>
              <option value="Sinov darsida">Sinov darsida</option>
              <option value="Muzlatilgan">Muzlatilgan</option>
              <option value="Arxivlangan">Arxivlangan</option>
              <option value="Guruhlarga biriktirilmagan">Guruhsiz</option>
            </select>
          )}

          {visibleFilters.finance && (
            <select
              name="finance"
              value={filters.finance}
              onChange={handleFilterChange}
            >
              <option value="">Moliyaviy holati</option>
              <option value="Qarzdor">Qarzdor</option>
              <option value="To'lov amalga oshirilgan">
                To'lov amalga oshirilgan
              </option>
            </select>
          )}

          {visibleFilters.startDate && (
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          )}
        </div>

        {/* USTUNLAR (SOZLAMALAR) MENYUSI */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-light border d-flex align-items-center gap-2"
            onClick={() => setIsColumnsMenuOpen(!isColumnsMenuOpen)}
            style={{ height: "40px", padding: "0 20px", borderRadius: "6px" }}
          >
            <i className="fa-solid fa-gear"></i> Ustunlar
          </button>

          {isColumnsMenuOpen && (
            <div
              className="dropdown-menu show p-3 shadow border"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 1000,
                minWidth: "220px",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            >
              <h6 className="mb-3 text-muted" style={{ fontSize: "13px" }}>
                Ko'rsatiladigan filtrlar
              </h6>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colSearch"
                  style={{ cursor: "pointer" }}
                  checked={visibleFilters.search}
                  onChange={() =>
                    setVisibleFilters((p) => ({ ...p, search: !p.search }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="colSearch"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Qidiruv
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colCourse"
                  style={{ cursor: "pointer" }}
                  checked={visibleFilters.course}
                  onChange={() =>
                    setVisibleFilters((p) => ({ ...p, course: !p.course }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="colCourse"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Guruhlar
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colStatus"
                  style={{ cursor: "pointer" }}
                  checked={visibleFilters.status}
                  onChange={() =>
                    setVisibleFilters((p) => ({ ...p, status: !p.status }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="colStatus"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Talaba holati
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colFinance"
                  style={{ cursor: "pointer" }}
                  checked={visibleFilters.finance}
                  onChange={() =>
                    setVisibleFilters((p) => ({ ...p, finance: !p.finance }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="colFinance"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Moliyaviy holati
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colDate"
                  style={{ cursor: "pointer" }}
                  checked={visibleFilters.startDate}
                  onChange={() =>
                    setVisibleFilters((p) => ({
                      ...p,
                      startDate: !p.startDate,
                    }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="colDate"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Ro'yxatga olingan sana
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. JADVAL VA AMALLAR */}
      <div className="table-container table-responsive mt-3">
        <table className="students-table table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style={{ width: "3%" }}>
                <input
                  type="checkbox"
                  checked={
                    sortedStudents.length > 0 &&
                    selectedStudents.length === sortedStudents.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={{ width: "5%" }}>Foto</th>
              <th
                style={{ width: "12%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("name")}
              >
                Ism <i className={getSortIcon("name")}></i>
              </th>
              <th
                style={{ width: "10%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("status")}
              >
                Holat <i className={getSortIcon("status")}></i>
              </th>
              <th
                style={{ width: "10%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("phone")}
                className="text-center"
              >
                Telefon <i className={getSortIcon("phone")}></i>
              </th>
              <th
                style={{ width: "18%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("groups")}
              >
                Guruhlar <i className={getSortIcon("groups")}></i>
              </th>
              <th
                style={{ width: "12%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("teacher")}
              >
                O'qituvchilar <i className={getSortIcon("teacher")}></i>
              </th>
              <th
                style={{ width: "12%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("date")}
              >
                Mashg'ulotlar <i className={getSortIcon("date")}></i>
              </th>
              <th
                style={{ width: "10%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("balance")}
                className="text-center"
              >
                Balans <i className={getSortIcon("balance")}></i>
              </th>
              <th
                style={{ width: "5%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("coins")}
                className="text-center"
              >
                Tangalar <i className={getSortIcon("coins")}></i>
              </th>
              <th
                style={{ width: "5%", cursor: "pointer", userSelect: "none" }}
                onClick={() => requestSort("note")}
                className="text-center"
              >
                Izoh <i className={getSortIcon("note")}></i>
              </th>
              <th style={{ width: "2%" }}>
                <div className="table-head-icons d-flex gap-3">
                  <i
                    className="fa-regular fa-folder"
                    title="Guruhga qo'shish"
                    style={{
                      cursor:
                        selectedStudents.length > 0 ? "pointer" : "default",
                      color: selectedStudents.length > 0 ? "#F27A21" : "#bbb",
                    }}
                    onClick={() =>
                      selectedStudents.length > 0
                        ? setIsGroupModalOpen(true)
                        : alert("Talaba belgilang!")
                    }
                  ></i>
                  <i
                    className="fa-regular fa-envelope"
                    title="SMS yuborish"
                    style={{
                      cursor:
                        selectedStudents.length > 0 ? "pointer" : "default",
                      color: selectedStudents.length > 0 ? "#F27A21" : "#bbb",
                    }}
                    onClick={() =>
                      selectedStudents.length > 0
                        ? setIsSmsModalOpen(true)
                        : alert("SMS yuborish uchun talaba belgilang!")
                    }
                  ></i>
                  <i
                    className="fa-regular fa-trash-can cursor-pointer"
                    title="O'chirish"
                    style={{
                      cursor:
                        selectedStudents.length > 0 ? "pointer" : "default",
                      color: selectedStudents.length > 0 ? "#EF4444" : "#bbb",
                    }}
                    onClick={() =>
                      selectedStudents.length > 0 ? confirmBulkDelete() : null
                    }
                  ></i>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student, index) => (
                <tr
                  key={student.id}
                  onClick={() =>
                    navigate(`/students/${student.id}`, { state: { student } })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex align-items-center justify-content-center gap-2 text-gray">
                      {index + 1}.
                      <input
                        type="checkbox"
                        style={{ cursor: "pointer", margin: 0 }}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                      />
                    </div>
                  </td>

                  {/* ✅ FOTO - API DAN KELAYOTGAN RASM */}
                  <td>
                    <div
                      className="avatar-placeholder"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            // Rasm yuklana olmasa default icon ko'rsat
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<i class="fa-solid fa-user" style="font-size: 20px; color: #999;"></i>';
                          }}
                        />
                      ) : (
                        <i
                          className="fa-solid fa-user"
                          style={{ fontSize: "20px", color: "#999" }}
                        ></i>
                      )}
                    </div>
                  </td>

                  {/* Ism: Agar uzun bo'lsa 150px dan keyin ... bo'lib qoladi */}
                  <td style={{ fontWeight: "500", maxWidth: "150px" }}>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={student.name}
                    >
                      {student.name}
                    </div>
                  </td>

                  {/* Holat: Alohida ustunga ko'chdi */}
                  <td>
                    <span className="badge bg-light text-secondary border">
                      {student.status}
                    </span>
                  </td>

                  <td
                    className="text-blue text-center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {formatPhoneNumber(student.phone)}
                  </td>

                  <td>
                    <span
                      className="badge-gray"
                      style={{ display: "inline-block", marginBottom: "4px" }}
                    >
                      {student.groups}
                    </span>{" "}
                    <br /> {student.time}
                  </td>

                  <td>{student.teacher}</td>

                  <td className="text-gray" style={{ whiteSpace: "pre-line" }}>
                    {student.date}
                  </td>

                  <td className="text-center">
                    <span
                      className={
                        student.balance < 0
                          ? "badge bg-danger text-white rounded-pill"
                          : "badge bg-success text-white rounded-pill"
                      }
                    >
                      {formatBalance(student.balance)}
                    </span>
                  </td>

                  <td className="text-center">
                    <i className="fa-solid fa-coins text-warning me-1"></i>{" "}
                    {student.coins}
                  </td>

                  <td
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {student.note ? (
                      <i
                        className="fa-regular fa-comment-dots text-primary"
                        style={{ cursor: "pointer", fontSize: "18px" }}
                        onClick={() =>
                          setNoteModal({
                            isOpen: true,
                            studentName: student.name,
                            note: student.note,
                          })
                        }
                        title="Izohni ko'rish"
                      ></i>
                    ) : (
                      <i
                        className="fa-regular fa-comment-dots text-muted"
                        style={{ opacity: 0.3 }}
                        title="Izoh yo'q"
                      ></i>
                    )}
                  </td>

                  <td
                    className="action-cell"
                    style={{ position: "relative" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      onClick={(e) => handleActionClick(e, student.id)}
                      style={{
                        cursor: "pointer",
                        padding: "5px 15px",
                        fontSize: "22px",
                        fontWeight: "bold",
                        color: "#F27A21",
                        userSelect: "none",
                      }}
                    >
                      ⋮
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-5 text-muted">
                  Tanlangan filtrlarga mos talabalar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Uchta nuqta menyusi */}
        {activeDropdown && currentStudent && (
          <div
            className="dropdwn"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              background: "white",
              border: "1px solid #eaeaea",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "6px",
              minWidth: "140px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="dropdown-item"
              onClick={() => {
                handleEdit(currentStudent);
                setActiveDropdown(null);
              }}
            >
              <i className="fa-solid fa-pen me-2"></i> Tahrirlash
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                handlePayment(currentStudent);
                setActiveDropdown(null);
              }}
            >
              <i className="fa-solid fa-money-bill me-2"></i> To'lov
            </button>
            <button
              className="dropdown-item delete text-danger"
              onClick={() => {
                handleDelete(currentStudent);
                setActiveDropdown(null);
              }}
            >
              <i className="fa-solid fa-trash me-2"></i> O'chirish
            </button>
          </div>
        )}
      </div>

      <div className="table-footer mt-4 d-flex justify-content-between">
        <div className="pagination d-flex align-items-center gap-3 text-muted">
          <span style={{ cursor: "pointer" }}>|◁</span>
          <span style={{ cursor: "pointer" }}>◁</span>
          <div
            className="page-active border border-warning text-warning rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
          >
            1
          </div>
          <span style={{ cursor: "pointer" }}>▷</span>
          <span style={{ cursor: "pointer" }}>▷|</span>
        </div>
        <div className="export-actions d-flex gap-2">
          <button className="circle-btn btn-upload">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </button>
          <button
            className="circle-btn btn-download"
            onClick={exportToExcel}
            title="Excel formatida yuklab olish"
          >
            <i className="fa-solid fa-download"></i>
          </button>
        </div>
      </div>

      {/* ================= MODALLAR ================= */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
          showToast("Yangi talaba qo'shildi!");
        }}
      />
      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={confirmEdit}
        student={studentToEdit}
      />
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, student: null })}
        onSuccess={confirmPayment}
        student={paymentModal.student}
      />
      <AddGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSuccess={confirmAddToGroup}
        selectedCount={selectedStudents.length}
      />
      <SmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        onSuccess={confirmSendSms}
        selectedCount={selectedStudents.length}
      />

      {/* Yakkalik O'chirish Modali */}
      {deleteModal.isOpen && (
        <div className="mini-modal-overlay">
          <div
            className="mini-modal bg-white p-4 rounded text-center"
            style={{ width: "350px" }}
          >
            <h4 className="mb-3">Haqiqatan ham o'chirasizmi?</h4>
            <p className="text-muted mb-4">
              Siz <b>{deleteModal.student?.name}</b> ismli talabani tizimdan
              o'chirmoqchisiz.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-light border"
                onClick={() => setDeleteModal({ isOpen: false, student: null })}
              >
                Bekor qilish
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 YECHIM: Izoh ko'rish Modali */}
      {noteModal.isOpen && (
        <div
          className="mini-modal-overlay"
          onClick={() =>
            setNoteModal({ isOpen: false, studentName: "", note: "" })
          }
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="mini-modal bg-white p-4 rounded"
            style={{ width: "350px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5
                className="m-0 text-dark fw-bold"
                style={{ fontSize: "16px" }}
              >
                {noteModal.studentName}
              </h5>
              <button
                className="btn-close"
                onClick={() =>
                  setNoteModal({ isOpen: false, studentName: "", note: "" })
                }
              ></button>
            </div>
            <div className="p-3 bg-light rounded border border-warning">
              <p
                className="m-0 text-dark"
                style={{
                  whiteSpace: "pre-line",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {noteModal.note}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
