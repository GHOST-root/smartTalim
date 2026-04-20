import axiosInstance from "./axiosInstance";

export const dashboardApi = {
  // --- Faol Lidlar (CRM Leads) ---
  leads: {
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/crm/crm-leads/', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/api/v1/crm/crm-leads/${id}/`);
      return response.data;
    },
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/crm/crm-leads/', data);
      return response.data;
    },
    // Odatda qisman o'zgartirish uchun PATCH ishlatamiz
    update: async (id, data) => {
      const response = await axiosInstance.patch(`/api/v1/crm/crm-leads/${id}/`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/crm/crm-leads/${id}/`);
      return response.data;
    }
  },

  // --- Lidlar Tarixi (CRM Leads History) ---
  leadsHistory: {
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/crm/crm-leads-history/', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/api/v1/crm/crm-leads-history/${id}/`);
      return response.data;
    },
    create: async (data) => {
      const response = await axiosInstance.post('/api/v1/crm/crm-leads-history/', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axiosInstance.patch(`/api/v1/crm/crm-leads-history/${id}/`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await axiosInstance.delete(`/api/v1/crm/crm-leads-history/${id}/`);
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shiladi (leads tagidan)

  students: {
    getAll: async (params) => {
      // Agar backend /talabalar/ ni ishlatsa, shunchaki so'zni o'zgartirib qo'yasiz
      const response = await axiosInstance.get('/api/v1/academics/students/', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/api/v1/academics/students/${id}/`);
      return response.data;
    },
    getHistory: async (id) => {
      const response = await axiosInstance.get(`/api/v1/academics/students/${id}/history/`);
      return response.data;
    },

    // 2. O'quvchini markazdan yoki guruhdan chiqarish (POST /api/v1/academics/students/leave/)
    leave: async (data) => {
      // data ichida qaysi o'quvchi, qaysi guruh, sababi va izohi ketadi
      const response = await axiosInstance.post('/api/v1/academics/students/leave/', data);
      return response.data;
    }
  },

  studentBalances: {
    getAll: async () => {
      const response = await axiosInstance.get('/api/v1/academics/student-balances/');
      return response.data;
    }
  },

  // Agar academicsReports degan alohida obyekt ochmoqchi bo'lsangiz:
  academicsReports: {
    // 3. O'quvchilar ketishi bo'yicha hisobot (POST /api/v1/academics/reports/student-leaves/)
    // E'tibor bering, bu GET emas POST ekan, demak body'da qandaydir filter (sana, oy) yuboriladi
    getStudentLeavesReport: async (filterData) => {
      const response = await axiosInstance.post('/api/v1/academics/reports/student-leaves/', filterData);
      return response.data;
    }
  },

  // dashboardApi.js ichiga (students tagidan) quyidagilarni qo'shing:

  groups: {
    getAll: async (params) => {
      // 🌟 YECHIM: student-groups emas, asl groups manziliga qaytardik
      const response = await axiosInstance.get('/api/v1/academics/groups/', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/api/v1/academics/groups/${id}/`);
      return response.data;
    },
    getStudents: async (id) => {
      const response = await axiosInstance.get(`/api/v1/academics/groups/${id}/students/`);
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shing:

  finance: {
    debts: {
      // Barcha qarzdor talabalar ro'yxatini olish
      getStudentDebts: async (params) => {
        const response = await axiosInstance.get('/api/v1/finance/student-debts/', { params });
        return response.data;
      },
      // Agar qarzlar bo'yicha umumiy statistika (summary) kerak bo'lsa
      getSummary: async () => {
        const response = await axiosInstance.get('/api/v1/finance/student-debts/summary/');
        return response.data;
      }
    }
  },

  // dashboardApi.js fayli ichiga quyidagini qo'shing:

  transactions: {
    // Barcha to'lovlar (tranzaksiyalar) ro'yxatini olish
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/student-transactions/', { params });
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shing:

  studentLeaves: {
    // Guruhni tark etgan o'quvchilar ro'yxatini olish
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/student-group-leaves/', { params });
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shing:
  leaveReasons: {
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/leave-reasons/', { params });
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shing:
  courses: {
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/courses/', { params });
      return response.data;
    }
  },
  teachers: {
    getAll: async (params) => {
      // O'qituvchilar manzili loyihangizga qarab o'zgarishi mumkin 
      // (masalan: /api/v1/accounts/employees/ yoki /api/v1/academics/group-teachers/)
      const response = await axiosInstance.get('/api/v1/accounts/employees/', { params });
      return response.data;
    }
  },
  leaveReasons: {
    getAll: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/leave-reasons/', { params });
      return response.data;
    }
  },
  
};