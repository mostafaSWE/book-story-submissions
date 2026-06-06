export default function FlagIcon({ code, label }) {
  return <span className={`flag-icon fi fi-${code}`} aria-label={label} role="img" />;
}
