import { Users2, Shield, Trophy } from "lucide-react";
import "../../styles/StylesHistory/HistorySectionNav.css";

const SECTIONS = [
  { key: "players", label: "Jugadores", icon: Users2 },
  { key: "teams", label: "Equipos", icon: Shield },
  { key: "competitions", label: "Competiciones", icon: Trophy },
];

export default function HistorySectionNav({ active, onChange }) {
  return (
    <nav className="hsn-root">
      <div className="hsn-inner">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`hsn-btn ${active === key ? "hsn-btn--active" : ""}`}
            onClick={() => onChange(key)}
          >
            <Icon size={13} strokeWidth={active === key ? 2.2 : 1.8} />
            <span>{label}</span>
            {active === key && <span className="hsn-indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
}