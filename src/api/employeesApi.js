import axiosInstance from "./axiosInstance";

export const employeesApi = {
  // O'qituvchilar (Xodimlar) ro'yxatini olish
  getTeachers: async (params = {}) => {
    // Eslatma: Agar backend faqat o'qituvchilarni ajratib berish uchun qandaydir 
    // parametr so'rasa (masalan: ?role=teacher), uni params ichiga qo'shamiz.
    // Hozircha barcha xodimlarni tortamiz:
    const response = await axiosInstance.get('/api/v1/accounts/employees/', { params }); 
    return response.data;
  },
  
  // Yangi o'qituvchi qo'shish
  createTeacher: async (data) => {
    const response = await axiosInstance.post('/api/v1/accounts/employees/', data);
    return response.data;
  },

  // O'qituvchi ma'lumotlarini yangilash
  // employeesApi.js ichida shunga o'xshash qator bo'lishi kerak:
  updateTeacher: async (id, data) => {
      const res = await axiosInstance.patch(`/api/v1/accounts/employees/${id}/`, data);
      return res.data;
  },

  // O'qituvchini o'chirish
  deleteTeacher: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/accounts/employees/${id}/`);
    return response.data;
  }
};