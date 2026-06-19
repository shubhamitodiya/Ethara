import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import { productService, customerService, orderService } from './services/apiService';

export default function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Global Notifications
  const [notification, setNotification] = useState(null);

  // Search/Filter states passed to pages
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');

  // Modals & Form states passed to pages
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ sku: '', name: '', description: '', price: '', stock_quantity: '' });

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '' });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_id: '', items: [] });
  const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1 });

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Fetch all data using modular service layer
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, custRes, ordRes, lowRes] = await Promise.all([
        productService.getAll(),
        customerService.getAll(),
        orderService.getAll(),
        productService.getLowStock(5)
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setOrders(ordRes.data);
      setLowStockProducts(lowRes.data);
    } catch (err) {
      showNotice('error', 'Failed to retrieve data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- PRODUCT SUBMIT ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        sku: productForm.sku,
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity)
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        showNotice('success', `Product "${payload.name}" updated successfully.`);
      } else {
        await productService.create(payload);
        showNotice('success', `Product "${payload.name}" created successfully.`);
      }
      setShowProductModal(false);
      setProductForm({ sku: '', name: '', description: '', price: '', stock_quantity: '' });
      setEditingProduct(null);
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error saving product.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      sku: prod.sku,
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      stock_quantity: prod.stock_quantity
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setActionLoading(true);
    try {
      await productService.delete(id);
      showNotice('success', 'Product deleted successfully.');
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error deleting product.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  // --- CUSTOMER SUBMIT ---
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone || null,
        address: customerForm.address || null
      };

      if (editingCustomer) {
        await customerService.update(editingCustomer.id, payload);
        showNotice('success', `Customer "${payload.name}" updated.`);
      } else {
        await customerService.create(payload);
        showNotice('success', `Customer "${payload.name}" registered.`);
      }
      setShowCustomerModal(false);
      setCustomerForm({ name: '', email: '', phone: '', address: '' });
      setEditingCustomer(null);
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error saving customer.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name,
      email: cust.email,
      phone: cust.phone || '',
      address: cust.address || ''
    });
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    setActionLoading(true);
    try {
      await customerService.delete(id);
      showNotice('success', 'Customer record deleted.');
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error deleting customer.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  // --- ORDER HANDLING ---
  const handleAddOrderItem = () => {
    if (!currentItem.product_id) return;
    const selectedProd = products.find(p => p.id === currentItem.product_id);
    if (!selectedProd) return;

    if (currentItem.quantity <= 0) {
      showNotice('error', 'Quantity must be at least 1.');
      return;
    }

    if (selectedProd.stock_quantity < currentItem.quantity) {
      showNotice('error', `Insufficient stock. Only ${selectedProd.stock_quantity} units available.`);
      return;
    }

    const existingIndex = orderForm.items.findIndex(item => item.product_id === currentItem.product_id);
    let updatedItems = [...orderForm.items];

    if (existingIndex > -1) {
      const newQty = updatedItems[existingIndex].quantity + parseInt(currentItem.quantity);
      if (selectedProd.stock_quantity < newQty) {
        showNotice('error', `Insufficient stock. Cannot add more. Total stock is ${selectedProd.stock_quantity}.`);
        return;
      }
      updatedItems[existingIndex].quantity = newQty;
    } else {
      updatedItems.push({
        product_id: currentItem.product_id,
        quantity: parseInt(currentItem.quantity),
        name: selectedProd.name,
        sku: selectedProd.sku,
        price: selectedProd.price
      });
    }

    setOrderForm({ ...orderForm, items: updatedItems });
    setCurrentItem({ product_id: '', quantity: 1 });
  };

  const handleRemoveOrderItem = (index) => {
    const updatedItems = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items: updatedItems });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.customer_id) {
      showNotice('error', 'Please select a customer.');
      return;
    }
    if (orderForm.items.length === 0) {
      showNotice('error', 'Please add at least one product.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        customer_id: orderForm.customer_id,
        items: orderForm.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      await orderService.create(payload);
      showNotice('success', 'Order created successfully! Stock updated.');
      setShowOrderModal(false);
      setOrderForm({ customer_id: '', items: [] });
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error creating order.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await orderService.updateStatus(orderId, newStatus);
      showNotice('success', `Order status updated to ${newStatus}.`);
      await fetchData();
    } catch (err) {
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Error changing status.';
      showNotice('error', detail);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Routed Area */}
      <main className="main-content">
        {/* Floating Notification */}
        {notification && (
          <div
            className={`alert alert-${notification.type === 'error' ? 'danger' : 'warning'}`}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 1000,
              minWidth: '300px',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.2s ease',
              borderLeft: `4px solid ${notification.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            {notification.type === 'error' ? (
              <AlertTriangle size={18} className="badge-danger" />
            ) : (
              <Check size={18} style={{ color: 'var(--success)' }} />
            )}
            <div>{notification.message}</div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading system state...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    products={products}
                    customers={customers}
                    orders={orders}
                    lowStockProducts={lowStockProducts}
                    fetchData={fetchData}
                    actionLoading={actionLoading}
                  />
                }
              />
              <Route
                path="/products"
                element={
                  <Products
                    products={products}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    showProductModal={showProductModal}
                    setShowProductModal={setShowProductModal}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    productForm={productForm}
                    setProductForm={setProductForm}
                    handleProductSubmit={handleProductSubmit}
                    handleEditProduct={handleEditProduct}
                    handleDeleteProduct={handleDeleteProduct}
                    actionLoading={actionLoading}
                  />
                }
              />
              <Route
                path="/customers"
                element={
                  <Customers
                    customers={customers}
                    customerSearch={customerSearch}
                    setCustomerSearch={setCustomerSearch}
                    showCustomerModal={showCustomerModal}
                    setShowCustomerModal={setShowCustomerModal}
                    editingCustomer={editingCustomer}
                    setEditingCustomer={setEditingCustomer}
                    customerForm={customerForm}
                    setCustomerForm={setCustomerForm}
                    handleCustomerSubmit={handleCustomerSubmit}
                    handleEditCustomer={handleEditCustomer}
                    handleDeleteCustomer={handleDeleteCustomer}
                    actionLoading={actionLoading}
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <Orders
                    orders={orders}
                    orderFilter={orderFilter}
                    setOrderFilter={setOrderFilter}
                    showOrderModal={showOrderModal}
                    setShowOrderModal={setShowOrderModal}
                    orderForm={orderForm}
                    setOrderForm={setOrderForm}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                    customers={customers}
                    products={products}
                    handleAddOrderItem={handleAddOrderItem}
                    handleRemoveOrderItem={handleRemoveOrderItem}
                    handlePlaceOrder={handlePlaceOrder}
                    handleStatusChange={handleStatusChange}
                    actionLoading={actionLoading}
                  />
                }
              />
            </Routes>
          </div>
        )}
      </main>
    </div>
  );
}
