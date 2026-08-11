import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  getStoredUser,
  getBusinessName,
  isSuperAdmin,
  isBusinessAdmin,
  logout as logoutUser,
} from "../services/auth.service";

function Layout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = getStoredUser();
  const businessName = getBusinessName();
  const superAdmin = isSuperAdmin();
  const businessAdmin = isBusinessAdmin();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("fundops-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    setDarkMode(shouldUseDark);
    document.documentElement.setAttribute("data-theme", shouldUseDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    window.localStorage.setItem("fundops-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (superAdmin) return "Platform Admin";
    if (businessAdmin) return "Business Admin";
    if (user?.role === "SALES") return "Sales";
    if (user?.role === "WAREHOUSE") return "Warehouse";
    if (user?.role === "ACCOUNTS") return "Accounts";
    return user?.role || "User";
  };

  // Get user avatar initials
  const getInitials = () => {
    if (!user) return "?";
    const names = user.name.split(" ");
    return (
      (names[0]?.[0] || "") + (names[1]?.[0] || "")
    ).toUpperCase();
  };

  // Filter navigation based on role
  const getNavItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "BUSINESS_ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
      },
    ];

    if (superAdmin) {
      return [
        ...baseItems,
        {
          name: "Businesses",
          path: "/businesses",
          icon: Users,
          roles: ["SUPER_ADMIN"],
        },
        {
          name: "Platform Dashboard",
          path: "/platform-dashboard",
          icon: LayoutDashboard,
          roles: ["SUPER_ADMIN"],
        },
      ];
    }

    // Business-scoped navigation
    const businessItems = [
      {
        name: "Customers",
        path: "/customers",
        icon: Users,
        roles: ["BUSINESS_ADMIN", "SALES", "ACCOUNTS"],
      },
      {
        name: "Products",
        path: "/products",
        icon: Package,
        roles: ["BUSINESS_ADMIN", "SALES", "WAREHOUSE"],
      },
      {
        name: "Inventory",
        path: "/inventory",
        icon: Boxes,
        roles: ["BUSINESS_ADMIN", "WAREHOUSE"],
      },
      {
        name: "Sales Challans",
        path: "/challans",
        icon: FileText,
        roles: ["BUSINESS_ADMIN", "SALES", "ACCOUNTS"],
      },
    ];

    if (businessAdmin) {
      businessItems.push({
        name: "Employees",
        path: "/employees",
        icon: Users,
        roles: ["BUSINESS_ADMIN"],
      });
      businessItems.push({
        name: "Follow-ups",
        path: "/followups",
        icon: FileText,
        roles: ["BUSINESS_ADMIN", "SALES"],
      });
      businessItems.push({
        name: "Audit Logs",
        path: "/audit",
        icon: FileText,
        roles: ["BUSINESS_ADMIN"],
      });
    }

    return [...baseItems, ...businessItems];
  };

  const navItems = getNavItems();

  return (
    <div className="app-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-box">F</div>

          <div>
            <h2>FundOps</h2>
            <span>{superAdmin ? "Platform" : "ERP Portal"}</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p>MAIN MENU</p>

          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={20} />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          {!superAdmin && (
            <button className="nav-item" type="button">
              <Settings size={20} />
              <span>Settings</span>
            </button>
          )}

          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="header-search">
              <Search size={19} />
              <input type="text" placeholder="Search customers, products..." />
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="icon-button header-icon-button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="notification-button" type="button">
              <Bell size={21} />

              <span className="notification-dot" />
            </button>

            <div className="user-profile">
              <div className="avatar">{getInitials()}</div>

              <div>
                <strong>
                  {businessName || "Platform"} {superAdmin ? "" : ""}
                </strong>
                <span>{getRoleDisplay()}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default Layout;