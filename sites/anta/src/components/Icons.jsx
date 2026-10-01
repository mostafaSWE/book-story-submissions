// Inline SVG icons (same drawings as the approved prototype).
export function Nib({ className = "nib" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.5 18.5 10 12 22.5 5.5 10Z" />
      <circle cx="12" cy="10.6" r="1.7" className="nib-hole" />
      <path d="M12 12.4v10" className="nib-slit" />
    </svg>
  );
}

const line = (d, className) =>
  function Icon() {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`icon ${className}`}>
        <path d={d} />
      </svg>
    );
  };

export const BackIcon = line("M15 5l-7 7 7 7", "icon-back");
export const ForwardIcon = line("M9 5l7 7-7 7", "icon-forward");
export const PauseIcon = line("M9 6v12M15 6v12", "icon-pause");
export const PlayIcon = line("M8 6l10 6-10 6z", "icon-play");
export const ChevronIcon = line("M7 10l5 5 5-5", "icon-chevron");

export function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="ornament" viewBox="0 0 132 12" aria-hidden="true" focusable="false">
      <path d="M0 6h52M80 6h52" className="ornament-rule" />
      <path d="M66 0.5 72 6 66 11.5 60 6Z" className="ornament-nib" />
    </svg>
  );
}
