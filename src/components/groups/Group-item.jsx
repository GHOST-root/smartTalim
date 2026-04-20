import React, { useState, useMemo, useEffect } from "react";
import "./Groupitem.css";
import { ReminderModal, ConfirmModal, GroupSmsDrawer } from "./groupModals";
import AddGroupOffCanvas from "./AddGroupOffCanvas";
import { groupsApi } from "../../api/groupsApi";
import axios from "axios";

const formatKey = (d) =>
  typeof d === "string" ? d : d.toISOString().slice(0, 10);
const fmtShort = (d) =>
  new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });

export default function GroupItem(props) {
  const currentGroup = props.group || {};
  const groupId = currentGroup.id || currentGroup.uuid;

  // --- UI VA TAB STATE LAR ---
  const [activeTab, setActiveTab] = useState("davomat");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // --- API DATA STATE LAR ---
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [davstudents, setDavStudents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // --- MODAL STATE LAR ---
  const [groupSmsOpen, setGroupSmsOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: null,
    onConfirm: null,
  });

  // 1. MA'LUMOTLARNI YUKLASH (BIRGINA useEffect!)
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      setIsLoadingData(true);
      try {
        const [stRes, attRes, histRes] = await Promise.all([
          groupsApi.getGroupStudents(groupId).catch(() => ({ results: [] })),
          groupsApi.getAttendance(groupId).catch(() => ({ results: [] })),
          groupsApi.getGroupHistory(groupId).catch(() => ({ results: [] })),
        ]);

        // Talabalarni sozlash
        const studentsData = stRes.results || stRes || [];
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // 🌟 DAVOMAT PARSER (Swagger API formatida)
        const attData = attRes.results || attRes || [];
        const attDict = {};
        if (Array.isArray(attData)) {
          attData.forEach((record) => {
            const sgId = record.student_group?.id || record.student_group;
            const lDate = record.lesson_date;
            if (sgId && lDate) {
              attDict[`${sgId}-${lDate}`] = {
                id: record.id || record.uuid,
                status: record.is_present ? "present" : "absent",
              };
            }
          });
        }
        setAttendance(attDict);

        // Tarixni sozlash
        const histData = histRes.results || histRes || [];
        setHistoryLogs(Array.isArray(histData) ? histData : []);
      } catch (error) {
        console.error("Guruh detallarini yuklashda xato:", error);
        // Error bo'lsa ham, UI buzilmasin
        setStudents([]);
        setAttendance({});
        setHistoryLogs([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]); // ✅ Faqat groupId o'zgarsa qayta ishlaydi

  useEffect(() => {
    groupsApi
      .getAttendance(groupId)
      .then((data) => {
        console.log("✅ Davomat Ma'lumotlari:", data);
        console.table(data); // Jadvalda ko'rish
        setDavStudents(data.results);
      })
      .catch((error) => {
        console.error("❌ Davomatlar o'chirishda xato:", error);
        console.error("❌ Xato:", error);
      });
  }, []); // Attendance o'zgarganda UI yangilansin
  // 🌟 2. DAVOMATNI SAQLASH (Swagger bo'yicha)
  const handleAttendanceClick = async (
    studentGroupId,
    dateKey,
    currentData,
  ) => {
    const currentStatus = currentData?.status || "none";
    const recordId = currentData?.id;

    // Status aylanishi: Yo'q -> Keldi -> Kelmadi -> Yo'q
    const nextStatus =
      currentStatus === "none"
        ? "present"
        : currentStatus === "present"
          ? "absent"
          : "none";
    const dictKey = `${studentGroupId}-${dateKey}`;

    // Optimistik UI (Ekranda darhol o'zgartirish)
    setAttendance((prev) => ({
      ...prev,
      [dictKey]: { ...currentData, status: nextStatus },
    }));

    try {
      if (nextStatus === "none" && recordId) {
        await groupsApi.deleteAttendance(recordId);
        setAttendance((prev) => {
          const newState = { ...prev };
          delete newState[dictKey];
          return newState;
        });
        return;
      }

      // Payload yasash (Swagger'dagi majburiy maydonlar bilan)
      const payload = {
        lesson_date: dateKey,
        is_present: nextStatus === "present",
        student_group: studentGroupId,
      };

      if (currentGroup.organization || currentGroup.organization_id) {
        payload.organization_id =
          currentGroup.organization_id ||
          currentGroup.organization?.id ||
          currentGroup.organization;
      }
      if (currentGroup.branch || currentGroup.branch_id) {
        payload.branch_id =
          currentGroup.branch_id ||
          currentGroup.branch?.id ||
          currentGroup.branch;
      }

      if (recordId) {
        await groupsApi.updateAttendance(recordId, payload);
      } else {
        const newRecord = await groupsApi.createAttendance(payload);
        setAttendance((prev) => ({
          ...prev,
          [dictKey]: { status: nextStatus, id: newRecord.id || newRecord.uuid },
        }));
      }
    } catch (error) {
      console.error("Davomat saqlashda xato yuz berdi:", error);
      alert(
        "Davomatni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
      );
      // Xato bo'lsa orqaga qaytarish
      setAttendance((prev) => ({ ...prev, [dictKey]: currentData }));
    }
  };

  const dates = useMemo(() => {
    const arr = [];
    const base = new Date(calendarDate);
    base.setDate(base.getDate() - 7);
    for (let i = 0; i < 12; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i * 2);
      arr.push(d);
    }
    return arr;
  }, [calendarDate]);

  const filteredStudents = students
    .filter((s) =>
      showArchived ? true : s.status !== "archived" && !s.archived,
    )
    .filter((s) => {
      const name =
        s.full_name || s.first_name || s.name || s.student?.full_name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const handleDeleteGroup = () => {
    setConfirmState({
      open: true,
      title: "Guruhni o'chirish",
      message: "Haqiqatan ham bu guruhni o'chirmoqchimisiz?",
      onConfirm: async () => {
        setConfirmState({ open: false });
        try {
          await groupsApi.deleteGroup(groupId);
          props.onBack && props.onBack();
        } catch (error) {
          alert("O'chirishda xatolik yuz berdi");
        }
      },
    });
  };

  const handleSendSms = async (msgText) => {
    try {
      await groupsApi.sendGroupSms(groupId, { message: msgText });
      alert("SMS xabarlar muvaffaqiyatli yuborildi!");
      setGroupSmsOpen(false);
    } catch (error) {
      alert("SMS yuborishda xatolik yuz berdi.");
    }
  };

  const currentMonthYear = calendarDate.toLocaleDateString("uz-UZ", {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="min-vh-100 bg-light d-flex flex-column position-relative"
      style={{ paddingBottom: "50px" }}
    >
      {/* HEADER */}
      <header
        className="sticky-top border-bottom px-3 py-2 bg-white"
        style={{ zIndex: 100 }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-secondary border d-flex align-items-center justify-content-center"
              onClick={props.onBack}
              style={{ width: "32px", height: "32px" }}
            >
              <i
                className="fa-solid fa-arrow-left"
                style={{ fontSize: "12px" }}
              ></i>
            </button>
            <div>
              <h6
                className="mb-0 fw-bold text-dark"
                style={{ fontSize: "13px" }}
              >
                {currentGroup.name || "Nomsiz guruh"}
              </h6>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                {currentGroup.organization?.name || "Asosiy filial"} •{" "}
                {currentGroup.teacher?.full_name || "O'qituvchi"}
              </small>
            </div>
          </div>

          <button
            onClick={() =>
              props.onAddStudent && props.onAddStudent(currentGroup)
            }
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: "12px", padding: "4px 12px" }}
          >
            <i
              className="fa-solid fa-plus me-1"
              style={{ fontSize: "11px" }}
            ></i>{" "}
            Talaba qo'shish
          </button>
        </div>
      </header>

      <main className=" p-3">
        {isLoadingData ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 ">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Yuklanmoqda...</span>
            </div>
            <p className="text-muted fw-medium" style={{ fontSize: "12px" }}>
              Guruh ma'lumotlari yuklanmoqda...
            </p>
          </div>
        ) : (
          <div className="row g-3 align-items-start">
            {/* LEFT SIDEBAR */}
            <div className="col-lg-3 col-md-6 col-12">
              {/* Group Info Card */}
              <div className="card shadow-sm border-0 mb-3">
                <div className="card-body ">
                  <div className="info-group mb-3 pb-3 border-bottom">
                    <div className="info-row d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="text-dark fw-semibold"
                        style={{ fontSize: "11px" }}
                      >
                        KURS
                      </span>
                      <span
                        className="text-dark fw-medium"
                        style={{ fontSize: "12px" }}
                      >
                        {currentGroup.course?.name ||
                          currentGroup.course_name ||
                          "—"}
                      </span>
                    </div>
                    <div className="info-row d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        NARXI
                      </span>
                      <span
                        className="text-dark fw-medium"
                        style={{ fontSize: "12px" }}
                      >
                        {currentGroup.price ||
                          currentGroup.course?.price ||
                          "0"}{" "}
                        UZS
                      </span>
                    </div>
                    <div className="info-row d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        XONA
                      </span>
                      <span
                        className="text-dark fw-medium"
                        style={{ fontSize: "12px" }}
                      >
                        {currentGroup.room?.name ||
                          currentGroup.room_name ||
                          "—"}
                      </span>
                    </div>
                    <div className="info-row d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        KUNLAR
                      </span>
                      <span
                        className="text-dark fw-medium"
                        style={{ fontSize: "12px" }}
                      >
                        {currentGroup.day_type === "odd"
                          ? "Toq"
                          : currentGroup.day_type === "even"
                            ? "Juft"
                            : "Har kuni"}{" "}
                        · {currentGroup.start_time?.substring(0, 5) || "00:00"}
                      </span>
                    </div>
                    <div className="info-row d-flex justify-content-between">
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        DAVOMIYLIGI
                      </span>
                      <div className="text-end">
                        <div
                          className="text-dark fw-medium"
                          style={{ fontSize: "12px" }}
                        >
                          {currentGroup.start_date
                            ?.split("-")
                            .reverse()
                            .join(".")}{" "}
                          —{" "}
                          {currentGroup.end_date
                            ?.split("-")
                            .reverse()
                            .join(".")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="row g-1">
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        style={{ padding: "4px", fontSize: "11px" }}
                        title="Tahrirlash"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-danger w-100"
                        style={{ padding: "4px", fontSize: "11px" }}
                        title="O'chirish"
                        onClick={handleDeleteGroup}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        style={{ padding: "4px", fontSize: "11px" }}
                        title="SMS Yuborish"
                        onClick={() => setGroupSmsOpen(true)}
                      >
                        <i className="fa-regular fa-envelope"></i>
                      </button>
                    </div>
                    <div className="col-3">
                      <button
                        className="btn btn-sm btn-outline-primary w-100"
                        style={{ padding: "4px", fontSize: "11px" }}
                        title="Statistika"
                      >
                        <i className="fa-solid fa-chart-simple"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Search & List Card */}
              <div className="card shadow-sm border-0">
                <div className="card-body p-2">
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Qidirish..."
                      className="form-control form-control-sm"
                      style={{ fontSize: "12px" }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div
                    className="student-list-container mb-2"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                  >
                    {davstudents.length === 0 ? (
                      <div
                        className="text-center py-3 text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        Talaba yo'q
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {davstudents.map((s) => {
                          const name =
                            s.student_name || s.student?.student_name || "T";
                          const initials = name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase();
                          return (
                            <div
                              key={s.id || s.uuid}
                              className="list-group-item d-flex align-items-center px-2 py-1"
                              style={{ fontSize: "12px" }}
                            >
                              <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                }}
                              >
                                {initials}
                              </div>
                              <div className="flex-grow-1 min-w-0">
                                <p
                                  className="mb-0 fw-medium text-dark text-truncate"
                                  style={{ fontSize: "11px" }}
                                >
                                  {s.student_name}
                                </p>
                                <p
                                  className="mb-0 text-muted text-truncate"
                                  style={{ fontSize: "10px" }}
                                >
                                  {s.phone || "+998"}
                                </p>
                              </div>
                              <button
                                className="btn btn-sm btn-link text-muted p-0 ms-1"
                                style={{ fontSize: "10px" }}
                                onClick={() => setReminderOpen(true)}
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`btn btn-sm w-100 ${showArchived ? "btn-danger" : "btn-outline-danger"}`}
                    style={{ fontSize: "10px" }}
                  >
                    {showArchived ? "Yashirish" : "Arxiv"}
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div
              className={`col-lg-12 col-xl-8  col-md-12 col-12 ${isMobile ? "col-12" : "col-lg-9"}`}
            >
              <div className="card shadow-sm border-0">
                {/* Tabs */}
                <ul
                  className="nav nav-tabs card-header-tabs border-bottom"
                  role="tablist"
                  style={{ fontSize: "12px" }}
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "davomat" ? "active" : ""}`}
                      onClick={() => setActiveTab("davomat")}
                      type="button"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <i className="fa-regular fa-calendar me-1"></i> Davomat
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "tarix" ? "active" : ""}`}
                      onClick={() => setActiveTab("tarix")}
                      type="button"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <i className="fa-solid fa-history me-1"></i> Tarix
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === "online" ? "active" : ""}`}
                      onClick={() => setActiveTab("online")}
                      type="button"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <i className="fa-solid fa-globe me-1"></i> Onlayn
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="card-body ">
                  {/* DAVOMAT TAB */}
                  {activeTab === "davomat" && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6
                          className="mb-0 fw-bold text-dark"
                          style={{ fontSize: "13px" }}
                        >
                          {currentMonthYear}
                        </h6>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            style={{ padding: "2px 6px", fontSize: "11px" }}
                            onClick={() => {
                              const d = new Date(calendarDate);
                              d.setDate(d.getDate() - 7);
                              setCalendarDate(d);
                            }}
                          >
                            <i className="fa-solid fa-angle-left"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            style={{ padding: "2px 6px", fontSize: "11px" }}
                            onClick={() => {
                              const d = new Date(calendarDate);
                              d.setDate(d.getDate() + 7);
                              setCalendarDate(d);
                            }}
                          >
                            <i className="fa-solid fa-angle-right"></i>
                          </button>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table
                          className="table table-hover table-sm border mb-0"
                          style={{ fontSize: "11px" }}
                        >
                          <thead className="table-light">
                            <tr>
                              <th
                                style={{
                                  minWidth: "120px ",
                                  position: "sticky",
                                  left: 0,
                                  zIndex: 99,
                                }}
                                className="fw-bold"
                              >
                                Ism
                              </th>
                              {dates.map((d, i) => (
                                <th
                                  key={i}
                                  className="text-center fw-bold"
                                  style={{ minWidth: "50px" }}
                                >
                                  {fmtShort(d)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {davstudents.map((s) => (
                              <tr key={s.id || s.uuid}>
                                <td
                                  className="fw-medium text-dark "
                                  style={{
                                    minWidth: "66px",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 98,
                                  }}
                                >
                                  {s.student_name ||
                                    s.name ||
                                    s.student?.student_name}
                                </td>
                                {dates.map((d, i) => {
                                  const dateKey = formatKey(d);
                                  const sid = s.id || s.uuid;
                                  const currentData =
                                    attendance[`${sid}-${dateKey}`];
                                  const st = currentData?.status || "none";

                                  return (
                                    <td key={i} className="text-center p-1">
                                      <button
                                        onClick={() =>
                                          handleAttendanceClick(
                                            sid,
                                            dateKey,
                                            currentData,
                                          )
                                        }
                                        className={`btn btn-sm d-inline-flex align-items-center justify-content-center ${
                                          st === "present"
                                            ? "btn-success"
                                            : st === "absent"
                                              ? "btn-danger"
                                              : "btn-outline-secondary"
                                        }`}
                                        style={{
                                          width: "24px",
                                          height: "24px",
                                          padding: 0,
                                          fontSize: "10px",
                                        }}
                                      >
                                        {st === "present" ? (
                                          <i className="fa-solid fa-check"></i>
                                        ) : st === "absent" ? (
                                          <i className="fa-solid fa-x"></i>
                                        ) : null}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                              <tr>
                                <td
                                  colSpan={dates.length + 1}
                                  className="text-center text-muted py-4"
                                  style={{ fontSize: "11px" }}
                                >
                                  Talaba topilmadi
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TARIX TAB */}
                  {activeTab === "tarix" && (
                    <div>
                      <h6
                        className="mb-3 fw-bold text-dark"
                        style={{ fontSize: "13px" }}
                      >
                        Guruh tarixi
                      </h6>
                      {historyLogs.length === 0 ? (
                        <div className="text-center py-4">
                          <i
                            className="fa-regular fa-folder-open text-muted opacity-50 mb-2"
                            style={{ fontSize: "2rem" }}
                          ></i>
                          <p
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                          >
                            Harakat yo'q
                          </p>
                        </div>
                      ) : (
                        <div className="list-group list-group-flush">
                          {historyLogs.map((log, index) => (
                            <div
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-start px-2 py-2"
                              style={{ fontSize: "11px" }}
                            >
                              <div>
                                <span
                                  className="badge bg-light text-dark border me-1 mb-1"
                                  style={{ fontSize: "9px" }}
                                >
                                  {log.action || "Harakat"}
                                </span>
                                <p
                                  className="mb-0 text-dark"
                                  style={{ fontSize: "11px" }}
                                >
                                  {log.description || log.message}
                                </p>
                              </div>
                              <small
                                className="text-muted text-nowrap ms-1"
                                style={{ fontSize: "10px" }}
                              >
                                {log.created_at
                                  ? new Date(log.created_at).toLocaleDateString(
                                      "uz-UZ",
                                    )
                                  : ""}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ONLINE TAB */}
                  {activeTab === "online" && (
                    <div className="text-center py-4">
                      <i
                        className="fa-solid fa-globe text-muted opacity-50 mb-2"
                        style={{ fontSize: "2rem" }}
                      ></i>
                      <h6
                        className="fw-bold text-dark mb-1"
                        style={{ fontSize: "13px" }}
                      >
                        Onlayn Darslar
                      </h6>
                      <p className="text-muted" style={{ fontSize: "11px" }}>
                        Bu bo'limda onlayn darslar va videoyozuvlari joylashadi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🌟 MODALS 🌟 */}
      <GroupSmsDrawer
        open={groupSmsOpen}
        onClose={() => setGroupSmsOpen(false)}
        studentCount={filteredStudents.length}
        onSend={handleSendSms}
      />

      <ReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        onCancel={() => setConfirmState({ open: false })}
        onConfirm={confirmState.onConfirm}
      >
        {confirmState.message}
      </ConfirmModal>

      <AddGroupOffCanvas
        isOpen={isEditOpen}
        editData={currentGroup}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          setIsEditOpen(false);
          props.onBack && props.onBack();
        }}
      />
    </div>
  );
}
