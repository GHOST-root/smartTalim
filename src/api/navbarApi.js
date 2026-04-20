import axiosInstance from "./axiosInstance";

export const navbarApi = {
  // Aniq bitta tashkilotni ID orqali olish
  getOrganizationById: async (id) => {
    const response = await axiosInstance.get(`/api/v1/organizations/organizations/${id}/`);
    return response.data;
  }
};