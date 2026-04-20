import React, { useState, useEffect } from "react";
import { groupsApi } from "../../api/groupsApi";
import GroupItem from "./Group-item";
import AddGroupOffCanvas from "./AddGroupOffCanvas";
import "./Group.css"; // <-- import external CSS

/* ─── SVG Icon helpers (unchanged) ────────────────────────── */
const Icon = ({ d, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d={d} />
  </svg>
);
const PlusIcon = () => <Icon d="M12 5v14M5 12h14" />;
const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);
const EditIcon = () => (
  <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
);
const ArchiveIcon = () => (
  <Icon d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM12 22V12M3.3 7 12 12l8.7-5" />
);
const TrashIcon = () => (
  <Icon d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
);
const CheckIcon = () => <Icon d="M20 6 9 17l-5-5" />;
const XIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const FolderIcon = () => (
  <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
);

/* ─── Component ───────────────────────────────────────────── */
export default function Group() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [options, setOptions] = useState({
    courses: [],
    teachers: [],
    rooms: [],
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    id: null,
    type: "",
  });
  const [filters, setFilters] = useState({
    status: "active",
    teacher: "",
    course: "",
    days: "",
    start_date: "",
    end_date: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await groupsApi.getAllGroups(filters);
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.data)) arr = res.data;
      else if (Array.isArray(res?.data?.data)) arr = res.data.data;
      else if (Array.isArray(res?.results)) arr = res.results;
      setGroups(arr);
    } catch {
      showToast("Guruhlarni yuklashda xato", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cR, tR, rR] = await Promise.all([
          groupsApi.getAllCourses(),
          groupsApi.getAllTeachers(),
          groupsApi.getAllRooms(),
        ]);
        setOptions({
          courses: cR.results || cR || [],
          teachers: tR.results || tR || [],
          rooms: rR.results || rR || [],
        });
      } catch {}
    };
    load();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest) {
        setOpenMenu(null);
        return;
      }
      const inside =
        e.target.closest(".grp-dropdown") || e.target.closest(".grp-menu-btn");
      if (!inside) setOpenMenu(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const confirmAction = async () => {
    const { id, type } = confirmDialog;
    setConfirmDialog({ show: false, id: null, type: "" });
    try {
      if (type === "delete") {
        await groupsApi.deleteGroup(id);
        showToast("Guruh o'chirildi!", "success");
      } else if (type === "archive") {
        await groupsApi.archiveGroup(id);
        showToast("Guruh arxivlandi!", "success");
      }
      fetchGroups();
    } catch {
      showToast("Xatolik yuz berdi.", "danger");
    }
  };

  const handleEdit = (g) => {
    setEditGroupData(g);
    setIsAddOpen(true);
  };

  /* ── Helpers ───────────────────────────────────────────── */
  const getName = (g) => {
    const { course } = g;
    if (typeof course === "object" && course)
      return course.name || course.title;
    if (g.course_name) return g.course_name;
    const c = options.courses.find((x) => x.id === course || x.uuid === course);
    return c ? c.name || c.title : "—";
  };
  const getTeacher = (g) => {
    const { teacher } = g;
    if (typeof teacher === "object" && teacher)
      return teacher.full_name || teacher.first_name || teacher.name;
    if (g.teacher_name) return g.teacher_name;
    const t = options.teachers.find(
      (x) => x.id === teacher || x.uuid === teacher,
    );
    return t ? t.full_name || t.first_name || t.name : "—";
  };
  const getRoom = (g) => {
    const { room } = g;
    if (typeof room === "object" && room) return room.name || room.title;
    if (g.room_name) return g.room_name;
    const r = options.rooms.find((x) => x.id === room || x.uuid === room);
    return r ? r.name || r.title : "—";
  };
  const dayLabel = (g) =>
    g.day_type === "even"
      ? "Juft"
      : g.day_type === "odd"
        ? "Toq"
        : g.day_type === "everyday"
          ? "Har kun"
          : g.days || "—";
  const fmtDate = (d) => (d ? d.split("-").reverse().join(".") : "—");
  const passedLabel = (startDate) => {
    if (!startDate) return "—";
    const start = new Date(startDate),
      now = new Date();
    if (start > now) return "Boshlanmagan";
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    const weeks = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7)) % 4;
    if (!months && !weeks) return "< 1 hafta";
    return [months && `${months} oy`, weeks && `${weeks} hafta`]
      .filter(Boolean)
      .join(", ");
  };

  const CLEAR_FILTERS = {
    status: "active",
    teacher: "",
    course: "",
    days: "",
    start_date: "",
    end_date: "",
  };

  if (selectedGroup) {
    return (
      <GroupItem
        key={selectedGroup.id ?? selectedGroup.uuid}
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        onEdit={() => handleEdit(selectedGroup)}
      />
    );
  }

  return (
    <div className="grp-root">
      <div className="grp-page">
        {/* Header */}
        <div className="grp-header">
          <div className="grp-header-left" aria-hidden={false}>
            <h1>Guruhlar</h1>
            <p>
              Jami — <strong>{groups.length}</strong> ta guruh
            </p>
          </div>
          <button
            className="grp-add-btn"
            onClick={() => {
              setEditGroupData(null);
              setIsAddOpen(true);
            }}
            aria-label="Yangi guruh qo'shish"
          >
            <PlusIcon /> Yangisini qo'shish
          </button>
        </div>

        {/* Filters */}
        <div className="grp-filters" role="region" aria-label="Guruh filtrlari">
          <select
            className="grp-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            aria-label="Status"
          >
            <option value="active">Faol guruhlar</option>
            <option value="archived">Arxivlanganlar</option>
            <option value="">Barchasi</option>
          </select>

          <select
            className="grp-select"
            value={filters.teacher}
            onChange={(e) =>
              setFilters({ ...filters, teacher: e.target.value })
            }
            aria-label="O'qituvchi"
          >
            <option value="">O'qituvchi</option>
            {options.teachers.map((t) => (
              <option key={t.id ?? t.uuid} value={t.id ?? t.uuid}>
                {t.full_name || t.first_name || t.name}
              </option>
            ))}
          </select>

          <select
            className="grp-select"
            value={filters.course}
            onChange={(e) => setFilters({ ...filters, course: e.target.value })}
            aria-label="Kurs"
          >
            <option value="">Kurslar</option>
            {options.courses.map((c) => (
              <option key={c.id ?? c.uuid} value={c.id ?? c.uuid}>
                {c.name || c.title}
              </option>
            ))}
          </select>

          <select
            className="grp-select"
            value={filters.days}
            onChange={(e) => setFilters({ ...filters, days: e.target.value })}
            aria-label="Kunlar"
          >
            <option value="">Kunlar</option>
            <option value="even">Juft kunlar</option>
            <option value="odd">Toq kunlar</option>
            <option value="everyday">Har kun</option>
          </select>

          <input
            className="grp-date-input"
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters({ ...filters, start_date: e.target.value })
            }
            aria-label="Boshlanish sanasi"
          />
          <input
            className="grp-date-input"
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters({ ...filters, end_date: e.target.value })
            }
            aria-label="Tugash sanasi"
          />

          <button
            className="grp-clear-btn"
            title="Filterni tozalash"
            onClick={() => setFilters(CLEAR_FILTERS)}
            aria-label="Filterni tozalash"
          >
            <XIcon />
          </button>
        </div>

        {/* Table / Card */}
        <div className="grp-card" role="region" aria-label="Guruhlar ro'yxati">
          {/* Desktop table */}
          <div className="grp-table-wrap">
            <table
              className="grp-table"
              role="table"
              aria-label="Guruhlar jadvali"
            >
              <thead>
                <tr>
                  {[
                    "Guruh",
                    "Kurs",
                    "O'qituvchi",
                    "Kunlar",
                    "Sanalari",
                    "O'tilgan",
                    "Xona",
                    "Teglar",
                    "Talabalar",
                    "",
                  ].map((h, i) => (
                    <th key={i} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="10">
                      <div className="grp-empty">
                        <div className="grp-spinner" aria-hidden="true"></div>
                        <p>Yuklanmoqda...</p>
                      </div>
                    </td>
                  </tr>
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="grp-empty">
                        <FolderIcon />
                        <p>Guruhlar topilmadi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  groups.map((g, i) => {
                    const key = g.id ?? g.uuid ?? i;
                    return (
                      <tr
                        key={key}
                        onClick={() => setSelectedGroup(g)}
                        role="row"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setSelectedGroup(g);
                        }}
                        aria-label={`Guruh ${g.name || "nomsiz"}`}
                      >
                        <td>
                          <span className="grp-row-num">{i + 1}.</span>
                          <span className="grp-name">
                            {g.name || "Nomsiz guruh"}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-2)" }}>{getName(g)}</td>
                        <td style={{ fontWeight: 500 }}>{getTeacher(g)}</td>
                        <td>
                          <div>{dayLabel(g)}</div>
                          {g.start_time && (
                            <div className="grp-sub">
                              {g.start_time.slice(0, 5)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{fmtDate(g.start_date)}</div>
                          <div className="grp-sub">{fmtDate(g.end_date)}</div>
                        </td>
                        <td style={{ color: "var(--text-2)" }}>
                          {passedLabel(g.start_date)}
                        </td>
                        <td>{getRoom(g)}</td>
                        <td>
                          {g.tags?.length ? (
                            g.tags.map((t, ti) => (
                              <span
                                key={ti}
                                className="grp-badge grp-badge-gray"
                                style={{ marginRight: 6 }}
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "var(--text-3)" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className="grp-badge grp-badge-green">
                            {g.students_count ?? g.students ?? 0}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div
                            className="grp-menu-wrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="grp-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === key ? null : key);
                              }}
                              aria-haspopup="true"
                              aria-expanded={openMenu === key}
                            >
                              <DotsIcon />
                            </button>
                            {openMenu === key && (
                              <div className="grp-dropdown" role="menu">
                                <button
                                  className="grp-dropdown-item"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    handleEdit(g);
                                  }}
                                  role="menuitem"
                                >
                                  <EditIcon /> Tahrirlash
                                </button>
                                <button
                                  className="grp-dropdown-item"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    setConfirmDialog({
                                      show: true,
                                      id: g.id ?? g.uuid,
                                      type: "archive",
                                    });
                                  }}
                                  role="menuitem"
                                >
                                  <ArchiveIcon /> Arxivlash
                                </button>
                                <div className="grp-dropdown-divider" />
                                <button
                                  className="grp-dropdown-item danger"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    setConfirmDialog({
                                      show: true,
                                      id: g.id ?? g.uuid,
                                      type: "delete",
                                    });
                                  }}
                                  role="menuitem"
                                >
                                  <TrashIcon /> O'chirish
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grp-mobile-list" aria-hidden={false}>
            {isLoading ? (
              <div className="grp-empty">
                <div className="grp-spinner" aria-hidden="true"></div>
                <p>Yuklanmoqda...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="grp-empty">
                <FolderIcon />
                <p>Guruhlar topilmadi</p>
              </div>
            ) : (
              groups.map((g, idx) => {
                const key = g.id ?? g.uuid ?? idx;
                return (
                  <div
                    key={key}
                    className="grp-mobile-card"
                    onClick={() => setSelectedGroup(g)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedGroup(g);
                    }}
                    aria-label={`Guruh ${g.name || "nomsiz"}`}
                  >
                    <div className="grp-mobile-row">
                      <span className="grp-mobile-title">
                        {g.name || "Nomsiz guruh"}
                      </span>
                      <div onClick={(e) => e.stopPropagation()}>
                        <div className="grp-menu-wrap">
                          <button
                            className="grp-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === key ? null : key);
                            }}
                            aria-haspopup="true"
                            aria-expanded={openMenu === key}
                          >
                            <DotsIcon />
                          </button>
                          {openMenu === key && (
                            <div className="grp-dropdown" role="menu">
                              <button
                                className="grp-dropdown-item"
                                onClick={() => {
                                  setOpenMenu(null);
                                  handleEdit(g);
                                }}
                                role="menuitem"
                              >
                                {/* <EditIcon /> Tahrirlash */}
                              </button>
                              <button
                                className="grp-dropdown-item"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setConfirmDialog({
                                    show: true,
                                    id: g.id ?? g.uuid,
                                    type: "archive",
                                  });
                                }}
                                role="menuitem"
                              >
                                <ArchiveIcon /> Arxivlash
                              </button>
                              <div className="grp-dropdown-divider" />
                              <button
                                className="grp-dropdown-item danger"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setConfirmDialog({
                                    show: true,
                                    id: g.id ?? g.uuid,
                                    type: "delete",
                                  });
                                }}
                                role="menuitem"
                              >
                                <TrashIcon /> O'chirish
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grp-mobile-meta">
                      <span className="grp-chip">📚 {getName(g)}</span>
                      <span className="grp-chip">👨‍🏫 {getTeacher(g)}</span>
                      <span className="grp-chip">🗓 {dayLabel(g)}</span>
                      {g.start_time && (
                        <span className="grp-chip">
                          ⏰ {g.start_time.slice(0, 5)}
                        </span>
                      )}
                      <span className="grp-chip">🏠 {getRoom(g)}</span>
                      <span
                        className="grp-badge grp-badge-green"
                        style={{ padding: "6px 10px", borderRadius: 999 }}
                      >
                        {g.students_count ?? g.students ?? 0} talaba
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className="grp-toast"
          style={{
            background:
              toast.type === "success"
                ? "#16a34a"
                : toast.type === "danger"
                  ? "#dc2626"
                  : "#d97706",
          }}
          role="status"
          aria-live="polite"
        >
          <CheckIcon />
          <div>{toast.message}</div>
          <button
            className="grp-toast-close"
            onClick={() => setToast({ ...toast, show: false })}
            aria-label="Yopish"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmDialog.show && (
        <div
          className="grp-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Tasdiqlash oynasi"
        >
          <div className="grp-modal">
            <div
              className="grp-modal-icon"
              style={{
                background:
                  confirmDialog.type === "delete"
                    ? "var(--danger-soft)"
                    : "var(--warn-soft)",
                color:
                  confirmDialog.type === "delete"
                    ? "var(--danger)"
                    : "var(--warn)",
              }}
            >
              {confirmDialog.type === "delete" ? (
                <TrashIcon />
              ) : (
                <ArchiveIcon />
              )}
            </div>
            <h3>Tasdiqlang</h3>
            <p>
              Haqiqatdan ham bu guruhni{" "}
              <strong>
                {confirmDialog.type === "delete"
                  ? "o'chirmoqchimisiz"
                  : "arxivlamoqchimisiz"}
              </strong>{" "}
              ?
            </p>
            <div className="grp-modal-btns">
              <button
                className="grp-btn-ghost"
                onClick={() =>
                  setConfirmDialog({ show: false, id: null, type: "" })
                }
              >
                Yo'q
              </button>
              <button
                className="grp-btn-solid"
                style={{
                  background:
                    confirmDialog.type === "delete"
                      ? "var(--danger)"
                      : "var(--warn)",
                }}
                onClick={confirmAction}
              >
                Ha, tasdiqlayman
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <AddGroupOffCanvas
          isOpen={isAddOpen}
          editData={editGroupData}
          onClose={() => {
            setIsAddOpen(false);
            setEditGroupData(null);
          }}
          onSuccess={() => {
            setIsAddOpen(false);
            setEditGroupData(null);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}
