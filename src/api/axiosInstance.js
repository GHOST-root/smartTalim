import axios from "axios";

// Asosiy Base URL shu yerga kiritildi
const BASE_URL = "https://hacker99000.pythonanywhere.com";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Garchi login qismi yo'q bo'lsa ham, agar LocalStorage'da tasodifan token bo'lsa
// uni qo'shib yuboradigan qilib qo'ydim (zarari yo'q)
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    const org_id = localStorage.getItem("org_id");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if (org_id) {
      // 1. GET va DELETE so'rovlar uchun (URL manzilga qo'shiladi)
      if (config.method === "get" || config.method === "delete") {
        config.params = { ...config.params, organization_id: org_id };
      }
      // 2. POST, PUT, PATCH so'rovlar uchun (Body qismiga qo'shiladi)
      else if (["post", "put", "patch"].includes(config.method)) {
        // Agar rasm/fayl bilan jo'natilayotgan bo'lsa (FormData)
        if (config.data instanceof FormData) {
          if (!config.data.has("organization")) {
            config.data.append("organization", org_id);
          }
          // 🌟 YECHIM: FormData uchun ham id qo'shamiz
          if (!config.data.has("organization_id")) {
            config.data.append("organization_id", org_id);
          }
        }
        // Oddiy JSON ma'lumot jo'natilayotgan bo'lsa
        else {
          // 🌟 YECHIM: Backend ikkalasidan o'ziga keragini olib ketaverishi uchun ikkalasini ham beramiz
          config.data = {
            ...config.data,
            organization: org_id,
            organization_id: org_id,
          };
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
