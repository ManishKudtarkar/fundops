function Customers() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer relationships and follow-ups.</p>
        </div>

        <button className="primary-button">
          + Add Customer
        </button>
      </div>

      <div className="empty-page">
        <h2>Customer Management</h2>
        <p>Customer data will be connected to the API next.</p>
      </div>
    </div>
  );
}

export default Customers;