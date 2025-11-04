import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/customer/Home';
import './App.css';

const AdminDashboard = () => <div>Chào mừng Admin!</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Customer routes with layout */}
        <Route path="/" element={
          <CustomerLayout>
            <Home />
          </CustomerLayout>
        } />
        
        <Route path="/categories" element={
          <CustomerLayout>
            <div>All Categories Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/categories/:category" element={
          <CustomerLayout>
            <div>Category Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/deals" element={
          <CustomerLayout>
            <div>Discount Deals Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/sell" element={
          <CustomerLayout>
            <div>Sell Your Books Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/gifts" element={
          <CustomerLayout>
            <div>Gifts & Others Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/events" element={
          <CustomerLayout>
            <div>Events Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/about" element={
          <CustomerLayout>
            <div>About Bookworm Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/wishlist" element={
          <CustomerLayout>
            <div>Wishlist Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/cart" element={
          <CustomerLayout>
            <div>Shopping Cart Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/account" element={
          <CustomerLayout>
            <div>User Account Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/search" element={
          <CustomerLayout>
            <div>Search Results Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/products" element={
          <CustomerLayout>
            <div>All Products Page</div>
          </CustomerLayout>
        } />

        {/* 404 */}
        <Route path="*" element={
          <CustomerLayout>
            <div style={{textAlign: 'center', padding: '50px'}}>
              <h1>404 - Page Not Found</h1>
            </div>
          </CustomerLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
