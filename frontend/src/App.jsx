import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShopPage from './pages/ShopPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import Header from './components/Header.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/order/:orderId" element={<ConfirmationPage />} />
          </Routes>
        </main>
        <footer>
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-logo">tesco.</span>
              <p>© 2024 Tesco.com. All rights reserved.</p>
            </div>
            <nav className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Help Centre</a>
              <a href="#">Contact Us</a>
              <a href="#">Store Locator</a>
            </nav>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
