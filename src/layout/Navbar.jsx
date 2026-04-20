import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navbarApi } from "../api/navbarApi";

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [orgData, setOrgData] = useState({
    name: "Yuklanmoqda...",
    logo: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const orgId = localStorage.getItem("org_id");
        if (!orgId) return;

        const currentOrg = await navbarApi.getOrganizationById(orgId);

        if (currentOrg) {
          setOrgData({
            name: currentOrg.name || "Nomsiz Tashkilot",
            logo: currentOrg.logo || null,
          });
        }
      } catch (error) {
        console.error("Tashkilot ma'lumotlarini yuklashda xato:", error);
        setOrgData((prev) => ({ ...prev, name: "Admin" }));
      }
    };

    fetchOrgData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.trim().length > 0);
  };

  const handleResultClick = (link) => {
    setSearchTerm("");
    setIsDropdownOpen(false);
    navigate(link);
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `https://hacker99000.pythonanywhere.com${logoPath}`;
  };

  return (
    <header
      className="bg-white border-bottom d-flex align-items-center justify-content-between px-3 px-md-4"
      style={{ height: "64px", position: "sticky", top: 0, zIndex: 1040 }}
    >
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="btn btn-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            color: "#333",
          }}
        >
          <i
            className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`}
          ></i>
        </button>
      )}

      {/* Chap tomon: Logotip */}
      <div className="d-flex align-items-center">
        <NavLink
          to="/"
          className="text-decoration-none d-flex align-items-center"
        >
          <h4
            className="m-0 fw-bold text-dark"
            style={{
              letterSpacing: "-0.5px",
              fontSize: isMobile ? "16px" : "20px",
            }}
          >
            smart<span style={{ color: "#ff7a00" }}>ta'lim</span>
          </h4>
        </NavLink>
      </div>

      {/* O'rta qism: QIDIRUV (Desktop only) */}
      {!isMobile && (
        <div
          className="flex-grow-1 d-flex justify-content-center px-4"
          ref={searchRef}
        >
          <div
            className="input-group position-relative"
            style={{ maxWidth: "500px" }}
          >
            <span className="input-group-text bg-light border-end-0 text-muted px-3 rounded-start-pill">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>

            <input
              type="text"
              className="form-control bg-light border-start-0 rounded-end-pill shadow-none"
              placeholder="Tizim bo'yicha qidiruv..."
              style={{ fontSize: "14px" }}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchTerm.trim().length > 0) setIsDropdownOpen(true);
              }}
            />

            {isDropdownOpen && (
              <div
                className="position-absolute w-100 bg-white border rounded shadow-lg"
                style={{
                  top: "110%",
                  left: 0,
                  zIndex: 1050,
                  maxHeight: "350px",
                  overflowY: "auto",
                }}
              >
                <div
                  className="p-3 text-center text-muted"
                  style={{ fontSize: "14px" }}
                >
                  Bo'sh
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* O'NG TOMON: Tashkilot Nomi va Logotipi */}
      <div className="d-flex align-items-center cursor-pointer">
        {/* Tashkilot Nomi (Mobile hidden) */}
        {!isMobile && (
          <span
            className="fw-medium text-dark me-2"
            style={{
              fontSize: "14px",
              maxWidth: "150px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={orgData.name}
          >
            {orgData.name}
          </span>
        )}

        {/* Tashkilot Logotipi */}
        <div
          className="bg-light border text-secondary rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
          style={{ width: "38px", height: "38px", backgroundColor: "#f8fafc" }}
        >
          {orgData.logo ? (
            <img
              src={getLogoUrl(orgData.logo)}
              alt="Org Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <i
              className="fa-solid fa-building"
              style={{ fontSize: "16px" }}
            ></i>
          )}
        </div>
      </div>
    </header>
  );
}
