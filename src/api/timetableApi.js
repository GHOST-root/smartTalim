// api/timetableApi.js
import axiosInstance from "./axiosInstance";

export const timetableApi = {
  getRooms: async () => {
    const response = await axiosInstance.get('/api/v1/academics/rooms/');
    return response.data;
  },
  getSchedules: async (params) => {
    const response = await axiosInstance.get('/api/v1/academics/lesson-schedules/', { params });
    return response.data;
  },
  updateSchedule: async (id, data) => {
    const response = await axiosInstance.patch(`/api/v1/academics/lesson-schedules/${id}/`, data);
    return response.data;
  },
  
  // Dars qo'shish modali uchun guruhlarni olish
  getGroups: async () => {
    const response = await axiosInstance.get('/api/v1/academics/groups/'); 
    return response.data;
  },
  // Yangi dars (Smenada) yaratish
  createSchedule: async (data) => {
    const response = await axiosInstance.post('/api/v1/academics/lesson-schedules/', data);
    return response.data;
  },

  getTeachers: async () => {
    const response = await axiosInstance.get(`/api/v1/accounts/employees/`);
    return response.data;
  },

  // timetableApi.js faylidagi eng oxirgi funksiya ostiga qo'shing:
  deleteSchedule: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/academics/lesson-schedules/${id}/`);
    return response.data;
  }
  
};