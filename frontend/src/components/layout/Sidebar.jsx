import React from 'react';
import { NavLink } from 'react-router-dom';
import { Package, Users, ShoppingCart, TrendingUp, Layers } from 'lucide-react';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <Layers size={24} />
        <span>Ethara Panel</span>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <TrendingUp size={18} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} />
            <span>Products</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Customers</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>
        </li>
      </ul>
      <div style={{ marginTop: 'auto', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        v1.0.0 Routed Dev Mode
      </div>
    </nav>
  );
}
