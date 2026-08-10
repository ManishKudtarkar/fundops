function Inventory() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Inventory</h1>
          <p>Monitor stock levels and stock movements.</p>
        </div>

        <button className="primary-button">
          + Stock Movement
        </button>
      </div>

      <div className="empty-page">
        <h2>Inventory Management</h2>
        <p>Inventory data will be connected to the API next.</p>
      </div>
    </div>
  );
}

export default Inventory;