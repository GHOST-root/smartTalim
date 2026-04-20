import React, { useState, useEffect, useRef } from "react";
import { groupsApi } from "../../api/groupsApi";
import "./offcanvas.css";

export default function AddGroupOffCanvas({
  isOpen,
  onClose,
  onSuccess,
  editData,
}) {
  const [newGroup, setNewGroup] = useState({
    name: "",
    course: "",
    teacher: "",
    days: "",
    time: "",
    start: "",
    end: "",
    room: "",
  });

  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState("");
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const safeArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return (
      res.results || res.data || Object.values(res).find(Array.isArray) || []
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      try {
        const [cRes, tRes, rRes] = await Promise.all([
          groupsApi.getAllCourses(),
          groupsApi.getAllTeachers(),
          groupsApi.getAllRooms(),
        ]);

        setCoursesList(safeArray(cRes));
        setTeachersList(safeArray(tRes));
        setRoomsList(safeArray(rRes));

        if (editData) {
          setNewGroup({
            name: editData.name || "",
            course: editData.course?.id || editData.course || "",
            teacher: editData.teacher?.id || editData.teacher || "",
            days: editData.day_type || "",
            time: editData.start_time?.slice(0, 5) || "",
            start: editData.start_date || "",
            end: editData.end_date || "",
            room: editData.room?.id || editData.room || "",
          });
        } else {
          setNewGroup({
            name: "",
            course: "",
            teacher: "",
            days: "",
            time: "",
            start: "",
            end: "",
            room: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, editData]);

  const handleSave = async () => {
    const e = {};
    if (!newGroup.name) e.name = "Guruh nomi kerak";
    if (!newGroup.course) e.course = "Kursni tanlang";
    if (!newGroup.teacher) e.teacher = "O'qituvchini tanlang";
    if (!newGroup.days) e.days = "Kunlarni tanlang";
    if (!newGroup.time) e.time = "Vaqtni kiriting";
    if (!newGroup.start) e.start = "Boshlanish sanasi kerak";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        name: newGroup.name,
        course: newGroup.course,
        teacher_ids: [newGroup.teacher],
        room: newGroup.room || null,
        day_type: newGroup.days,
        start_time: newGroup.time,
        start_date: newGroup.start,
        end_date: newGroup.end || null,
        organization_id: localStorage.getItem("org_id"),
        branch: 1,
      };

      if (editData) {
        await groupsApi.updateGroup(editData.id, payload);
        setSaveSuccess("Yangilandi");
      } else {
        await groupsApi.createGroup(payload);
        setSaveSuccess("Yaratildi");
      }

      setTimeout(() => {
        setSaveSuccess("");
        onSuccess();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="oc-backdrop" onClick={onClose}></div>

      <div className="oc">
        <div className="oc-header">
          <h5>{editData ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="oc-body">
          {loading && (
            <div className="oc-loading">
              <div className="spinner-border text-primary"></div>
            </div>
          )}

          {saveSuccess && <div className="oc-success">{saveSuccess}</div>}

          <div className="oc-field">
            <label>Nomi</label>
            <input
              type="text"
              className={errors.name ? "is-invalid" : ""}
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
            />
            {errors.name && (
              <small className="text-danger">{errors.name}</small>
            )}
          </div>

          <div className="oc-field">
            <label>Kurs</label>
            <select
              className={errors.course ? "is-invalid" : ""}
              value={newGroup.course}
              onChange={(e) =>
                setNewGroup({ ...newGroup, course: e.target.value })
              }
            >
              <option value="">Tanlang</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.course && (
              <small className="text-danger">{errors.course}</small>
            )}
          </div>

          <div className="oc-field">
            <label>O'qituvchi</label>
            <select
              className={errors.teacher ? "is-invalid" : ""}
              value={newGroup.teacher}
              onChange={(e) =>
                setNewGroup({ ...newGroup, teacher: e.target.value })
              }
            >
              <option value="">Tanlang</option>
              {teachersList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
            {errors.teacher && (
              <small className="text-danger">{errors.teacher}</small>
            )}
          </div>

          <div className="oc-field">
            <label>Kunlar</label>
            <select
              className={errors.days ? "is-invalid" : ""}
              value={newGroup.days}
              onChange={(e) =>
                setNewGroup({ ...newGroup, days: e.target.value })
              }
            >
              <option value="">Tanlang</option>
              <option value="odd">Toq</option>
              <option value="even">Juft</option>
              <option value="everyday">Har kuni</option>
            </select>
            {errors.days && (
              <small className="text-danger">{errors.days}</small>
            )}
          </div>

          <div className="oc-field">
            <label>Vaqt</label>
            <input
              type="time"
              className={errors.time ? "is-invalid" : ""}
              value={newGroup.time}
              onChange={(e) =>
                setNewGroup({ ...newGroup, time: e.target.value })
              }
            />
            {errors.time && (
              <small className="text-danger">{errors.time}</small>
            )}
          </div>

          <div className="oc-row">
            <div className="oc-field">
              <label>Boshlanish</label>
              <input
                type="date"
                className={errors.start ? "is-invalid" : ""}
                value={newGroup.start}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, start: e.target.value })
                }
              />
              {errors.start && (
                <small className="text-danger">{errors.start}</small>
              )}
            </div>

            <div className="oc-field">
              <label>Tugash</label>
              <input
                type="date"
                value={newGroup.end}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, end: e.target.value })
                }
              />
            </div>
          </div>

          <div className="oc-field">
            <label>Xona</label>
            <select
              value={newGroup.room}
              onChange={(e) =>
                setNewGroup({ ...newGroup, room: e.target.value })
              }
            >
              <option value="">Tanlang</option>
              {roomsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="oc-buttons">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={loading}
            >
              {editData ? "Yangilash" : "Saqlash"}
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Bekor qilish
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
