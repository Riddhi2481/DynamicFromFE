import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm">
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white">
          <i className="bi bi-ui-checks-grid text-primary fs-4"></i>
          <span>FormBuilder<span className="text-primary">Pro</span></span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-3">
            <li className="nav-item">
              <NavLink to="/forms" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`}>
                <i className="bi bi-journal-text me-1"></i> Form Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/forms/create" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active fw-semibold' : ''}`}>
                <i className="bi bi-plus-circle me-1"></i> New Form
              </NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill">
              <i className="bi bi-cpu me-1"></i> Architecture v1.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
