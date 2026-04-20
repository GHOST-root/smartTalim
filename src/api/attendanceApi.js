import axiosInstance from "./axiosInstance";

export const attendanceApi = {
  // 1. Barcha yo'qlamalarni olish (GET)
  getAttendances: async (params = {}) => {
    // E'tibor bering: API da "attendences" deb yozilgan
    const response = await axiosInstance.get('/api/v1/academics/attendences/', { params });
    return response.data;
  },

  // 2. Yangi yo'qlama yaratish (POST)
  createAttendance: async (data) => {
    const response = await axiosInstance.post('/api/v1/academics/attendences/', data);
    return response.data;
  },

  // 3. Bitta aniq yo'qlamani ID orqali olish (GET)
  getAttendanceById: async (id) => {
    const response = await axiosInstance.get(`/api/v1/academics/attendences/${id}/`);
    return response.data;
  },

  // 4. Yo'qlamani to'liq yangilash (PUT)
  updateAttendance: async (id, data) => {
    const response = await axiosInstance.put(`/api/v1/academics/attendences/${id}/`, data);
    return response.data;
  },

  // 5. Yo'qlamani qisman yangilash (PATCH)
  patchAttendance: async (id, data) => {
    const response = await axiosInstance.patch(`/api/v1/academics/attendences/${id}/`, data);
    return response.data;
  },

  // 6. Yo'qlamani o'chirish (DELETE)
  deleteAttendance: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/academics/attendences/${id}/`);
    return response.data;
  }
};