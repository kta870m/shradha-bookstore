import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/products/AdminProductManagement';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/customer/Home';
import antdTheme from './config/antdTheme';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<div>Dashboard Home</div>} />
          <Route path="dashboard" element={<div>Dashboard Home</div>} />
          <Route path="products" element={<AdminProductManagement />} />
          <Route path="categories" element={<div>Categories Management</div>} />
          <Route path="orders" element={<div>Orders Management</div>} />
          <Route path="customers" element={<div>Customers Management</div>} />
          <Route path="reviews" element={<div>Reviews Management</div>} />
          <Route path="feedback" element={<div>Feedback Management</div>} />
        </Route>

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
    </ConfigProvider>
  );
}

export default App;
