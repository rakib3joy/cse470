import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Navigation from './Component/Navigation/Navigation';
import Footer from './Component/Footer/Footer';
import Checkout from './Component/Checkout/Checkout';
import LandingPage from './pages/LandingPage';
import BuyerDashboard from './dashboards/buyer/BuyerDashboard';
import SellerDashboard from './dashboards/seller/SellerDashboard';
import AdminDashboard from './dashboards/admin/AdminDashboard';
import AddToCart from './Component/AddToCart/AddToCart';
import AddProductPage from './pages/AddProductPage'; // ✅ Newly added
// New Chat components
import ChatList from './Component/chat/ChatList';
import ChatDetail from './Component/chat/ChatDetail';

// // Context provider
// import { AuthProvider } from './context/ChatContext';
import { ChatProvider } from './context/ChatContext';



function AppContent() {
  const [cart, setCart] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const increaseQty = (id) => {
    const item = cart.find(p => p._id === id);
    if (item) setCart(prev => [...prev, item]);
  };

  const decreaseQty = (id) => {
    const index = cart.findIndex(p => p._id === id);
    if (index !== -1) {
      const updatedCart = [...cart];
      updatedCart.splice(index, 1);
      setCart(updatedCart);
    }
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(p => p._id !== id));
  };

  const hideNavAndFooter = location.pathname === '/';

  return (
    <div className="App">
      {!hideNavAndFooter && <Navigation userRole={userRole} cartLength={cart.length} />}

      <Routes>
        <Route path="/" element={<LandingPage setUserRole={setUserRole} />} />
        <Route path="/buyer" element={
          <BuyerDashboard handleAddToCart={handleAddToCart} />
        } />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/addTocart" element={
          <AddToCart
            cart={cart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
          />
        } />
        <Route path="/products" element={<AddProductPage />} /> {/* ✅ New route */}
        <Route path="/checkout" element={<Checkout cartItems={cart} />} />
        {/* ✅ Chat routes */}
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:chatId" element={<ChatDetail />} />
      </Routes>

      {!hideNavAndFooter && <Footer />}
    </div>
  );
}



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;