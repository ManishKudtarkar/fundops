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
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Boxes,
    },
    {
      name: "Sales Challans",
      path: "/challans",
      icon: FileText,
    },
  ];

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">F</div>

          <div>
            <h2>FundOps</h2>
            <span>ERP Portal</span>
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
          <button className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        {/* HEADER */}
        <header className="header">
          <div className="header-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search customers, products..."
            />
          </div>

          <div className="header-right">
            <button className="notification-button">
              <Bell size={21} />

              <span className="notification-dot" />
            </button>

            <div className="user-profile">
              <div className="avatar">SA</div>

              <div>
                <strong>System Administrator</strong>
                <span>ADMIN</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default Layout;