import axiosInstance from "./axiosInstance";

export const leadsApi = {
  // ================= 1. USTUNLAR (Pipelines) =================
  getColumns: async () => {
    // Diqqat: axios.get emas, axiosInstance.get bo'lishi kerak!
    const response = await axiosInstance.get('/api/v1/crm/crm-pipelines/');
    return response.data;
  },
  // YANGI QO'SHILDI: Ustun yaratish
  createColumn: async (data) => {
    const response = await axiosInstance.post('/api/v1/crm/crm-pipelines/', data);
    return response.data;
  },

  // Ustunni yangilash (joylashuv yoki nomini o'zgartirish)
  updateColumn: async (id, data) => {
    // 1. (id, data) qabul qilindi
    // 2. .patch ishlatildi
    // 3. data backendga jo'natildi
    const response = await axiosInstance.patch(`/api/v1/crm/crm-pipelines/${id}/`, data);
    return response.data;
  },

  // Ustunni (Pipeline) o'chirish
  deleteColumn: async (id) => {
    // DIQQAT: ' yoki " emas, balki TAB tugmasi tepasidagi qiyshiq ` ishlatilishi shart!
    const response = await axiosInstance.delete(`/api/v1/crm/crm-pipelines/${id}/`);
    return response.data;
  },

  // ================= 2. LIDLAR (Leads) =================
  getLeads: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/crm/crm-leads/', { params });
    return response.data;
  },
  createLead: async (data) => {
    const response = await axiosInstance.post('/api/v1/crm/crm-leads/', data);
    return response.data;
  },
  updateLead: async (id, data) => {
    const response = await axiosInstance.patch(`/api/v1/crm/crm-leads/${id}/`, data);
    return response.data;
  },
  deleteLead: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/crm/crm-leads/${id}/`);
    return response.data;
  },

  // leadsApi.js ichiga qo'shiladigan qism:
  getSources: async () => {
    const response = await axiosInstance.get('/api/v1/crm/crm-sources/');
    return response.data;
  },
  createSource: async (data) => {
    const response = await axiosInstance.post('/api/v1/crm/crm-sources/', data);
    return response.data;
  },
  deleteSource: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/crm/crm-sources/${id}/`);
    return response.data;
  },
  updateSource: async (id, data) => {
    const response = await axiosInstance.patch(`/api/v1/crm/crm-sources/${id}/`, data);
    return response.data;
  },

  // ================= 4. ARXIV SABABLARI (Lost Reasons) =================
  getArchiveReasons: async () => {
    const response = await axiosInstance.get('/api/v1/crm/crm-lost-reasons/');
    return response.data;
  },

  // ================= 5. BO'LIMLAR / NABORLAR (Sections) =================
  // === 4. BO'LIMLAR (Naborlar / Sections) ===
  getSections: async () => {
    const response = await axiosInstance.get('/api/v1/crm/crm-sections/');
    return response.data;
  },
  // leadsApi.js ichidagi Nabor yaratish funksiyasi
  createSection: async (data) => {
    // 🌟 YECHIM: Qayerdan qanday ma'lumot kelishidan qat'i nazar,
    // jo'natishdan oldin tashkilot ID sini majburan qo'shib yuboramiz!
    const payload = {
      ...data,
      organization_id: localStorage.getItem("org_id")
    };

    const response = await axiosInstance.post('/api/v1/crm/crm-sections/', payload);
    return response.data;
  },
  updateSection: async (id, data) => {
    // 🔥 FIX: Qiyshiq qo'shtirnoq ishlatildi
    const response = await axiosInstance.patch(`/api/v1/crm/crm-sections/${id}/`, data);
    return response.data;
  },
  deleteSection: async (id) => {
    // 🔥 FIX: Qiyshiq qo'shtirnoq
    const response = await axiosInstance.delete(`/api/v1/crm/crm-sections/${id}/`);
    return response.data;
  },

  // ================= 6. ACADEMICS (Guruhlar va Talabalar) =================
  
  getGroups: async () => {
    const response = await axiosInstance.get('/api/v1/academics/groups/');
    return response.data;
  },

  // ================= 7. MAXSUS LID FORMALAR (Lead Forms) =================
  getLeadForms: async () => {
    const response = await axiosInstance.get('/api/v1/crm/lead-forms/');
    return response.data;
  },
  createLeadForm: async (data) => {
    const response = await axiosInstance.post('/api/v1/crm/lead-forms/', data);
    return response.data;
  },
  updateLeadForm: async (id, data) => {
    const response = await axiosInstance.patch(`/api/v1/crm/lead-forms/${id}/`, data);
    return response.data;
  },
  deleteLeadForm: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/crm/lead-forms/${id}/`);
    return response.data;
  },

  // leadsApi.js ichiga qo'shing:
  getCourses: async () => {
    const response = await axiosInstance.get('/api/v1/academics/courses/');
    return response.data;
  },
  getEmployees: async () => {
    // Xodimlar yoki o'qituvchilar URL manzili
    const response = await axiosInstance.get('/api/v1/accounts/employees/');
    return response.data;
  },

  // Lidni to'liq Talabaga aylantirish zanjiri (YAGONA VA TO'G'RI VARIANT)
  createStudentFromLead: async (leadId, groupId, payload) => {
    
    // 1. Yangi talaba yaratish (Drawer'dan kelgan barcha ma'lumotlar bilan: org_id, address va h.k.)
    const studentRes = await axiosInstance.post('/api/v1/academics/students/', payload);
    const newStudentId = studentRes.data.id || studentRes.data.uuid; // Backend qaytargan ID

    // 2. Yaratilgan talabani Guruhga qo'shish
    if (newStudentId && groupId) {
      await axiosInstance.post(`/api/v1/academics/students/${newStudentId}/add-to-group/`, {
        group_id: groupId, // Backend qaysi guruhga qo'shishni shu yerdan o'qiydi
        group: groupId     // Ehtiyot shart, ba'zi backendlar 'group' deb qabul qiladi
      });
    }

    // 3. Lidni CRM bazasidan o'chirib tashlash (Vazifasini bajardi)
    if (leadId) {
      await axiosInstance.delete(`/api/v1/crm/crm-leads/${leadId}/`);
    }

    return studentRes.data;
  },
  
};