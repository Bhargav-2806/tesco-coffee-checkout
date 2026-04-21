import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="site-header">
      <div className="promo-banner">
        FREE DELIVERY ON YOUR FIRST COFFEE ORDER OVER £25 WITH CLUBCARD
      </div>
      <div className="main-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo-wrapper">
              <div className="logo">TESCO</div>
            </div>
            <span className="brand-tagline">Coffee Co. Checkout</span>
            <nav className="nav-links">
              <a href="#" className="active">Groceries</a>
              <a href="#">F&F Clothing</a>
              <a href="#">Clubcard</a>
              <a href="#">Offers</a>
              <a href="#">Recipes</a>
            </nav>
          </div>
          <div className="nav-right">
            <div className="search-bar">
              <input type="text" placeholder="Search" />
              <button size="small">
                <span className="search-icon">🔍</span>
              </button>
            </div>
            <div className="user-actions">
              <button className="icon-btn">👤</button>
              <button className="icon-btn">🧺</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
