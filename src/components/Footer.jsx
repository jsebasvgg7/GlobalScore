import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <span style={styles.text}>
        Hermanos Vega © {currentYear}
      </span>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'linear-gradient(135deg, #1e202c 0%, #31323e 100%)',
    borderTop: '1px solid rgba(96, 81, 155, 0.2)',
    padding: '12px 18px',
    width: '100%',
    textAlign: 'center',
    flexShrink: 0,
  },
  text: {
    color: '#bfc0d1',
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.3px',
  },
};

// Agregar estilos responsive
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Ajustar padding-bottom de las páginas en móvil */
  @media (max-width: 768px) {
    .page-container,
    .vega-score-page,
    .vega-root,
    .ranking-page,
    .admin-page,
    .profile-page,
    .notifications-page,
    .stats-page,
    .profile-container,
    .ranking-container,
    .admin-container {
      padding-bottom: 20px !important;
      min-height: auto !important;
    }
    
    .matches-container,
    .ranking-list-premium,
    .admin-content,
    .profile-bottom-section,
    .history-card,
    .notifications-list {
      padding-bottom: 20px !important;
    }
    
    footer {
      padding: 10px 12px !important;
      margin-bottom: 70px !important;
      margin-top: 0 !important;
    }
    
    footer span {
      font-size: 11px !important;
    }
  }
  
  @media (max-width: 480px) {
    .page-container,
    .vega-score-page,
    .vega-root,
    .ranking-page,
    .admin-page,
    .profile-page,
    .notifications-page,
    .stats-page,
    .profile-container,
    .ranking-container,
    .admin-container {
      padding-bottom: 15px !important;
    }
    
    .matches-container,
    .ranking-list-premium,
    .admin-content,
    .profile-bottom-section,
    .history-card,
    .notifications-list {
      padding-bottom: 15px !important;
    }
    
    footer {
      padding: 8px 10px !important;
      margin-bottom: 65px !important;
    }
    
    footer span {
      font-size: 10px !important;
    }
  }
`;
document.head.appendChild(styleSheet);