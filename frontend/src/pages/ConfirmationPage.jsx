import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderStatus } from '../services/api.js';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('PENDING'); // PENDING, APPROVED, DECLINED, ERROR
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Read stored info
    const stored = sessionStorage.getItem('pendingOrder');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.orderId === orderId) {
        setOrderInfo(parsed);
      }
    }

    const pollStatus = async () => {
      try {
        const data = await getOrderStatus(orderId);
        if (data.status === 'APPROVED' || data.status === 'DECLINED') {
          setStatus(data.status);
          return true; // Stop polling
        }
        return false; // Continue polling
      } catch (err) {
        console.error("Polling error:", err);
        setErrorCount(prev => prev + 1);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Initial check
    pollStatus();

    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (errorCount >= 10) {
      setStatus('ERROR');
    }
  }, [errorCount]);

  const handleGoBack = () => {
    navigate('/');
  };

  if (status === 'PENDING') {
    return (
      <div className="confirmation-container">
        <div className="status-card loading">
          <div className="spinner"></div>
          <h2>Processing your payment...</h2>
          <p>Please do not refresh this page.</p>
        </div>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="confirmation-container">
        <div className="status-card declined">
          <div className="icon error-icon">✕</div>
          <h2>Status check failed</h2>
          <p>We're having trouble reaching our servers. Your order status might be updated later.</p>
          <button onClick={handleGoBack} className="back-btn">Try again</button>
        </div>
      </div>
    );
  }

  if (status === 'DECLINED') {
    return (
      <div className="confirmation-container">
        <div className="status-card declined">
          <div className="icon error-icon">✕</div>
          <h2>Payment declined</h2>
          <p className="subtext">Your card was not charged. Please check your details.</p>
          <button onClick={handleGoBack} className="back-btn">Try again</button>
          <a href="#" className="support-link">Contact support</a>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="status-card success">
        <div className="icon success-icon">✓</div>
        <h2>Order confirmed!</h2>
        <p className="intro-text">
          Thank you for shopping with Tesco. Your artisan coffee is being carefully prepared by our baristas.
        </p>

        <div className="summary-table">
          <div className="table-row">
            <span className="label">Order ID</span>
            <span className="value">#{orderId}</span>
          </div>
          <div className="table-row">
            <span className="label">Product</span>
            <span className="value text-right">{orderInfo?.productName}</span>
          </div>
          <div className="table-row">
            <span className="label">Quantity</span>
            <span className="value">1 Bag</span>
          </div>
          <div className="table-row">
            <span className="label">Payment</span>
            <span className="value card-val">
               💳 Visa •••• {orderInfo?.cardLast4}
            </span>
          </div>
          <div className="table-row">
            <span className="label">Status</span>
            <span className="status-badge">APPROVED</span>
          </div>
          <div className="table-divider"></div>
          <div className="table-row total-row">
            <span className="label-total">Total</span>
            <span className="value-total">£{orderInfo?.amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="delivery-box">
          <span className="delivery-icon">🚚</span>
          <div className="delivery-text">
            <span className="delivery-label">DELIVERY SCHEDULE</span>
            <span className="delivery-est">Estimated delivery: Tomorrow, 9am–1pm</span>
          </div>
        </div>

        <button onClick={handleGoBack} className="continue-btn">
          Continue shopping →
        </button>

        <div className="help-footer">
          <a href="#">Need help with your order?</a>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
