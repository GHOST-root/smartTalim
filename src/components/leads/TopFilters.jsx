import React, { useState, useEffect } from "react";
import "./styles/topFilters.css";
import { leadsApi } from "../../api/leadsApi"; // Yo'lak (path) to'g'riligiga ishonch hosil qiling

function TopFilters({ filters, setFilters, sections, sources }) {
  // 🌟 API'dan keladigan ma'lumotlar uchun State 🌟
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);

  // 🌟 API'dan ma'lumotlarni tortib kelish 🌟
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [coursesRes, empRes] = await Promise.all([
          leadsApi.getCourses?.().catch(() => []),
          leadsApi.getEmployees?.().catch(() => [])
        ]);

        // Kafolatlangan massiv (Array.isArray)
        setCourses(Array.isArray(coursesRes?.results) ? coursesRes.results : (Array.isArray(coursesRes) ? coursesRes : []));
        setEmployees(Array.isArray(empRes?.results) ? empRes.results : (Array.isArray(empRes) ? empRes : []));
      } catch (error) {
        console.error("Filter ma'lumotlarini yuklashda xato:", error);
      }
    };
    fetchFilterData();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      section: "",
      course: "",
      source: "",
      employee: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="leads-board-filters">
      <div className="leads-filters-row">

        {/* Qidiruv */}
        <div className="lf-search">
          <i className="fa-solid fa-magnifying-glass lf-search-icon"></i>
          <input
            type="text"
            placeholder="Ism yoki telefon..."
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
          />
        </div>

        {/* Selectlar */}
        <select className="lf-select" name="section" value={filters.section || ""} onChange={handleChange}>
          <option value="">Barcha bo‘limlar</option>
          {sections?.map((sec) => (
            <option key={sec.id} value={sec.id}>{sec.title}</option>
          ))}
        </select>

        <select className="lf-select" name="course" value={filters.course || ""} onChange={handleChange}>
          <option value="">Barcha kurslar</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select className="lf-select" name="source" value={filters.source || ""} onChange={handleChange}>
          <option value="">Barcha manbalar</option>
          {sources?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select className="lf-select" name="employee" value={filters.employee || ""} onChange={handleChange}>
          <option value="">Barcha xodimlar</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.full_name || emp.name || emp.first_name}</option>
          ))}
        </select>

        {/* Dates (Sanalar) */}
        <div className="lf-dates">
          <input type="date" name="startDate" value={filters.startDate || ""} onChange={handleChange} />
          <span>-</span>
          <input type="date" name="endDate" value={filters.endDate || ""} onChange={handleChange} />
        </div>

        {/* Reset (Tozalash) */}
        <button className="lf-reset-btn" onClick={resetFilters} title="Tozalash">
          <i className="fa-solid fa-rotate-right"></i>
        </button>

      </div>
    </div>
  );
}

export default TopFilters;