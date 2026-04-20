import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Calendar, X } from 'lucide-react';
import MainLayout from "./layout/MainLayout";

// --- SAHIFALAR ---
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Teachers from "./pages/Teachers";
import TalabalarPage from "./pages/Students";
import Groups from "./pages/Groups";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import CreateOrganization from "./pages/CreateOrganization"; 
import Register from "./pages/Register";

// --- KOMPONENTLAR ---
import Profile from "./components/students/Profile";
import Timetable from "./components/dashboard/Timetable";
import Tolovlar from "./components/finance/Tolovlar";
import YechibOlish from "./components/finance/YechibOlish";
import Qarizdorlar from "./components/finance/Qarizdorlar";
import Darslar from "./components/reports/Darslar";
import Konversiya from "./components/reports/Konversiya";
import Lidlarhisob from "./components/reports/Lidlar";
import Jiringhisob from "./components/reports/Qongiroqlar";
import Smshisob from "./components/reports/smslar";
import Tarketganhisob from "./components/reports/tarkEtganlar";
import Worklyhisob from "./components/reports/Workly";
import Arxiv from "./components/settings/Arxiv";
import Holidays from "./components/settings/Holidays";
import Rooms from "./components/settings/Rooms";
import UmumiySozlamalar from "./components/settings/UmumiySozlamalar";
import Leftgroup from "./components/settings/Leftgroup";
import Imtihonlid from "./components/settings/Imtihonlid";
import Check from "./components/settings/Check";
import STolovlar from "./components/settings/Tolovlar";
import CenterAutomation from "./components/settings/Kurslar";
import Billing from "./components/settings/Biling";
import Exams from "./components/settings/Exams";

const FloatingTimetable = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Ochiq (Login/Register) sahifalarda tugmani ko'rsatmaymiz
  const hiddenRoutes = ['/login', '/register', '/create-organization', '/forgot-password'];
  if (hiddenRoutes.includes(location.pathname) || location.pathname === '/') return null;

  // Token yo'q bo'lsa ham yashiramiz
  if (!localStorage.getItem('access_token')) return null;

  return (
    <>
      {/* 🌟 Doimiy ekranda turuvchi Orange tugma (O'ng tomon o'rtasida) */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', 
          top: '50%', right: '0px', 
          transform: 'translateY(-50%)', // Aniq o'rtaga joylashtirish
          width: '60px', height: '60px', borderBottomLeftRadius: "15px", borderTopLeftRadius: "15px",
          backgroundColor: '#f97316', color: 'white', border: 'none',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
          cursor: 'pointer', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; 
          e.currentTarget.style.backgroundColor = '#ea580c'; 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; 
          e.currentTarget.style.backgroundColor = '#f97316'; 
        }}
      >
        <Calendar size={28} />
      </button>

      {/* 🌟 Katta Modal Oyna */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsOpen(false)} // Orqa fonga bossa yopiladi
        >
          {/* Timetable uchun toza Konteyner */}
          <div 
            style={{ 
              position: 'relative', width: '100%', maxWidth: '1200px', 
              maxHeight: '90vh', overflowY: 'hidden' 
            }}
            onClick={(e) => e.stopPropagation()} // Ichkariga bossa yopilib ketmasligi uchun
          >
            {/* O'ng yuqori burchakda turuvchi MUSTAQIL "X" tugmasi */}
            <button 
              onClick={() => setIsOpen(false)}
              style={{ 
                position: 'absolute', top: '30px', right: '10px', 
                background: '#fff', border: '1px solid #e2e8f0', 
                borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#ef4444', zIndex: 10001,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <X size={20} />
            </button>
            
            {/* Faqatgina Timetable ning o'zi */}
            <Timetable />
          </div>
        </div>
      )}
    </>
  );
};

const PublicRoute = () => {
  const token = localStorage.getItem('access_token');
  const orgId = localStorage.getItem('org_id');

  if (token && orgId) {
    return <Navigate to="/dashboard" replace />;
  }
  if (token && !orgId) {
     return <Navigate to="/create-organization" replace />;
  }

  // Agar umuman yalang'och bo'lsa, marhamat loginga kiraversin
  return <Outlet />;
};


// 🌟 2. "YOPIQ" SAHIFALAR QOROVULI (Dashboard, Leads va qolganlar uchun)
const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  const orgId = localStorage.getItem('org_id');

  // Agar token yo'q bo'lsa, tashqariga haydaymiz
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Agar token bor, lekin tashkilot yaratmagan bo'lsa
  if (token && !orgId && window.location.pathname !== '/create-organization') {
    return <Navigate to="/create-organization" replace />;
  }

  // Ikkalasi ham bor bo'lsa, marhamat ichkariga!
  return <Outlet />;
};


function App() {
  return (
    <>
    <Routes>
      
      {/* 🌟 OCHIQ SAHIFALAR QISMI (PublicRoute orqali himoyalangan) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<div style={{padding: '50px', textAlign: 'center'}}><h2>Parolni tiklash sahifasi tez orada ishga tushadi...</h2><a href="/login">Loginga qaytish</a></div>} />
        {/* Agar foydalanuvchi shunchaki asosiy URL ga ( / ) kirsa */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      {/* 🌟 YARIM-YAPIQ SAHIFA */}
      <Route path="/create-organization" element={<CreateOrganization />} />

      {/* 🌟 HIMOYA QILINGAN SAHIFALAR QISMI (ProtectedRoute orqali himoyalangan) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Asosiy bo'limlar */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<TalabalarPage />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/staff" element={<Staff />} />
          
          <Route path="/settings/*" element={<Settings />}>
              <Route path="arxiv" element={<Arxiv />} />
              <Route path="bayram-kunlari" element={<Holidays />} />
              <Route path="ketgan-oquvchilar" element={<Leftgroup />} />
              <Route path="xonalar" element={<Rooms />} />
              <Route path="umumiysozlamalar" element={<UmumiySozlamalar />} />
              <Route path="imtihonlar" element={<Imtihonlid />} />
              <Route path="check" element={<Check />} />
              <Route path="hisoblar-tolovlar" element={<STolovlar />} />
              <Route path="tarketganlar" element={<Leftgroup />} />
              <Route path="kurslar" element={<CenterAutomation />} />
              <Route path="biling" element={<Billing />} />
              <Route path="exams" element={<Exams />} />
            </Route>

          {/* Ichki sahifalar (Nested Routes) */}
          <Route path="/students/:id" element={<Profile />} />
          
          <Route path="/finance/*" element={<Finance />}>
              <Route path="barchasi" element={<Tolovlar />} />
              <Route path="withdraw" element={<YechibOlish />} />
              <Route path="qarzdorlar" element={<Qarizdorlar />} />
            </Route>

          <Route path="/reports/*" element={<Reports />}>
              <Route path="darslar" element={<Darslar />} />
              <Route path="konversiya" element={<Konversiya />} />
              <Route path="lidlar" element={<Lidlarhisob />} />
              <Route path="qongiroqlar" element={<Jiringhisob />} />
              <Route path="smslar" element={<Smshisob />} />
              <Route path="tarketganlar" element={<Tarketganhisob />} />
              <Route path="workly" element={<Worklyhisob />} />
          </Route>

        </Route>
      </Route>

      {/* Agar umuman noto'g'ri URL ga kirsa */}
      {/* 🌟 DIQQAT: Agar tokeni bo'lsa Dashboardga otamiz, bo'lmasa Loginga! */}
      <Route path="*" element={<Navigate to={localStorage.getItem('access_token') && localStorage.getItem('org_id') ? "/dashboard" : "/login"} replace />} />
    </Routes>

    <FloatingTimetable />
    </>
  );
}

export default App;