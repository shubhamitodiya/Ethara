import React from 'react';
import { Plus, Search, Edit3, Trash2, X } from 'lucide-react';

export default function Customers({
  customers,
  customerSearch,
  setCustomerSearch,
  showCustomerModal,
  setShowCustomerModal,
  editingCustomer,
  setEditingCustomer,
  customerForm,
  setCustomerForm,
  handleCustomerSubmit,
  handleEditCustomer,
  handleDeleteCustomer,
  actionLoading
}) {
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Database</h1>
          <p className="page-subtitle">Manage customer profiles and review registration dates.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingCustomer(null);
            setCustomerForm({ name: '', email: '', phone: '', address: '' });
            setShowCustomerModal(true);
          }}
        >
          <Plus size={16} /> Register Customer
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search Customers by Name or Email..."
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No customer profiles found.</td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.375rem' }} onClick={() => handleEditCustomer(c)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.375rem' }} onClick={() => handleDeleteCustomer(c.id)}>
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

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <form className="modal-content animate-fade-in" onSubmit={handleCustomerSubmit}>
            <div className="modal-header">
              <h3>{editingCustomer ? 'Update Customer Profile' : 'Register Customer Profile'}</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setShowCustomerModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="John Doe"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address (Unique)</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="john.doe@example.com"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  disabled={editingCustomer ? true : false}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1234567890"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address (Optional)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="123 Main St, City, Country"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {editingCustomer ? 'Save Details' : 'Register Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
