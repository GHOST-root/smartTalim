import axiosInstance from "./axiosInstance";

// Faqat bitta va to'g'ri manzil!
const FINANCE_URL = "/api/v1/finance";

export const financeApi = {
  
  // ==========================================
  // 1. XARAJATLAR (EXPENSES)
  // ==========================================
  expenseCategories: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/expense-categories/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/expense-categories/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/expense-categories/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/expense-categories/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/expense-categories/${id}/`).then(res => res.data),
  },
  expenseSubcategories: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/expense-subcategories/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/expense-subcategories/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/expense-subcategories/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/expense-subcategories/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/expense-subcategories/${id}/`).then(res => res.data),
  },
  expenses: {
    getAll: (params = {}) => axiosInstance.get(`${FINANCE_URL}/expenses/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/expenses/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/expenses/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/expenses/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/expenses/${id}/`).then(res => res.data),
    getMonthlySummary: (params) => axiosInstance.get(`${FINANCE_URL}/expenses/monthly-summary/`, { params }).then(res => res.data),
  },
  detailedExpenses: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/detailed-expenses/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/detailed-expenses/${id}/`).then(res => res.data),
    getChartData: (params) => axiosInstance.get(`${FINANCE_URL}/detailed-expenses/chart-data/`, { params }).then(res => res.data),
    getDirectorsSummary: (params) => axiosInstance.get(`${FINANCE_URL}/detailed-expenses/directors-summary/`, { params }).then(res => res.data),
  },

  // ==========================================
  // 2. TUSHUMLAR VA SOTUV (INCOME & SALES)
  // ==========================================
  monthlyIncome: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/monthly-income/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/monthly-income/${id}/`).then(res => res.data),
    getNetProfit: (id, params) => axiosInstance.get(`${FINANCE_URL}/monthly-income/${id}/net-profit/`, { params }).then(res => res.data),
  },
  
  // 👉 MANA SHU YER TO'LOV TURLARI API SI 👈
  paymentTypes: {
    getAll: () => axiosInstance.get(`${FINANCE_URL}/payments/`).then((res) => res.data),
  },
  payments: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/payments/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/payments/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/payments/`, data).then(res => res.data),
  },
  sales: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/sales/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/sales/${id}/`).then(res => res.data),
    getStatistics: (params) => axiosInstance.get(`${FINANCE_URL}/sales/statistics/`, { params }).then(res => res.data),
    getActiveCount: (params) => axiosInstance.get(`${FINANCE_URL}/sales/active-count/`, { params }).then(res => res.data),
  },

  // ==========================================
  // 3. ISH HAQI VA BONUSLAR (SALARIES, HR)
  // ==========================================
  bonuses: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/bonuses/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/bonuses/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/bonuses/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/bonuses/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/bonuses/${id}/`).then(res => res.data),
  },
  fines: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/fines/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/fines/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/fines/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/fines/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/fines/${id}/`).then(res => res.data),
  },
  salaries: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/salaries/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/salaries/${id}/`).then(res => res.data),
    calculate: (data) => axiosInstance.post(`${FINANCE_URL}/salaries/calculate/`, data).then(res => res.data),
    getSummary: (params) => axiosInstance.get(`${FINANCE_URL}/salaries/summary/`, { params }).then(res => res.data),
  },
  salaryRules: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-rules/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-rules/${id}/`).then(res => res.data),
    create: (data) => axiosInstance.post(`${FINANCE_URL}/teacher-salary-rules/`, data).then(res => res.data),
    update: (id, data) => axiosInstance.patch(`${FINANCE_URL}/teacher-salary-rules/${id}/`, data).then(res => res.data),
    delete: (id) => axiosInstance.delete(`${FINANCE_URL}/teacher-salary-rules/${id}/`).then(res => res.data),
    bulkCreate: (data) => axiosInstance.post(`${FINANCE_URL}/teacher-salary-rules/bulk-create/`, data).then(res => res.data),
    getByPeriod: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-rules/get-by-period/`, { params }).then(res => res.data),
    configurePeriod: (data) => axiosInstance.post(`${FINANCE_URL}/teacher-salary-rules/configure-period/`, data).then(res => res.data),
    getActivePeriods: () => axiosInstance.get(`${FINANCE_URL}/teacher-salary-rules/active-periods/`).then(res => res.data),
    getPeriodSummary: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-rules/period-summary/`, { params }).then(res => res.data),
  },
  salaryCalculations: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-calculations/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-calculations/${id}/`).then(res => res.data),
    calculate: (data) => axiosInstance.post(`${FINANCE_URL}/teacher-salary/calculate/`, data).then(res => res.data),
    getMonthlyReport: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-calculations/monthly-report/`, { params }).then(res => res.data),
  },
  salaryPayments: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-payments/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-payments/${id}/`).then(res => res.data),
    getSummary: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-salary-payments/summary/`, { params }).then(res => res.data),
  },

  // ==========================================
  // 4. QARZDORLIKLAR (DEBTS)
  // ==========================================
  studentDebts: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/student-debts/`, { params }).then(res => res.data),
    get: (id) => axiosInstance.get(`${FINANCE_URL}/student-debts/${id}/`).then(res => res.data),
    getSummary: (params) => axiosInstance.get(`${FINANCE_URL}/student-debts/summary/`, { params }).then(res => res.data),
  },
  teacherDebts: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-debts/`, { params }).then(res => res.data),
    getSummary: (params) => axiosInstance.get(`${FINANCE_URL}/teacher-debts/summary/`, { params }).then(res => res.data),
  },
  allDebts: {
    getAll: (params) => axiosInstance.get(`${FINANCE_URL}/all-debts/`, { params }).then(res => res.data),
  }
};