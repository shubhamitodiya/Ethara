import React from 'react';
import { Plus, Check, X, Trash2 } from 'lucide-react';

export default function Orders({
  orders,
  orderFilter,
  setOrderFilter,
  showOrderModal,
  setShowOrderModal,
  orderForm,
  setOrderForm,
  currentItem,
  setCurrentItem,
  customers,
  products,
  handleAddOrderItem,
  handleRemoveOrderItem,
  handlePlaceOrder,
  handleStatusChange,
  actionLoading
}) {
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Registry</h1>
          <p className="page-subtitle">Record purchases, decrement inventory, and manage statuses.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setOrderForm({ customer_id: '', items: [] });
            setCurrentItem({ product_id: '', quantity: 1 });
            setShowOrderModal(true);
          }}
        >
          <Plus size={16} /> Place New Order
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
              <button
                key={status}
                className={`btn ${orderFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                onClick={() => setOrderFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products Ordered</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No orders logged.</td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.id.substring(0, 8)}...</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.customer?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {o.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.8125rem' }}>
                            {item.product?.name || 'Product'} &times; {item.quantity} (${parseFloat(item.price).toFixed(2)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${o.status === 'PENDING' ? 'warning' : o.status === 'COMPLETED' ? 'success' : 'danger'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {o.status === 'PENDING' && (
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--success)' }}
                            onClick={() => handleStatusChange(o.id, 'COMPLETED')}
                          >
                            <Check size={12} /> Ship
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      )}
                      {o.status === 'CANCELLED' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleStatusChange(o.id, 'PENDING')}
                        >
                          Re-open (Verify Stock)
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER MODAL */}
      {showOrderModal && (
        <div className="modal-overlay">
          <form className="modal-content animate-fade-in" onSubmit={handlePlaceOrder}>
            <div className="modal-header">
              <h3>Place New Order</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowOrderModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {/* Select Customer */}
              <div className="form-group">
                <label className="form-label">Purchasing Customer</label>
                <select
                  required
                  className="form-control"
                  value={orderForm.customer_id}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

              {/* Add Item Form */}
              <h4 style={{ marginBottom: '0.75rem' }}>Select Products to Order</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', alignItems: 'end' }} className="form-group">
                <div>
                  <label className="form-label">Product Name / SKU</label>
                  <select
                    className="form-control"
                    value={currentItem.product_id}
                    onChange={(e) => setCurrentItem({ ...currentItem, product_id: e.target.value })}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                        {p.name} (SKU: {p.sku}) — Stock: {p.stock_quantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                  />
                </div>
                <button type="button" className="btn btn-secondary" style={{ height: '38px' }} onClick={handleAddOrderItem}>
                  Add Item
                </button>
              </div>

              {/* Order Item List Table */}
              <div className="table-container" style={{ marginTop: '1.25rem' }}>
                <table className="table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'right' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderForm.items.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '1.5rem' }}>
                          No items added to this order checkout.
                        </td>
                      </tr>
                    ) : (
                      orderForm.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace' }}>{item.sku}</td>
                          <td>{item.name}</td>
                          <td>${parseFloat(item.price).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td style={{ fontWeight: 600 }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '0.25rem', borderRadius: '4px' }}
                              onClick={() => handleRemoveOrderItem(idx)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Invoice */}
              {orderForm.items.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}>
                  Total Amount Due: &nbsp;
                  <span style={{ color: 'var(--primary)' }}>
                    ${orderForm.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading || orderForm.items.length === 0}>
                Submit Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
