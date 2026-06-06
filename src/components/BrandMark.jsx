export default function BrandMark({ size = 46 }) {
  return (
    <span className="brand-mark" style={{ "--mark-size": `${size}px` }} aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img" focusable="false">
        <defs>
          <linearGradient id="brandMarkGold" x1="14" x2="50" y1="10" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff0b8" />
            <stop offset="0.48" stopColor="#f5bf58" />
            <stop offset="1" stopColor="#a96d1b" />
          </linearGradient>
          <radialGradient id="brandMarkGlow" cx="50%" cy="42%" r="56%">
            <stop stopColor="#ffe5a4" stopOpacity="0.85" />
            <stop offset="1" stopColor="#f2bc5c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="31" fill="rgba(255, 196, 86, 0.07)" stroke="rgba(255, 211, 123, 0.52)" />
        <circle cx="32" cy="30" r="22" fill="url(#brandMarkGlow)" />
        <path
          d="M15 20.5c8.6-3.7 14.8-2.2 17 2.1 2.2-4.3 8.4-5.8 17-2.1v26.3c-8.2-3.4-14.2-2.5-17 2.6-2.8-5.1-8.8-6-17-2.6V20.5Z"
          fill="rgba(5, 15, 27, 0.92)"
          stroke="url(#brandMarkGold)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M32 22.5v26.2" stroke="rgba(255, 224, 154, 0.78)" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M21 26.4c3.2-.8 5.7-.4 7.5 1.2M21 32.1c3.2-.8 5.7-.4 7.5 1.2M43 26.4c-3.2-.8-5.7-.4-7.5 1.2M43 32.1c-3.2-.8-5.7-.4-7.5 1.2"
          stroke="rgba(255, 218, 139, 0.54)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M24 15.5c3.3-4.4 12.6-4.4 16 0M20 11.8c-1.8 1.8-2 4.1-.5 6.4M44 11.8c1.8 1.8 2 4.1.5 6.4"
          stroke="url(#brandMarkGold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="14" r="2.4" fill="#ffe2a1" />
      </svg>
    </span>
  );
}
