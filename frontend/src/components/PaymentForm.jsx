import React, { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ product, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value).substring(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/[^0-9/]/g, '').substring(0, 5);
      if (formattedValue.length === 2 && !formattedValue.includes('/')) {
        formattedValue += '/';
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cardholderName || formData.cardholderName.length < 2) {
      newErrors.cardholderName = 'Name must be at least 2 characters';
    }

    const rawCard = formData.cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Format MM/YY';
    } else {
      const [month, year] = formData.expiry.split('/').map(n => parseInt(n));
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Card expired';
      }
    }

    if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <section className="payment-panel">
      <div className="payment-card">
        <div className="payment-header">
          <svg className="payment-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          <h2 className="title">Secure Payment Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label>CARDHOLDER NAME</label>
            <input 
              type="text" 
              name="cardholderName"
              placeholder="J. Smith"
              value={formData.cardholderName}
              onChange={handleInputChange}
            />
            {errors.cardholderName && <span className="error">{errors.cardholderName}</span>}
          </div>

          <div className="form-group">
            <label>CARD NUMBER</label>
            <div className="card-input-wrapper">
              <input 
                type="text" 
                name="cardNumber"
                placeholder="•••• •••• •••• ••••"
                value={formData.cardNumber}
                onChange={handleInputChange}
              />
              <div className="card-icons">
                 <span className="card-placeholder"></span>
                 <span className="card-placeholder"></span>
              </div>
            </div>
            {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
          </div>

          <div className="form-group">
            <label>EXPIRY DATE</label>
            <input 
              type="text" 
              name="expiry"
              placeholder="MM / YY"
              value={formData.expiry}
              onChange={handleInputChange}
            />
            {errors.expiry && <span className="error">{errors.expiry}</span>}
          </div>
          <div className="form-group">
            <label>CVV CODE</label>
            <input 
              type="password" 
              name="cvv"
              placeholder="•••"
              value={formData.cvv}
              onChange={handleInputChange}
            />
            {errors.cvv && <span className="error">{errors.cvv}</span>}
          </div>

          <div className="footer-actions">
            <div className="total-pay-box">
              <span className="total-label">Total to pay</span>
              <span className="total-amount">£{product?.clubcardPrice.toFixed(2)}</span>
            </div>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>

          <p className="agreement text-center">
            Your transaction is protected with 256-bit SSL encryption
          </p>
        </form>
      </div>
    </section>
  );
};

export default PaymentForm;
