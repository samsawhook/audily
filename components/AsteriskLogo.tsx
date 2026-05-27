type Props = { className?: string };

// Six-armed asterisk — three rounded bars rotated at 0°, 60°, 120°.
export default function AsteriskLogo({ className = "h-8 w-8" }: Props) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <g transform="translate(50 50)">
        <rect x="-9" y="-46" width="18" height="92" rx="6" />
        <rect x="-9" y="-46" width="18" height="92" rx="6" transform="rotate(60)" />
        <rect x="-9" y="-46" width="18" height="92" rx="6" transform="rotate(120)" />
      </g>
    </svg>
  );
}
