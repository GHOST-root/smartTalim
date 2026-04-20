import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Sidebar.css";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "fa-solid fa-chart-line" },
  { name: "Lidlar", path: "/leads", icon: "fa-solid fa-arrow-down" },
  { name: "O'qituvchilar", path: "/teachers", icon: "fa-solid fa-user-tie" },
  { name: "Guruhlar", path: "/groups", icon: "fa-solid fa-layer-group" },
  { name: "Talabalar", path: "/students", icon: "fa-solid fa-user-graduate" },
  {
    name: "Moliya",
    basePath: "/finance",
    icon: "fa-solid fa-hand-holding-dollar",
    children: [
      {
        name: "Barcha to'lovlar",
        path: "/finance/barchasi",
        icon: "fa-solid fa-coins",
      },
      {
        name: "Yechib olish",
        path: "/finance/withdraw",
        icon: "fa-solid fa-money-bill-transfer",
      },
      {
        name: "Xarajatlar",
        path: "/finance/xarajatlar",
        icon: "fa-solid fa-chart-pie",
      },
      {
        name: "Ish haqi",
        path: "/finance/ishhaqi",
        icon: "fa-solid fa-file-invoice-dollar",
      },
      {
        name: "Qarzdorlar",
        path: "/finance/qarzdorlar",
        icon: "fa-solid fa-triangle-exclamation",
      },
    ],
  },
  {
    name: "Hisobotlar",
    basePath: "/reports",
    icon: "fa-solid fa-chart-pie",
    children: [
      {
        name: "Darslar",
        path: "/reports/darslar",
        icon: "fa-solid fa-chalkboard-user",
      },
      {
        name: "Konversiya",
        path: "/reports/konversiya",
        icon: "fa-solid fa-arrow-trend-up",
      },
      {
        name: "Lidlar",
        path: "/reports/lidlar",
        icon: "fa-solid fa-users-viewfinder",
      },
      {
        name: "SMSlar",
        path: "/reports/smslar",
        icon: "fa-regular fa-envelope",
      },
      {
        name: "Tark etganlar",
        path: "/reports/tarketganlar",
        icon: "fa-solid fa-person-walking-arrow-right",
      },
    ],
  },
  {
    name: "Sozlamalar",
    basePath: "/settings",
    icon: "fa-solid fa-gear",
    children: [
      {
        name: "Xonalar",
        path: "/settings/xonalar",
        icon: "fa-solid fa-door-open",
      },
      { name: "Kurslar", path: "/settings/kurslar", icon: "fa-solid fa-book" },
      { name: "Xodimlar", path: "/staff", icon: "fa-solid fa-users" },
      {
        name: "Umumiy sozlamalar",
        icon: "fa-solid fa-sliders",
        subChildren: [
          { name: "Imtihon", path: "/settings/exams" },
          { name: "Imtihon sozlamalari", path: "/settings/imtihonlar" },
          { name: "Check", path: "/settings/check" },
          {
            name: "Hisoblar va To'lovlar",
            path: "/settings/hisoblar-tolovlar",
          },
        ],
      },
      {
        name: "Ofis sozlamalari",
        icon: "fa-solid fa-building-user",
        subChildren: [
          { name: "Bayram Kunlari", path: "/settings/bayram-kunlari" },
          { name: "Arxiv", path: "/settings/arxiv" },
          { name: "Guruhni tark etganlar", path: "/settings/tarketganlar" },
          { name: "Biling", path: "/settings/biling" },
        ],
      },
    ],
  },
];

function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [popoutStyle, setPopoutStyle] = useState({ top: 0, bottom: "auto" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenMenu(null);
        setExpandedSub(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("wheel", () => setOpenMenu(null));

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", () => setOpenMenu(null));
    };
  }, []);

  const isItemActive = (item) => {
    if (item.path && location.pathname === item.path) return true;
    if (item.basePath && location.pathname.startsWith(item.basePath))
      return true;
    return false;
  };

  const calculatePopoutPosition = (element) => {
    if (isMobile) return; // Mobileda hisoblashning hojati yo'q
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const estimatedHeight = 350;

    if (rect.top + estimatedHeight > windowHeight) {
      setPopoutStyle({
        top: "auto",
        bottom: `${windowHeight - rect.bottom}px`,
      });
    } else {
      setPopoutStyle({
        top: `${rect.top}px`,
        bottom: "auto",
      });
    }
  };

  const handleMainClick = (e, item) => {
    if (item.children) {
      e.preventDefault();
      if (!isMobile) {
        calculatePopoutPosition(e.currentTarget);
      }
      setOpenMenu(openMenu === item.name ? null : item.name);
    } else {
      setOpenMenu(null);
      setIsMobileMenuOpen(false);
      navigate(item.path);
    }
  };

  const handleSubClick = (e, childName) => {
    e.preventDefault();
    setExpandedSub(expandedSub === childName ? null : childName);
  };

  const handleChildNavigate = () => {
    setOpenMenu(null);
    setExpandedSub(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <div
        className={`modme-sidebar shadow-sm ${isMobile ? "mobile" : ""} ${isMobileMenuOpen ? "open" : ""}`}
        ref={sidebarRef}
      >
        {isMobile && (
          <div className="sidebar-header">
            <h5 className="m-0">Menyu</h5>
            <button
              className="btn-close"
              onClick={() => setIsMobileMenuOpen(false)}
            >x</button>
          </div>
        )}

        <ul className="sidebar-nav">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isActive = isItemActive(item);
            const isPopoutOpen = openMenu === item.name;

            return (
              <li
                key={item.name}
                className="sidebar-item-container"
                onMouseEnter={(e) => {
                  if (hasChildren && !isMobile) {
                    calculatePopoutPosition(e.currentTarget);
                    setOpenMenu(item.name);
                  }
                }}
                onMouseLeave={() => {
                  if (!isMobile) {
                    setOpenMenu(null);
                    setExpandedSub(null);
                  }
                }}
              >
                <div
                  onClick={(e) => handleMainClick(e, item)}
                  className={`sidebar-item ${isActive ? "active" : ""} ${isPopoutOpen ? "hovered" : ""}`}
                >
                  <i className={`${item.icon} sidebar-icon`}></i>
                  <span className="sidebar-text">{item.name}</span>
                </div>

                {hasChildren && isPopoutOpen && (
                  <div
                    className={`sidebar-popout shadow ${isMobile ? "mobile" : ""}`}
                    style={isMobile ? {} : popoutStyle}
                  >
                    <div className="popout-content">
                      {item.children.map((child) => {
                        if (child.subChildren) {
                          const isExpanded = expandedSub === child.name;
                          return (
                            <div key={child.name}>
                              <div
                                className={`popout-item popout-parent ${isExpanded ? "expanded" : ""}`}
                                onClick={(e) => handleSubClick(e, child.name)}
                              >
                                <div className="d-flex align-items-center">
                                  <i
                                    className={`${child.icon} popout-icon`}
                                  ></i>
                                  <span>{child.name}</span>
                                </div>
                                <i
                                  className={`fa-solid fa-chevron-right chevron-icon ${isExpanded ? "rotate" : ""}`}
                                ></i>
                              </div>

                              {isExpanded && (
                                <div className="popout-submenu">
                                  {child.subChildren.map((sub) => (
                                    <NavLink
                                      key={sub.name}
                                      to={sub.path}
                                      className={({ isActive: isSubActive }) =>
                                        `popout-sub-item ${isSubActive ? "active" : ""}`
                                      }
                                      onClick={handleChildNavigate}
                                    >
                                      <span className="sub-dot"></span>{" "}
                                      {sub.name}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive: isChildActive }) =>
                              `popout-item ${isChildActive ? "active" : ""}`
                            }
                            onClick={handleChildNavigate}
                          >
                            <i className={`${child.icon} popout-icon`}></i>
                            <span>{child.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
