import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CartProvider } from './contexts/CartContext';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/products/AdminProductManagement';
import AddProduct from './pages/admin/products/AddProduct';
import EditProduct from './pages/admin/products/EditProduct';
import AdminCategoryManagement from './pages/admin/categories/AdminCategoryManagement';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/customer/home/Home';
import Cart from './pages/customer/cart/Cart';
import Orders from './pages/customer/orders/Orders';
import SellBooks from './pages/customer/sell/SellBooks';
import Membership from './pages/customer/membership/Membership';
import ShippingInfo from './pages/customer/policy/ShippingInfo';
import About from './pages/customer/about/About';
import Blog from './pages/customer/blog/Blog';
import Charity from './pages/customer/charity/Charity';
import Press from './pages/customer/press/Press';
import Ordering from './pages/customer/policy/Ordering';
import PurchaseGuideline from './pages/customer/policy/PurchaseGuideline';
import ConditionGuideline from './pages/customer/policy/ConditionGuideline';
import BillingPayment from './pages/customer/policy/BillingPayment';
import ShippingPolicy from './pages/customer/policy/ShippingPolicy';
import ReturnPolicy from './pages/customer/policy/ReturnPolicy';
import Faqs from './pages/customer/faqs/Faqs';
import VNPayReturn from './pages/customer/VNPayReturn';
import PaymentReturn from './pages/customer/payment/PaymentReturn';
import antdTheme from './config/antdTheme';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <CartProvider>
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
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="categories" element={<AdminCategoryManagement />} />
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
            <About />
          </CustomerLayout>
        } />

        <Route path="/blog" element={
          <CustomerLayout>
            <Blog />
          </CustomerLayout>
        } />

        <Route path="/charity" element={
          <CustomerLayout>
            <Charity />
          </CustomerLayout>
        } />

        <Route path="/press" element={
          <CustomerLayout>
            <Press />
          </CustomerLayout>
        } />

        <Route path="/ordering" element={
          <CustomerLayout>
            <Ordering />
          </CustomerLayout>
        } />

        <Route path="/purchase-guideline" element={
          <CustomerLayout>
            <PurchaseGuideline />
          </CustomerLayout>
        } />

        <Route path="/condition-guideline" element={
          <CustomerLayout>
            <ConditionGuideline />
          </CustomerLayout>
        } />

        <Route path="/billing-payment" element={
          <CustomerLayout>
            <BillingPayment />
          </CustomerLayout>
        } />

        <Route path="/shipping-policy" element={
          <CustomerLayout>
            <ShippingPolicy />
          </CustomerLayout>
        } />

        <Route path="/return-policy" element={
          <CustomerLayout>
            <ReturnPolicy />
          </CustomerLayout>
        } />

        <Route path="/faqs" element={
          <CustomerLayout>
            <Faqs />
          </CustomerLayout>
        } />
        
        <Route path="/wishlist" element={
          <CustomerLayout>
            <div>Wishlist Page</div>
          </CustomerLayout>
        } />
        
        <Route path="/cart" element={
          <CustomerLayout>
            <Cart />
          </CustomerLayout>
        } />
        
        <Route path="/orders" element={
          <CustomerLayout>
            <Orders />
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

        <Route path="/sell-books" element={
          <CustomerLayout>
            <SellBooks />
          </CustomerLayout>
        } />

        <Route path="/membership" element={
          <CustomerLayout>
            <Membership />
          </CustomerLayout>
        } />

        <Route path="/shipping-info" element={
          <CustomerLayout>
            <ShippingInfo />
          </CustomerLayout>
        } />

        {/* VNPay Return (support both routes VNPay may use) */}
        <Route path="/payment-return" element={
          <CustomerLayout>
            <PaymentReturn />
          </CustomerLayout>
        } />
        <Route path="/vnpay-return" element={
          <CustomerLayout>
            <VNPayReturn />
          </CustomerLayout>
        } />
        <Route path="/payment-result" element={
          <CustomerLayout>
            <VNPayReturn />
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
    </CartProvider>
import BookDetail from './pages/customer/book/BookDetail';
import CategoryProducts from './pages/customer/book/CategoryProducts';
import Cart from './pages/customer/cart/Cart';
import Orders from './pages/customer/orders/Orders';
import PaymentReturn from './pages/customer/payment/PaymentReturn';
      <CartProvider>
        <BrowserRouter>
        <Routes>
        
        <Route path="/book/:id" element={
          <CustomerLayout>
            <BookDetail />
          </CustomerLayout>
        } />
            <Cart />
          </CustomerLayout>
        } />
        
        <Route path="/orders" element={
          <CustomerLayout>
            <Orders />
            <CategoryProducts />
        <Route path="/payment-return" element={
          <CustomerLayout>
            <PaymentReturn />
          </CustomerLayout>
        } />
    </CartProvider>
    </ConfigProvider>
  );
}

export default App;
