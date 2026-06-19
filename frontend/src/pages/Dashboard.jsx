import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, RotateCcw } from 'lucide-react';

export default function Dashboard({ products, customers, orders, lowStockProducts, fetchData, actionLoading }) {
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time inventory levels, orders, and total statistics.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={actionLoading}>
          <RotateCcw size={16} /> Refresh
        </button>
      </div>

      {/* Stat Grid */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Catalog SKU</span>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-icon"><Package size={20} /></div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Customers</span>
            <div className="stat-value">{customers.length}</div>
          </div>
          <div className="stat-icon"><Users size={20} /></div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Revenue</span>
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>
            <DollarSign size={20} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Low Stock SKUs</span>
            <div className="stat-value" style={{ color: lowStockProducts.length > 0 ? 'var(--danger)' : 'inherit' }}>
              {lowStockProducts.length}
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-glow)', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Grid segments */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} /> Recent Order Log
          </h3>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>No orders registered yet.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Placed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td>{o.customer?.name || 'Unknown'}</td>
                      <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${o.status === 'PENDING' ? 'warning' : o.status === 'COMPLETED' ? 'success' : 'danger'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={18} /> Low Stock Warnings (&le; 5)
          </h3>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--success)', fontStyle: 'italic', padding: '1rem 0' }}>All product items are safely stocked!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockProducts.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {p.sku}</div>
                  </div>
                  <span className="badge badge-danger">{p.stock_quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
