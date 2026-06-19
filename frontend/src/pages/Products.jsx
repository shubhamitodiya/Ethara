import React from 'react';
import { Plus, Search, Edit3, Trash2, X } from 'lucide-react';

export default function Products({
  products,
  productSearch,
  setProductSearch,
  showProductModal,
  setShowProductModal,
  editingProduct,
  setEditingProduct,
  productForm,
  setProductForm,
  handleProductSubmit,
  handleEditProduct,
  handleDeleteProduct,
  actionLoading
}) {
  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalog Inventory</h1>
          <p className="page-subtitle">Create, view, edit, and manage products and physical stock availability.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setProductForm({ sku: '', name: '', description: '', price: '', stock_quantity: '' });
            setShowProductModal(true);
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and Table */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search SKU or Product Name..."
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock Count</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No products found.</td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.sku}</td>
                    <td>
                      <div>{p.name}</div>
                      {p.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.description}</div>}
                    </td>
                    <td>${parseFloat(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity <= 0 ? 'badge-danger' : p.stock_quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.375rem' }} onClick={() => handleEditProduct(p)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.375rem' }} onClick={() => handleDeleteProduct(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay">
          <form className="modal-content animate-fade-in" onSubmit={handleProductSubmit}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Modify Product Details' : 'Register New Product'}</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowProductModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product SKU (Unique)</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. ELEC-IPHN15"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                  disabled={editingProduct ? true : false}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Apple iPhone 15"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Brief description of the product specification..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="form-control"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-control"
                    placeholder="0"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {editingProduct ? 'Save Changes' : 'Register Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
