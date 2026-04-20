import axiosInstance from "./axiosInstance";

export const settingsApi = {
  rooms: {
    // Barcha xonalarni olish
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/rooms/');
      return response.data;
    },
    // Yangi xona yaratish
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/academics/rooms/', data);
      return response.data;
    },
    // Xonani tahrirlash
    update: async (id, data) => {
      // Faqat bitta / bo'lishi kerak
      const response = await axiosInstance.put(`/api/v1/academics/rooms/${id}/`, data);
      return response.data;
    },
    delete: async (id) => {
      // Ortiqcha slash olib tashlandi
      const response = await axiosInstance.delete(`/api/v1/academics/rooms/${id}/`);
      return response.data;
    },
    // Faqat bo'sh xonalarni olish (Kelajakda Guruhlar dars jadvali uchun kerak bo'ladi)
    getAvailable: async () => {
      const response = await axiosInstance.get('/api/v1/academics/rooms/available/');
      return response.data;
    },
  },

  courses: {
    // Barcha kurslarni olish
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/courses/');
      return response.data;
    },
    // Yangi kurs yaratish
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/academics/courses/', data);
      return response.data;
    },
    // Kursni tahrirlash
    update: async (id, data) => {
      // Backendda <int:pk> bo'lsa id raqam, <uuid:pk> bo'lsa uuid yuboriladi
      const response = await axiosInstance.put(`/api/v1/academics/courses/${id}/`, data);
      return response.data;
    },
    // Kursni o'chirish
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/academics/courses/${id}/`);
      return response.data;
    }
  },
  
  organization: {
    // Joriy sozlamalarni yuklash
    getSettings: async (orgId) => {
      const response = await axiosInstance.get(`/api/v1/organizations/organizations/${orgId}/settings/`);
      return response.data;
    },
    // Sozlamalarni yangilash (Logotip fayli borligi uchun PATCH + FormData)
    updateSettings: async (orgId, formData) => {
      const response = await axiosInstance.put(
        `/api/v1/organizations/organizations/${orgId}/settings/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
  },

  studentGroupLeaves: {
    // Barcha chiqib ketish xolatlari / sabablarini olish
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/student-group-leaves/');
      return response.data;
    },
    // Yangi chiqib ketish xolati / sababini yaratish
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/academics/student-group-leaves/', data);
      return response.data;
    },
    // Mavjudini tahrirlash (id raqam yoki uuid bo'lishini tekshiring)
    update: async (id, data) => {
      const response = await axiosInstance.put(`/api/v1/academics/student-group-leaves/${id}/`, data);
      return response.data;
    },
    // O'chirish
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/academics/student-group-leaves/${id}/`);
      return response.data;
    }
  },

  // settingsApi.js ichiga qo'shing:
  leaveReasons: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/leave-reasons/');
      return response.data;
    }
  },

  billing: {
    // Barcha tarif rejalarini (plans) olish
    getPlans: async () => {
      const response = await axiosInstance.get('/api/v1/organizations/billing/plans/');
      return response.data;
    },
    // Tashkilotning joriy to'lov holatini olish
    getCurrent: async (orgId) => {
      const response = await axiosInstance.get(`/api/v1/organizations/organizations/${orgId}/billing/current/`);
      return response.data;
    },
    // Tashkilotning to'lovlar tarixini olish
    getHistory: async (orgId) => {
      const response = await axiosInstance.get(`/api/v1/organizations/organizations/${orgId}/billing/history/`);
      return response.data;
    },
    // To'lovni amalga oshirish (yoki to'lov so'rovini yuborish)
    pay: async (orgId, data) => {
      const response = await axiosInstance.post(`/api/v1/organizations/organizations/${orgId}/billing/pay/`, data);
      return response.data;
    }
  },

  examSettings: {
    // Imtihon sozlamalarini olish (GET)
    get: async (orgId) => {
      const response = await axiosInstance.get(`/api/v1/organizations/organizations/${orgId}/exam-settings/`);
      return response.data;
    },
    // Imtihon sozlamalarini yangilash (PUT)
    update: async (orgId, data) => {
      const response = await axiosInstance.put(`/api/v1/organizations/organizations/${orgId}/exam-settings/`, data);
      return response.data;
    }
  },

  exams: {
    // Barcha imtihonlarni olish
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/v1/exams/');
      return response.data;
    },
    // Yangi imtihon yaratish (Rasmdagi maxsus /create/ yo'li)
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/academics/v1/exams/create/', data);
      return response.data;
    },
    // Imtihonni tahrirlash
    update: async (id, data) => {
      const response = await axiosInstance.put(`/api/v1/academics/exams/${id}/`, data);
      return response.data;
    },
    // Imtihonni o'chirish
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/academics/exams/${id}/`);
      return response.data;
    }
  },

  // ... (boshqa api'lar: billing, examSettings va h.k.)

  subscriptions: {
    // Sozlamalarni olish (GET)
    get: async (orgId) => {
      const response = await axiosInstance.get(`/api/v1/organizations/organizations/${orgId}/subscriptions/`);
      return response.data;
    },
    // Sozlamalarni yangilash (PUT) - ID bilan
    update: async (orgId, id, data) => {
      const response = await axiosInstance.put(`/api/v1/organizations/organizations/${orgId}/subscriptions/${id}/`, data);
      return response.data;
    },
    // Sozlamalarni yaratish (POST) - Agar hali bazada yo'q bo'lsa
    create: async (orgId, data) => {
      const response = await axiosInstance.post(`/api/v1/organizations/organizations/${orgId}/subscriptions/`, data);
      return response.data;
    }
  },

  // API faylingiz ichiga qo'shing (masalan, settingsApi ichiga):
  rooms: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/rooms/');
      return response.data;
    },
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/academics/rooms/', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axiosInstance.patch(`/api/v1/academics/rooms/${id}/`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/academics/rooms/${id}/`);
      return response.data;
    }
  }

};