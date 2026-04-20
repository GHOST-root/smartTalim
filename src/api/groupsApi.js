import axiosInstance from "./axiosInstance";

/**
 * Academics moduli uchun guruhlar va davomat API xizmatlari
 */
export const groupsApi = {
  // --- RO'YXATLAR ---
  getAllGroups: (params) =>
    axiosInstance
      .get("/api/v1/academics/groups/", { params })
      .then((res) => res.data),
  getAllCourses: (params) =>
    axiosInstance
      .get("/api/v1/academics/courses/", { params })
      .then((res) => res.data),
  getAllTeachers: (params) =>
    axiosInstance
      .get("/api/v1/accounts/employees/", { params })
      .then((res) => res.data),
  getAllRooms: (params) =>
    axiosInstance
      .get("/api/v1/academics/rooms/", { params })
      .then((res) => res.data),

  // --- GURUH CRUD AMALLARI ---
  createGroup: (data) =>
    axiosInstance
      .post("/api/v1/academics/groups/", data)
      .then((res) => res.data),

  updateGroup: (id, data) =>
    axiosInstance
      .put(`/api/v1/academics/v1/groups/${id}/`, data)
      .then((res) => res.data),

  deleteGroup: (id) =>
    axiosInstance
      .delete(`/api/v1/academics/v1/groups/${id}/`)
      .then((res) => res.data),

  archiveGroup: (id) =>
    axiosInstance
      .post(`/api/v1/academics/groups/${id}/archive/`)
      .then((res) => res.data),

  // --- TALABALAR BILAN ISHLASH ---
  getGroupStudents: async (groupId) => {
    try {
      // Standart query: group={id}
      return await axiosInstance
        .get("/api/v1/academics/student-groups/", {
          params: { group: groupId },
        })
        .then((res) => res.data);
    } catch (error) {
      // Fallback: group_id={id}
      console.warn("Fallback: group_id ishlatilmoqda");
      return await axiosInstance
        .get("/api/v1/academics/student-groups/", {
          params: { group_id: groupId },
        })
        .then((res) => res.data);
    }
  },

  addGroupStudent: (groupId, data) =>
    axiosInstance
      .post(`/api/v1/academics/groups/${groupId}/add-student/`, data)
      .then((res) => res.data),

  // --- DAVOMAT (ATTENDANCE) ---
  getAttendance: (groupId) =>
    axiosInstance
      .get(`/api/v1/academics/v1/groups/${groupId}/attendance/`)
      .then((res) => res.data),

  saveAttendance: (data) => {
    const groupId = data.group || data.group_id;
    // URL oxirida slash bor-yo'qligini backend talabiga qarab tekshiring
    return axiosInstance
      .post(`/api/v1/academics/v1/groups/${groupId}/attendance/save/`, data)
      .then((res) => res.data);
  },

  updateAttendance: (id, data) =>
    axiosInstance
      .patch(`/api/v1/academics/v1/attendances/${id}/`, data)
      .then((res) => res.data),

  deleteAttendance: (id) =>
    axiosInstance
      .delete(`/api/v1/academics/v1/attendances/${id}/`)
      .then((res) => res.data),

  // --- QO'SHIMCHA ---
  sendGroupSms: (groupId, data) =>
    axiosInstance
      .post(`/api/v1/academics/groups/${groupId}/send-sms/`, data)
      .then((res) => res.data),

  getGroupHistory: (groupId) =>
    axiosInstance
      .get(`/api/v1/academics/groups/${groupId}/history/`)
      .then((res) => res.data),
};
