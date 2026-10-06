import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 container-fluid py-4 px-4">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
