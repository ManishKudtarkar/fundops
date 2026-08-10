function Products() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>Manage products, pricing and warehouse information.</p>
        </div>

        <button className="primary-button">
          + Add Product
        </button>
      </div>

      <div className="empty-page">
        <h2>Product Catalog</h2>
        <p>Product data will be connected to the API next.</p>
      </div>
    </div>
  );
}

export default Products;