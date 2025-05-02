import React from 'react';
import Slider from '../../Component/Slider/Slider';
import CartView from '../../Component/ViewCart/CartView';
import '../../styles/sellerDashboard.css';
import ChatButton from '../../Component/chat/ChatButton';

const SellerDashboard = () => {
  return (
    <div className="dashboard-container">
      <Slider />
      <div className="seller-content-wrapper">
        <h2 className="seller-heading">Seller Dashboard</h2>
        {/* ✅ Integrated FarmerProfile */}
        <FarmerProfile farmer={farmer} />
        <CartView showBuyButton={false} />
      </div>
    </div>
  );
};

export default SellerDashboard;