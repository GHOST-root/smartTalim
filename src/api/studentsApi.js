import axiosInstance from "./axiosInstance";

export const studentsApi = {
  // ✅ Barcha talabalar ro'yxatini olish
  getStudents: async (params = {}) => {
    console.log("📥 [GET] /api/v1/academics/students/");
    try {
      const res = await axiosInstance.get('/api/v1/academics/students/', { params });
      return res.data;
    } catch (error) {
      console.error("❌ Barcha talabalarni yuklashda xato:", error);
      throw error;
    }
  },

  // ✅ Bitta talabani ID orqali olish (Profile uchun zarur)
  getStudent: async (id) => {
    console.log(`📥 [GET] /api/v1/academics/students/${id}/`);
    try {
      const res = await axiosInstance.get(`/api/v1/academics/students/${id}/`);
      return res.data;
    } catch (error) {
      console.error(`❌ Talabani yuklashda xato (${id}):`, error);
      throw error;
    }
  },

  // ✅ Yangi talaba qo'shish
  createStudent: async (data) => {
    const res = await axiosInstance.post("/api/v1/academics/students/", data);
    return res.data;
  },

  // ✅ Talabani tahrirlash (Eslatma qoshish uchun ham shu ishlatiladi)
  updateStudent: async (id, data) => {
    const res = await axiosInstance.patch(
      `/api/v1/academics/students/${id}/`,
      data,
    );
    return res.data;
  },

  // ✅ Talabani o'chirish
  deleteStudent: async (id) => {
    const res = await axiosInstance.delete(`/api/v1/academics/students/${id}/`);
    return res.data;
  },

  // ✅ To'lov qilish
  addPayment: async (studentId, data) => {
    const res = await axiosInstance.post(
      `/api/v1/academics/students/${studentId}/add-payment/`,
      data,
    );
    return res.data;
  },

  // ✅ Guruhlarni olish
  getGroups: async () => {
    console.log("📥 [GET] /api/v1/academics/student-groups/");
    try {
      const res = await axiosInstance.get("/api/v1/academics/student-groups/");
      return res.data;
    } catch (error) {
      console.error(
        "❌ Endpoint 1 xatosi:",
        error.response?.status,
        error.message,
      );
      throw error;
    }
  },

  // ✅ Haqiqiy Guruhlarni olish
  getGroupsFromGroups: async () => {
    console.log("📥 [GET] /api/v1/academics/groups/");
    try {
      const res = await axiosInstance.get("/api/v1/academics/groups/");
      return res.data;
    } catch (error) {
      console.error(
        "❌ Endpoint 2 xatosi:",
        error.response?.status,
        error.message,
      );
      throw error;
    }
  },

  // ✅ Talabalarni guruhga qo'shish
  addStudentToGroup: async (studentId, studentData) => {
    console.log("📤 [POST] Guruhga talaba qo'shish:", {
      studentId,
      studentData,
    });
    try {
      const res = await axiosInstance.post(
        `/api/v1/academics/students/${studentId}/add-to-group/`,
        studentData
      );
      return res.data;
    } catch (error) {
      console.error(
        "❌ Guruhga qo'shishda xato:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // ✅ Talabaning balans holati
  balanceStatus: async (studentId) => {
    console.log("📥 [GET] Balans holati:", studentId);
    try {
      const res = await axiosInstance.get(
        `/api/v1/academics/students/${studentId}/balance-status/`,
      );
      return res.data;
    } catch (error) {
      console.error("❌ Balans xatosi:", error.message);
      throw error;
    }
  },

  // ✅ Talabaning to'lovlar tarixini olish
  getPaymentHistory: async (studentId) => {
    console.log("📥 [GET] To'lov tarixi:", studentId);
    try {
      const res = await axiosInstance.get(
        `/api/v1/academics/student-transactions/?student=${studentId}&student_id=${studentId}`
      );
      return res.data;
    } catch (error) {
      console.error("❌ To'lov tarixi xatosi:", error.message);
      throw error;
    }
  },

  // ✅ SMS Yuborish
  sendSms: async (id, data) => {
    try {
      const res = await axiosInstance.post(`/api/v1/academics/students/${id}/send-sms/`, data);
      return res.data;
    } catch (error) {
      console.error("❌ SMS yuborishda xato:", error);
      throw error;
    }
  },

  // 🌟 YANGI: Tarix (History) ni olish
  getStudentHistory: async (studentId) => {
    console.log("📥 [GET] Tarix:", studentId);
    try {
      const res = await axiosInstance.get(`/api/v1/academics/students/${studentId}/history/`);
      return res.data;
    } catch (error) {
      console.error("❌ Tarixni yuklashda xato:", error);
      throw error;
    }
  },

  // 🌟 YANGI: Lid tarixi (Lead History) ni olish
  getLeadHistory: async (studentId) => {
    console.log("📥 [GET] Lid Tarixi:", studentId);
    try {
      const res = await axiosInstance.get(`/api/v1/academics/students/${studentId}/lead-history/`);
      return res.data;
    } catch (error) {
      console.error("❌ Lid tarixini yuklashda xato:", error);
      throw error;
    }
  }
};