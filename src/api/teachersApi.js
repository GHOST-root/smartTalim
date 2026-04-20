import axiosInstance from './axiosInstance';

export const teachersApi = {
  // Barcha xodimlarni olib kelish (keyin frontda faqat o'qituvchilarni filtrlaymiz)
  getTeachers: async () => {
    const res = await axiosInstance.get('/api/v1/accounts/employees/');
    return res.data;
  },

  // Yangi o'qituvchi qo'shish
  createTeacher: async (data) => {
    const res = await axiosInstance.post('/api/v1/accounts/employees/', data);
    return res.data;
  },

  // O'qituvchini tahrirlash
  updateTeacher: async (id, data) => {
    const res = await axiosInstance.patch(`/api/v1/accounts/employees/${id}/`, data);
    return res.data;
  },

  // O'qituvchini o'chirish
  deleteTeacher: async (id) => {
    const res = await axiosInstance.delete(`/api/v1/accounts/employees/${id}/`);
    return res.data;
  },

  // Rollarni olish (Siz aytgan /roles/ APIsi)
  getRoles: async () => {
    const res = await axiosInstance.get('/api/v1/accounts/roles/');
    return res.data;
  }
};