import React from 'react';
import Header from '../components/customer/Header';
import Navbar from '../components/customer/Navbar';
import Footer from '../components/customer/Footer';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  return (
    <div className="customer-layout">
      <Header />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
