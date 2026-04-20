import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

import StatCards from '../components/dashboard/StatCards';
import ExpandedList from '../components/dashboard/ExpandedList';
import ExpandedGroupsList from '../components/dashboard/ExpandedGroupList'; 
import RevenueChart from '../components/dashboard/RevuneChart';
import Timetable from '../components/dashboard/Timetable'; 
import ExpandedDebtorsList from '../components/dashboard/ExpandedDebtorsList';
import ExpandedTrialList from '../components/dashboard/ExpandedTrialsList'; 
import ExpandedPaidList from '../components/dashboard/ExpandedPaidList';
import ExpandedLeftActiveList from '../components/dashboard/ExpandedLeftActiveList';
import ExpandedLeftTrialList from '../components/dashboard/ExpandedLeftTrialList';
import ExpandedLeadsList from '../components/dashboard/ExpandedLeadsList';
import ConfirmDeleteModal from '../components/dashboard/ConfirmDeleteModal'; 

// API ni import qilamiz
import { dashboardApi } from '../api/dashboardApi';

const Dashboard = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [activeView, setActiveView] = useState(null); 
  const [dashboardStats, setDashboardStats] = useState({ 
    activeStudentsCount: 0, debtorsCount: 0, trialCount: 0, paidCount: 0, leftActiveCount: 0, leftTrialCount: 0, groupsCount: 6 
  });

  const [debtorsList, setDebtorsList] = useState([]);
  const [isLoadingDebtors, setIsLoadingDebtors] = useState(false);

  // MANA SHU IKKITA QATOR QO'SHILISHI KERAK:
  const [leftTrialList, setLeftTrialList] = useState([]);
  const [isLoadingLeftTrial, setIsLoadingLeftTrial] = useState(false);

  const [groups, setGroups] = useState([]);

  const [paidList, setPaidList] = useState([]);
  const [isLoadingPaid, setIsLoadingPaid] = useState(false);

  const [leftActiveList, setLeftActiveList] = useState([]);
  const [isLoadingLeftActive, setIsLoadingLeftActive] = useState(false);

  const [revenueData, setRevenueData] = useState({ labels: [], values: [] });

  // TUSHUMLAR GRAFIGI VA KARTKADAGI SON UCHUN (SAHIFA YUKLANGANDA ISHLAYDI)
  useEffect(() => {
    const fetchTransactionsSummary = async () => {
      try {
        const res = await dashboardApi.transactions.getAll();
        const data = res.results || (Array.isArray(res) ? res : []);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let currentMonthPaymentsCount = 0;
        
        const monthlyRevenue = {};

        data.forEach(item => {
          const dateStr = item.created_at || item.date;
          if (!dateStr) return;
          const dateObj = new Date(dateStr);

          // 1. Joriy oyda qilingan to'lovlar SONINI hisoblash
          if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
            currentMonthPaymentsCount++;
          }

          // 2. Grafik uchun summalarni OYLAR bo'yicha yig'ish (Masalan: "Apr 26")
          // Bu yerda o'zbekcha yozuv (short format) chiqadi
          const monthYear = dateObj.toLocaleString('uz-UZ', { month: 'short', year: '2-digit' });
          const amount = parseFloat(item.amount || item.payment_amount || item.price) || 0;

          if (monthlyRevenue[monthYear]) {
            monthlyRevenue[monthYear] += amount;
          } else {
            monthlyRevenue[monthYear] = amount;
          }
        });

        // Obyektdan Array ga o'tkazib State'ga beramiz
        const labels = Object.keys(monthlyRevenue);
        const values = Object.values(monthlyRevenue);

        if (labels.length > 0) {
          setRevenueData({ labels, values });
        }

        // 3. Tepadagi StatCard (Joriy oyda to'laganlar) sonini yangilash
        setDashboardStats(prev => ({
          ...prev,
          paidCount: currentMonthPaymentsCount
        }));

      } catch (error) {
        console.error("Kirimlar grafigini yuklashda xato:", error);
      }
    };

    fetchTransactionsSummary();
  }, []);

  // 1-EFFECT: Talabalar va Statistikani API dan olish
  useEffect(() => {
    const fetchStudentsAndStats = async () => {
      try {
        // 🌟 YECHIM: Talabalar va ularning balanslarini bir vaqtda yuklaymiz
        const [res, balanceRes] = await Promise.all([
          dashboardApi.students.getAll(),
          dashboardApi.studentBalances.getAll().catch(() => []) // Xato bersa dastur qulamasligi uchun
        ]);
        
        const data = res.results || res.data || res || [];
        const balancesData = balanceRes.results || balanceRes.data || balanceRes || [];

        const formattedStudents = data.map(item => {
          // Shu talabaning balansini alohida API dan qidirib topamiz
          const foundBalance = balancesData.find(b => String(b.student) === String(item.id || item.uuid) || String(b.student?.id) === String(item.id || item.uuid));
          
          // Agar alohida topilsa shuni, bo'lmasa o'zi bilan kelganini olamiz
          const realBalance = foundBalance ? (foundBalance.balance || foundBalance.amount) : (item.balance || item.new_balance || 0);

          return {
            id: item.id || item.uuid,
            name: item.full_name || item.first_name || 'Ismsiz',
            phone: item.phone_number || item.phone || '-',
            balance: parseFloat(realBalance) || 0,
            status: item.status || 'Faol',
            groups: item.group?.name || item.group_name || 'Guruhsiz',
            enrollments: item.enrollments || []
          };
        });

        setAllStudents(formattedStudents);

        // --- STATISTIKANI HISOBLASH ---
        let totalActiveEnrollments = 0;
        let totalDebtors = 0;
        let totalTrial = 0;
        let totalPaid = 0;
        let totalLeftActive = 0; 
        let totalLeftTrial = 0; 

        formattedStudents.forEach(student => {
          if (student.balance < 0) totalDebtors++;
          if (student.balance >= 0) totalPaid++; 
          
          // Diqqat: Bu yerdagi 'Arxivlangan', 'Faol' yozuvlari Backend yuborayotgan statuslarga mos bo'lishi shart!
          // Masalan, backend "archived" yoki "active" deb yuborsa, shunga o'zgartirasiz.
          if (student.status === 'Arxivlangan') totalLeftActive++;
          if (student.status === 'Sinovdan ketgan') totalLeftTrial++;

          if (student.status === 'Sinov darsida') {
            totalTrial += (student.enrollments && Array.isArray(student.enrollments) && student.enrollments.length > 0) 
              ? student.enrollments.length : 1;
          }

          if (student.status === 'Faol') {
            totalActiveEnrollments += (student.enrollments && Array.isArray(student.enrollments) && student.enrollments.length > 0) 
              ? student.enrollments.length : 1;
          }
        });

        // Barcha topilgan sonlarni BITTA obyekt qilib state'ga uzatamiz
        setDashboardStats(prevStats => ({ 
          ...prevStats,
          activeStudentsCount: totalActiveEnrollments, 
          debtorsCount: totalDebtors, 
          trialCount: totalTrial,
          leftActiveCount: totalLeftActive,
          leftTrialCount: totalLeftTrial
        }));

      } catch (error) {
        console.error("Talabalarni yuklashda xatolik:", error);
      }
    };

    fetchStudentsAndStats();

    const fetchLeadsCount = async () => {
      try {
        const res = await dashboardApi.leads.getAll();
        const data = res.results || (Array.isArray(res) ? res : []);
        // API dagi umumiy sonni olamiz
        const count = res.count || data.length || 0;

        setDashboardStats(prev => ({
          ...prev,
          activeLeadsCount: count
        }));
      } catch (error) {
        console.error("Lidlar sonini yuklashda xato:", error);
      }
    };

    fetchLeadsCount();
  }, []);

  // API dan Guruhlarni olish
  const fetchGroupsFromAPI = async () => {
    try {
      const res = await dashboardApi.groups.getAll();
      const data = res.results || res.data || res || [];

      const formattedGroups = data.map(item => ({
        id: item.id || item.uuid,
        name: item.name || 'Ismsiz guruh',
        // Agar backend course va teacher ismlarini yubormasa, xato bermasligi uchun tekshiruvlar:
        course: item.course?.name || item.course_name || (typeof item.course === 'string' ? 'Kurs biriktirilgan' : 'Kurs yo\'q'),
        teacher: item.teacher?.full_name || item.teacher_name || 'O\'qituvchi ma\'lumoti yo\'q',
        
        // Kunlar va Sanalar
        days: item.day_type === 'even' ? 'Juft kunlar' : (item.day_type === 'odd' ? 'Toq kunlar' : (item.days || '-')),
        dates: `${item.start_date || '...'} —\n${item.end_date || '...'}`,
        duration: item.duration || '-', // Backend hisoblab bersa zo'r, aks holda chiziqcha
        room: item.room?.name || item.room_name || 'Xonasiz',
        studentsCount: item.students_count || 0
      }));

      setGroups(formattedGroups);
      
      // Tepadagi "Guruhlar" kartochkasidagi sonni yangilaymiz
      setDashboardStats(prevStats => ({
        ...prevStats,
        groupsCount: formattedGroups.length
      }));

    } catch (error) {
      console.error("Guruhlarni yuklashda xato yuz berdi:", error);
    }
  };

  const fetchDebtorsFromAPI = async () => {
    setIsLoadingDebtors(true);
    try {
      // Backendda /finance/student-debts/ yo'q bo'lgani uchun, 
      // barcha talabalar (allStudents) orasidan balansi 0 dan kichiklarni o'zimiz ajratib olamiz:
      const debtors = allStudents
        .filter(s => s.balance < 0)
        .map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          balance: s.balance,
          groups: s.groups,
          teacher: s.teacher || '---',
          note: '-',
          status: s.status
        }));
      
      setDebtorsList(debtors);
    } catch (error) {
      console.error("Qarzdorlarni yuklashda xato:", error);
    } finally {
      setIsLoadingDebtors(false);
    }
  };

  useEffect(() => {
    if (activeView === 'debtors') {
      fetchDebtorsFromAPI();
    }
  }, [activeView]);

  // Faqat 1 marta (sahifa ochilganda) ishlashi uchun useEffect:
  useEffect(() => {
    fetchGroupsFromAPI();
  }, []);

  const fetchPaidStudentsFromAPI = async () => {
    setIsLoadingPaid(true);
    try {
      const res = await dashboardApi.transactions.getAll();
      const data = res.results || (Array.isArray(res) ? res : []);

      // 🌟 YECHIM: Backend faqat ID yuboryapti, ism va telefonni o'zimizning allStudents dan topamiz
      const formattedPaid = data.map(item => {
        const studentId = item.student || item.student_id;
        const foundStudent = allStudents.find(s => String(s.id) === String(studentId));

        return {
          id: item.id || item.uuid,
          name: foundStudent ? foundStudent.name : (item.student_name || 'Ismsiz'),
          phone: foundStudent ? foundStudent.phone : '+998 -- --- -- --',
          groups: foundStudent ? foundStudent.groups : (item.group?.name || 'Guruhsiz'), 
          paymentAmount: parseFloat(item.amount || item.payment_amount || item.price) || 0,
          paymentDate: item.created_at ? item.created_at.split('T')[0] : (item.date || '-')
        };
      });

      setPaidList(formattedPaid);
    } catch (error) {
      console.error("To'lovlarni yuklashda xato:", error);
    } finally {
      setIsLoadingPaid(false);
    }
  };

  useEffect(() => {
    if (activeView === 'paid') {
      fetchPaidStudentsFromAPI();
    }
  }, [activeView]);

  // 1. FAOL GURUHDAN KETGANLARNI YUKLASH
  const fetchLeftActiveFromAPI = async () => {
    setIsLoadingLeftActive(true);
    try {
      // POST so'roviga bo'sh obyekt {} yoki backend kutayotgan filtrlarni yuboramiz
      // Masalan: { status: 'active_left' } yoki shunga o'xshash
      const res = await dashboardApi.studentLeaves.getAll({});
      const data = res.results || (Array.isArray(res) ? res : []);

      const formattedLeftActive = data.map(item => ({
        id: item.id || item.uuid,
        name: item.student?.full_name || item.student?.first_name || 'Ismsiz',
        phone: item.student?.phone_number || item.phone || '+998 -- --- -- --',
        course: item.group?.course?.name || item.course_name || 'Kurs',
        group: item.group?.name || item.group_name || 'Guruh',
        teacher: item.group?.teacher?.full_name || item.teacher_name || 'O\'qituvchi',
        leaveReason: item.leave_reason?.name || item.reason || 'Sabab ko\'rsatilmagan',
        note: item.comment || item.note || '-',
        archivedBy: item.created_by?.full_name || item.archived_by || 'Tizim',
        archivedDate: item.created_at ? item.created_at.split('T')[0] : '-'
      }));

      // Agar backend barcha ketganlarni yuborayotgan bo'lsa, shu yerda filter qilib olamiz
      // Yoki API o'zi to'g'ri yuborsa, to'g'ridan-to'g'ri setLeftActiveList(formattedLeftActive) qilamiz
      setLeftActiveList(formattedLeftActive);
    } catch (error) {
      console.error("Guruhdan ketganlarni yuklashda xato:", error);
    } finally {
      setIsLoadingLeftActive(false);
    }
  };

  // 2. SINOVDAN KETGANLARNI YUKLASH
  const fetchLeftTrialFromAPI = async () => {
    setIsLoadingLeftTrial(true);
    try {
      const res = await dashboardApi.studentLeaves.getAll({});
      const data = res.results || (Array.isArray(res) ? res : []);

      const formattedLeftTrial = data.map(item => ({
        id: item.id || item.uuid,
        name: item.student?.full_name || item.student?.first_name || 'Ismsiz',
        phone: item.student?.phone_number || item.phone || '+998 -- --- -- --',
        course: item.group?.course?.name || item.course_name || 'Kurs',
        group: item.group?.name || item.group_name || 'Guruh',
        teacher: item.group?.teacher?.full_name || item.teacher_name || 'O\'qituvchi',
        leaveReason: item.leave_reason?.name || item.reason || 'Sabab ko\'rsatilmagan',
        note: item.comment || item.note || '-',
        archivedBy: item.created_by?.full_name || item.archived_by || 'Tizim',
        archivedDate: item.created_at ? item.created_at.split('T')[0] : '-'
      }));

      setLeftTrialList(formattedLeftTrial);
    } catch (error) {
      console.error("Sinovdan ketganlarni yuklashda xato:", error);
    } finally {
      setIsLoadingLeftTrial(false);
    }
  };

  useEffect(() => {
    if (activeView === 'left_trial') {
      fetchLeftTrialFromAPI();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'left_active') {
      fetchLeftActiveFromAPI();
    }
  }, [activeView]);

  // =====================================================================
  // --- LIDLAR VA O'CHIRISH MANTIG'I (API BILAN TO'G'RILANGAN QISM) ---
  // =====================================================================
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Lidalarni yuklash funksiyasi (Qotib qolmasligi uchun oddiy yozilgan)
  const fetchLeadsFromAPI = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await dashboardApi.leads.getAll();
      const data = res.results || (Array.isArray(res) ? res : []);
      
      const formattedLeads = data.map(item => ({
        id: item.id || item.uuid,
        name: item.full_name || item.name || 'Ismsiz',
        phone: item.phone_number || item.phone || '-',
        time: item.created_at ? item.created_at.split('T')[0] : '-'
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error("Lidlarni yuklashda xato:", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // 2-EFFECT: Faqat "Faol lidlar" tugmasi bosilgandagina ishga tushadi
  useEffect(() => {
    if (activeView === 'leads') {
      fetchLeadsFromAPI();
    }
  }, [activeView]);

  // Modalni ochish
  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // API orqali Lidni o'chirish
  const confirmDelete = async () => {
    if (itemToDelete !== null) {
      try {
        await dashboardApi.leads.delete(itemToDelete); // Backenddan o'chirish
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        setToastMessage("Lid muvaffaqiyatli o'chirildi!");
        setTimeout(() => setToastMessage(''), 3000);
        
        fetchLeadsFromAPI(); // O'chirilgach ro'yxatni yangilash
      } catch (error) {
        console.error("O'chirishda xato yuz berdi:", error);
        alert("O'chirishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    }
  };

  // =====================================================================

  return (
    <div className="dashboard-container">
      
      <StatCards dashboardStats={dashboardStats} activeView={activeView} setActiveView={setActiveView} />

      {activeView === 'leads' && (
        isLoadingLeads ? (
           <div className="text-center py-4 text-primary">Yuklanmoqda...</div>
        ) : (
           <ExpandedLeadsList leads={leads} onClose={() => setActiveView(null)} onDelete={handleDeleteClick} />
        )
      )}
      
      {activeView === 'active_students' && <ExpandedList students={allStudents.filter(s => s.status === 'Faol')} onClose={() => setActiveView(null)} title="Faol talabalar ro'yxati" />}

      {activeView === 'groups' && <ExpandedGroupsList groups={groups} onClose={() => setActiveView(null)} />}

      {activeView === 'debtors' && (
        isLoadingDebtors ? (
           <div className="text-center py-4 text-danger fw-bold">Qarzdorlar yuklanmoqda...</div>
        ) : (
           <ExpandedDebtorsList debtors={debtorsList} onClose={() => setActiveView(null)} />
        )
      )}

      {activeView === 'trial' && <ExpandedTrialList students={allStudents.filter(s => s.status === 'Sinov darsida')} onClose={() => setActiveView(null)} />}

      {activeView === 'paid' && (
        isLoadingPaid ? (
           <div className="text-center py-4 text-success fw-bold">To'lovlar tarixi yuklanmoqda...</div>
        ) : (
           <ExpandedPaidList students={paidList} onClose={() => setActiveView(null)} />
        )
      )}

      {activeView === 'left_active' && (
        isLoadingLeftActive ? (
           <div className="text-center py-4 text-info fw-bold">Guruhdan ketganlar yuklanmoqda...</div>
        ) : (
           <ExpandedLeftActiveList students={leftActiveList} onClose={() => setActiveView(null)} />
        )
      )}

      {/* YANGI VA TO'G'RI QATOR: */}
      {activeView === 'left_trial' && (
        isLoadingLeftTrial ? (
          <div className="text-center py-4 text-warning fw-bold">Sinovdan ketganlar yuklanmoqda...</div>
        ) : (
          <ExpandedLeftTrialList students={leftTrialList} onClose={() => setActiveView(null)} />
        )
      )}

      {activeView === null && (
        <div style={{ animation: 'fadeInUp 0.3s ease' }}>
          {/* Grafikka ma'lumot uzatamiz */}
          <RevenueChart chartLabels={revenueData.labels} chartValues={revenueData.values} />       
          <Timetable />
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
      />

      {toastMessage && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x mt-4 badge bg-success px-4 py-3 shadow border" 
          style={{ zIndex: 9999, fontSize: '14px', animation: 'fadeInDown 0.3s ease' }}
        >
          <i className="fa-solid fa-circle-check me-2"></i>
          {toastMessage}
        </div>
      )}

    </div>
  );
};

export default Dashboard;