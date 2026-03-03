import React from 'react';
import '../../styles/StylesOthers/Footer.css';
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <span className="footer-text">
        Hermanos Vega © {currentYear}
      </span>
    </footer>
  );
}