import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
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

function Sidebar() {
  return (
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
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink to="#" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <button className="logout-button">
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;