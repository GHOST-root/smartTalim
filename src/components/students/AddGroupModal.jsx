import React, { useState, useEffect } from "react";
import "./AddGroupModal.css";
import { studentsApi } from "../../api/studentsApi";

const AddGroupModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedCount,
  studentIds,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  const [formData, setFormData] = useState({
    groupId: "",
    joinDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        groupId: "",
        joinDate: new Date().toISOString().split("T")[0],
      });
      fetchGroups();
    }
  }, [isOpen]);

const fetchGroups = async () => {
  try {
    setLoading(true);
    setErrorInfo(null);

    const response = await studentsApi.getGroupsFromGroups();

    console.log("Raw response:", response);
    console.log("Response type:", typeof response);
    console.log("Is Array?:", Array.isArray(response));

    let groupList = [];

    if (response && response.results && Array.isArray(response.results)) {
      groupList = response.results;
      console.log("✅ Foydalanildi: response.results");
    } else if (Array.isArray(response)) {
      groupList = response;
      console.log("✅ Foydalanildi: response (oddiy massiv)");
    } else if (response && response.data && Array.isArray(response.data)) {
      groupList = response.data;
      console.log("✅ Foydalanildi: response.data");
    } else {
      console.warn("❌ KUTILMAGAN FORMAT:", response);
      setErrorInfo("Backend ma'lumotni to'g'ri formatda jo'natmayapti");
    }

    console.log("Final groupList:", groupList);
    setGroups(groupList);
  } catch (error) {
    console.error("❌ Xato:", error);
    setErrorInfo("Server bilan bog'lanishda xatolik yuz berdi.");
  } finally {
    setLoading(false);
  }
};
  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.groupId || !formData.joinDate) {
      alert("Iltimos, guruh va sanani tanlang!");
      return;
    }

    if (!studentIds || studentIds.length === 0) {
      alert("Hech qanday talaba tanlanmagan!");
      return;
    }

    const selectedGroup = groups.find(
      (g) => String(g.id) === String(formData.groupId),
    );

    try {
      setLoading(true);

      const orgId = localStorage.getItem('org_id');
      
      const payload = {
        group_id: formData.groupId,
        group: formData.groupId,
        join_date: formData.joinDate,
        groupName: selectedGroup?.name || selectedGroup?.title || "Noma'lum guruh",
        student_ids: studentIds, 
        organization_id: orgId,
        organization: orgId,
        branch_id: 1,
        branch: 1
      };

      console.log("Yuborilayotgan payload:", payload);
      await onSuccess(payload);
      onClose();
    } catch (error) {
      console.error("Xatolik:", error);
      setErrorInfo("Guruhga qo'shishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="group-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 9999999 }}
    >
      <div
        className="group-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="group-modal-header">
          <h2>
            Talabani guruhga qo'shish{" "}
            {selectedCount > 1 ? `(${selectedCount} ta)` : ""}
          </h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="group-modal-body">
          {errorInfo && (
            <p style={{ color: "orange", fontSize: "12px" }}>{errorInfo}</p>
          )}

          <label className="group-label">Guruhni tanlang</label>
          <select
            className="group-form-control"
            value={formData.groupId}
            onChange={(e) =>
              setFormData({ ...formData, groupId: e.target.value })
            }
            disabled={loading}
          >
            <option value="" disabled>
              Qaysi guruhga qo'shamiz?
            </option>
            {groups.length > 0 ? (
              groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {/* 🌟 YECHIM: Backend qanday nomda yuborsa ham ushlab oladigan qildik */}
                  {group.name || group.title || group.group_name || group.course_name || group.course?.name || `Guruh #${group.id}`}{" "}
                  {group.teacher_name ? `(${group.teacher_name})` : ""}
                </option>
              ))
            ) : (
              <option disabled>Guruhlar topilmadi...</option>
            )}
          </select>

          <label className="group-label" style={{ marginTop: "15px" }}>
            Sanadan boshlab
          </label>
          <input
            type="date"
            className="group-form-control"
            value={formData.joinDate}
            onChange={(e) =>
              setFormData({ ...formData, joinDate: e.target.value })
            }
            disabled={loading}
          />

          <button
            className="group-save-btn"
            onClick={handleSubmit}
            disabled={loading || groups.length === 0}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {loading ? "Yuklanmoqda..." : "Talabani guruhga qo'shish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;
