import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, isSelected, onSelect }) => {
  return (
    <div 
      className={`product-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(product)}
    >
      <div className="product-image-container" style={{ backgroundColor: product.id === 'prod-001' ? '#F0EAD6' : '#3E1A00' }}>
        <span className="badge">{product.badge}</span>
        <div className="image-placeholder">
           {product.id === 'prod-001' ? '☕ Raw Beans' : '☕ Ground Coffee'}
        </div>
      </div>
      <div className="product-info">
        <div className="product-header-flex">
          <div>
            <p className="brand">{product.brand}</p>
            <h3 className="product-name">{product.name}</h3>
          </div>
          <div className="price-container">
            <span className="main-price">£{product.price.toFixed(2)}</span>
            <div className="clubcard-banner">
              <div className="clubcard-info">
                <span className="label">Clubcard Price</span>
                <span className="price">£{product.clubcardPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="description">{product.description}</p>
        <div className="rating-info">
          <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
          <span className="review-count">({product.reviewCount} reviews)</span>
        </div>
        <button 
          className={`select-btn ${isSelected ? 'btn-selected' : ''}`}
        >
          {isSelected ? (
            <span className="selected-content">
              <span>✓</span> Selected
            </span>
          ) : 'Select & Order'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
