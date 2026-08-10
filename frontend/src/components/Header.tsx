import { Bell, Search } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search customers, products..."
        />
      </div>

      <div className="header-right">
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">SA</div>

          <div>
            <strong>System Administrator</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;