import { Link } from "react-router-dom";

const features = [
  {
    icon: "👥",
    title: "Customer Management",
    desc: "Track retail, wholesale & distributor customers with follow-up scheduling.",
  },
  {
    icon: "📦",
    title: "Product & Inventory",
    desc: "Manage products, stock levels, and get low-stock alerts automatically.",
  },
  {
    icon: "🧾",
    title: "Sales Challans",
    desc: "Create, confirm, and print delivery challans linked to customers.",
  },
  {
    icon: "📊",
    title: "Dashboard & Reports",
    desc: "Real-time stats on sales, stock movements, and customer activity.",
  },
  {
    icon: "🏢",
    title: "Multi-Tenant",
    desc: "Each business gets its own isolated workspace with role-based access.",
  },
  {
    icon: "🔒",
    title: "Role-Based Access",
    desc: "Assign Sales, Warehouse, Accounts, or Admin roles to your team.",
  },
];

const steps = [
  { step: "1", title: "Register your business", desc: "Create your account with business details in under a minute." },
  { step: "2", title: "Add your team", desc: "Invite employees and assign roles — Sales, Warehouse, Accounts." },
  { step: "3", title: "Add products & customers", desc: "Set up your product catalog and import your customer list." },
  { step: "4", title: "Start operations", desc: "Create challans, manage stock, and track follow-ups from one place." },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Nav */}
      <header className="home-nav">
        <div className="home-nav-brand">
          <div className="logo-box">F</div>
          <span>FundOps ERP</span>
        </div>
        <div className="home-nav-actions">
          <Link to="/login" className="secondary-button home-nav-btn">Sign In</Link>
          <Link to="/register" className="primary-button home-nav-btn">Get Started Free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="hero-eyebrow">All-in-one Business ERP</div>
          <h1>Run your business operations from one place</h1>
          <p>
            Manage customers, inventory, sales challans, and your team — all in a single
            multi-tenant platform built for growing businesses.
          </p>
          <div className="home-hero-ctas">
            <Link to="/register" className="primary-button">Register Your Business</Link>
            <Link to="/login" className="secondary-button">Sign In →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-section">
        <h2 className="home-section-title">Everything you need to operate</h2>
        <div className="home-features-grid">
          {features.map((f) => (
            <div key={f.title} className="home-feature-card">
              <div className="home-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="home-section home-section-alt">
        <h2 className="home-section-title">How it works</h2>
        <div className="home-steps">
          {steps.map((s) => (
            <div key={s.step} className="home-step">
              <div className="home-step-num">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section">
        <h2>Ready to get started?</h2>
        <p>Register your business for free and be up and running in minutes.</p>
        <Link to="/register" className="primary-button">Create Your Account</Link>
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} FundOps ERP · <Link to="/login">Sign In</Link></p>
      </footer>
    </div>
  );
}
