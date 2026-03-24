import React from 'react';
import '../../styles/StylesLayout/Footer.css';
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <span className="footer-text">
        <span className="footer-text">
        © {currentYear} Hermanos Vega · All rights reserved · v23.0</span>
      </span>
    </footer>
  );
}