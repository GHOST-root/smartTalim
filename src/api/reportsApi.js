import axiosInstance from "./axiosInstance";

export const reportsApi = {
  // 1. Jami tark etganlar va oylik statistika uchun (POST so'rov)
  getStudentLeavesReport: async (filterData) => {
    const response = await axiosInstance.post('/api/v1/academics/reports/student-leaves/', filterData || {});
    return response.data;
  },
  
  // 2. Kurslar kesimida
  getCoursesReport: async (params) => {
    const response = await axiosInstance.get('/api/v1/academics/reports/courses/', { params });
    return response.data;
  },
  
  // 3. Sabablar kesimida
  getLeaveReasonsReport: async (params) => {
    const response = await axiosInstance.get('/api/v1/academics/reports/leave-reasons/', { params });
    return response.data;
  },
  
  // 4. Ustozlar kesimida
  getTeachersReport: async (params) => {
    const response = await axiosInstance.get('/api/v1/academics/reports/teachers/', { params });
    return response.data;
  },

  // reportsApi.js ichiga quyidagilarni qo'shing:

  leadsReport: {
    // Manbalar (Pie chart) uchun
    getPieChart: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/leads-report/pie-chart/', { params });
      return response.data;
    },
    // Oylik oqim (Bar chart) uchun
    getBarChart: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/leads-report/bar-chart/', { params });
      return response.data;
    },
    // Jami statistika va sonlar uchun
    getStatistics: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/leads-report/statistics/', { params });
      return response.data;
    },
    // Qo'shimcha (agar kelajakda kerak bo'lsa)
    getDetailedReport: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/leads-report/detailed-report/', { params });
      return response.data;
    }
  },

  // reportsApi.js faylining ichiga qo'shing:

  conversionReports: {
    // Voronka grafik uchun
    getFunnel: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/funnel/', { params });
      return response.data;
    },
    // Xodimlar bo'yicha filtr ma'lumotlari
    getByEmployee: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/by-employee/', { params });
      return response.data;
    },
    // Manbalar bo'yicha filtr ma'lumotlari
    getBySource: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/by-source/', { params });
      return response.data;
    },
    // Umumiy statistika
    getOverview: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/overview/', { params });
      return response.data;
    },
    getLostReasons: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/lost-reasons/', { params });
      return response.data;
    },
    getPipelineTransitions: async (params) => {
      const response = await axiosInstance.get('/api/v1/finance/conversion-reports/pipeline-transitions/', { params });
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shiladi:

  lessons: {
    // Darslar kalendari va umumiy davomat
    getCalendar: async (params) => {
      const response = await axiosInstance.get('/api/v1/academics/lessons/calendar/', { params });
      return response.data;
    },
    // Guruh bo'yicha statistika
    getGroupStatistics: async (groupId, params) => {
      const response = await axiosInstance.get(`/api/v1/academics/lessons/${groupId}/statistics/`, { params });
      return response.data;
    }
  },

  // dashboardApi.js ichiga qo'shing:
  // reportsApi.js ichiga qo'shing:
  organizations: {
    getAll: async (params) => {
      // Backend manzili odatda shunday bo'ladi, agar boshqacha bo'lsa o'zgartirib qo'yasiz:
      const response = await axiosInstance.get('/api/v1/organizations/organizations/', { params });
      return response.data;
    }
  },
  
};