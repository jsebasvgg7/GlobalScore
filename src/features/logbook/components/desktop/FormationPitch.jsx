const GOALKEEPER_Y = 90;
const FIRST_LINE_Y = 72;
const LAST_LINE_Y = 16;

function buildPoints(formation) {
  const lines = String(formation)
    .split('-')
    .map(Number)
    .filter((count) => count > 0);
  const step = lines.length > 1 ? (FIRST_LINE_Y - LAST_LINE_Y) / (lines.length - 1) : 0;
  const points = [{ x: 50, y: GOALKEEPER_Y }];

  lines.forEach((count, index) => {
    const y = FIRST_LINE_Y - index * step;
    for (let slot = 1; slot <= count; slot += 1) {
      points.push({ x: (slot * 100) / (count + 1), y });
    }
  });

  return points;
}

export default function FormationPitch({ formation }) {
  const points = buildPoints(formation);

  return (
    <svg
      className="lgd-pitch"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Formación ${formation}`}
    >
      <rect className="lgd-pitch__line" x="4" y="4" width="92" height="92" />
      <line className="lgd-pitch__line" x1="4" y1="50" x2="96" y2="50" />
      <circle className="lgd-pitch__line" cx="50" cy="50" r="9" />
      <rect className="lgd-pitch__line" x="30" y="4" width="40" height="14" />
      <rect className="lgd-pitch__line" x="30" y="82" width="40" height="14" />
      {points.map((point, index) => (
        <circle key={index} className="lgd-pitch__dot" cx={point.x} cy={point.y} r="3.2" />
      ))}
    </svg>
  );
}
