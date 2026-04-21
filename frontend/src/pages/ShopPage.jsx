import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import PaymentForm from '../components/PaymentForm.jsx';
import { placeOrder } from '../services/api.js';
import './ShopPage.css';

const PRODUCTS = [
  {
    id: "prod-001",
    name: "Arabica Raw Coffee Beans 1kg",
    brand: "Tesco Coffee Co.",
    description: "Unroasted green arabica beans. Bright, grassy flavour with full aroma. Perfect for home roasting.",
    price: 100.00,
    clubcardPrice: 88.00,
    badge: "NEW",
    rating: 4.2,
    reviewCount: 148
  },
  {
    id: "prod-002",
    name: "Arabica Ground Coffee Powder 1kg",
    brand: "Tesco Coffee Co.",
    description: "Finely ground 100% arabica. Rich, smooth espresso with dark chocolate notes. Ready to brew.",
    price: 100.00,
    clubcardPrice: 88.00,
    badge: "POPULAR",
    rating: 4.8,
    reviewCount: 312
  }
];

const ShopPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const paymentRef = useRef(null);
  const navigate = useNavigate();

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      paymentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePaymentSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amount: selectedProduct.price,
      cardholderName: formData.cardholderName,
      cardNumber: formData.cardNumber,
      expiry: formData.expiry,
      cvv: formData.cvv,
      cardLast4: formData.cardNumber.replace(/\s+/g, '').slice(-4)
    };

    try {
      const response = await placeOrder(payload);
      
      // Store info for confirmation page
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        orderId: response.orderId,
        cardLast4: payload.cardLast4,
        productName: payload.productName,
        amount: payload.amount
      }));

      navigate(`/order/${response.orderId}`);
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shop-page max-w-7xl">
      <nav className="breadcrumb">
        <span>Home</span> › <span>Drinks</span> › <span>Coffee & Tea</span> › <span className="current">Coffee Beans</span>
      </nav>

      <div className="page-header">
        <h1>Select your preference</h1>
        <p>Exclusive Clubcard prices applied to your selection.</p>
      </div>

      <div className="product-grid">
        {PRODUCTS.map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            isSelected={selectedProduct?.id === product.id}
            onSelect={handleSelectProduct}
          />
        ))}
      </div>

      <div 
        ref={paymentRef}
        className={`payment-section ${selectedProduct ? 'visible' : ''}`}
      >
        {formError && <div className="global-error">{formError}</div>}
        <PaymentForm 
          product={selectedProduct}
          isSubmitting={isSubmitting}
          onSubmit={handlePaymentSubmit}
        />
      </div>
    </div>
  );
};

export default ShopPage;
