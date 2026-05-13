function MobileAwards({ awards, onAwardUpdate }) {
  return (
    <div className="mwc-body">
      <div className="mwc-sec-hdr">
        <div className="mwc-sec-dot" />
        <span className="mwc-sec-title">PREMIOS INDIVIDUALES · 2026</span>
      </div>

      <div className="mwc-awards">
        {AWARDS_CFG.map(cfg => (
          <div key={cfg.key} className="mwc-award-card">
            {/* Header con icono lateral brutalista */}
            <div className="mwc-award-hdr">
              <div className={`mwc-award-icon mwc-award-icon--${cfg.iconVariant}`}>
                <AwardIconEl variant={cfg.iconVariant} size={20} />
              </div>
              <div className="mwc-award-info">
                <span className="mwc-award-name">{cfg.label}</span>
                <span className="mwc-award-cat">{cfg.category}</span>
              </div>
            </div>

            {/* Campo de predicción con etiqueta brutalista */}
            <div className="mwc-award-input-wrap">
              <div className="mwc-award-input-lbl">
                <Award size={9} />
                TU PREDICCIÓN
              </div>
              <input
                type="text"
                className="mwc-award-input"
                value={awards[cfg.key] || ''}
                onChange={e => onAwardUpdate(cfg.key, e.target.value)}
                placeholder={cfg.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}