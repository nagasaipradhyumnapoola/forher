import React from 'react';

/**
 * Hand-drawn coquette sticker kit — all inline SVG, no external assets.
 * Every piece gets a soft white "die-cut" outline so it reads like a real
 * scrapbook sticker stuck onto the page.
 */

interface SVGProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

let uid = 0;
const nextId = (p: string) => `${p}-${++uid}`;

/* ── Satin bow ─────────────────────────────────────────────────────── */
export const Bow: React.FC<SVGProps & { color?: string }> = ({ size = 64, className, style, color = '#f08cb4' }) => {
  // NOTE: prefix must not collide with the ambient background's own bow ids
  const g = nextId('stkbowg');
  const d = nextId('stkbowd');
  return (
    <svg viewBox="0 0 120 92" width={size} height={(size * 92) / 120} className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.22" stopColor={color} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <filter id={d} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#c9538a" floodOpacity="0.25" />
        </filter>
      </defs>
      <g filter={`url(#${d})`} stroke="#fff" strokeWidth="3" strokeLinejoin="round">
        {/* tails */}
        <path d="M60 46 C53 60 47 76 37 90 C51 82 57 66 60 54 Z" fill={`url(#${g})`} />
        <path d="M60 46 C67 60 73 76 83 90 C69 82 63 66 60 54 Z" fill={`url(#${g})`} />
        {/* loops */}
        <path d="M60 40 C46 12 8 6 6 34 C4 58 44 52 60 44 Z" fill={`url(#${g})`} />
        <path d="M60 40 C74 12 112 6 114 34 C116 58 76 52 60 44 Z" fill={`url(#${g})`} />
        {/* knot */}
        <ellipse cx="60" cy="43" rx="10" ry="12" fill={`url(#${g})`} />
      </g>
      {/* sheen */}
      <path d="M52 22 C34 19 18 24 15 34 C26 25 40 24 52 26 Z" fill="rgba(255,255,255,0.55)" />
      <ellipse cx="56" cy="38" rx="3" ry="4.5" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
};

/* ── Teddy bear sticker ────────────────────────────────────────────── */
export const Teddy: React.FC<SVGProps> = ({ size = 78, className, style }) => {
  const d = nextId('ted');
  return (
    <svg viewBox="0 0 100 108" width={size} height={(size * 108) / 100} className={className} style={style} aria-hidden="true">
      <defs>
        <filter id={d} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#b98aa0" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#${d})`} stroke="#fff" strokeWidth="3.5" strokeLinejoin="round">
        {/* ears */}
        <circle cx="26" cy="26" r="13" fill="#fdf4ef" />
        <circle cx="74" cy="26" r="13" fill="#fdf4ef" />
        {/* body */}
        <ellipse cx="50" cy="82" rx="27" ry="23" fill="#fdf4ef" />
        {/* arms */}
        <ellipse cx="20" cy="78" rx="10" ry="12" fill="#fdf4ef" />
        <ellipse cx="80" cy="78" rx="10" ry="12" fill="#fdf4ef" />
        {/* head */}
        <circle cx="50" cy="42" r="30" fill="#fffaf6" />
      </g>
      {/* inner ears */}
      <circle cx="26" cy="26" r="6" fill="#f6cfdc" />
      <circle cx="74" cy="26" r="6" fill="#f6cfdc" />
      {/* muzzle */}
      <ellipse cx="50" cy="52" rx="13" ry="10" fill="#f9e6e0" />
      <ellipse cx="50" cy="46" rx="4" ry="3" fill="#c98099" />
      <path d="M50 49 v4" stroke="#c98099" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 53 q-4 4 -7 1 M50 53 q4 4 7 1" stroke="#c98099" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* eyes */}
      <circle cx="38" cy="38" r="3.6" fill="#4a2a35" />
      <circle cx="62" cy="38" r="3.6" fill="#4a2a35" />
      <circle cx="39.2" cy="36.8" r="1.2" fill="#fff" />
      <circle cx="63.2" cy="36.8" r="1.2" fill="#fff" />
      {/* blush */}
      <ellipse cx="30" cy="47" rx="6" ry="4" fill="#f7b6c9" opacity="0.75" />
      <ellipse cx="70" cy="47" rx="6" ry="4" fill="#f7b6c9" opacity="0.75" />
      {/* little bow on the ear */}
      <g transform="translate(74,12) scale(0.34)">
        <path d="M60 40 C46 12 8 6 6 34 C4 58 44 52 60 44 Z" fill="#f08cb4" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
        <path d="M60 40 C74 12 112 6 114 34 C116 58 76 52 60 44 Z" fill="#f08cb4" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
        <ellipse cx="60" cy="43" rx="10" ry="12" fill="#e97ba6" stroke="#fff" strokeWidth="7" />
      </g>
    </svg>
  );
};

/* ── Sparkle / twinkle ─────────────────────────────────────────────── */
export const Sparkle: React.FC<SVGProps & { color?: string }> = ({ size = 26, className, style, color = '#f4a7c6' }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} style={style} aria-hidden="true">
    <path
      d="M20 1 C22 13 27 18 39 20 C27 22 22 27 20 39 C18 27 13 22 1 20 C13 18 18 13 20 1 Z"
      fill={color}
      stroke="#fff"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Little flower ─────────────────────────────────────────────────── */
export const Flower: React.FC<SVGProps & { color?: string }> = ({ size = 34, className, style, color = '#f7b6cf' }) => (
  <svg viewBox="0 0 44 44" width={size} height={size} className={className} style={style} aria-hidden="true">
    <g stroke="#fff" strokeWidth="2.4" strokeLinejoin="round">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="22" cy="10" rx="7" ry="9.5" fill={color} transform={`rotate(${a} 22 22)`} />
      ))}
    </g>
    <circle cx="22" cy="22" r="6" fill="#ffe08a" stroke="#fff" strokeWidth="2.2" />
  </svg>
);

/* ── Washi tape strip ──────────────────────────────────────────────── */
export const WashiTape: React.FC<{
  width?: number;
  height?: number;
  rotate?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = 96, height = 28, rotate = -8, color = 'rgba(246,170,205,0.65)', className, style }) => (
  <div
    className={className}
    aria-hidden="true"
    style={{
      width,
      height,
      transform: `rotate(${rotate}deg)`,
      background: `repeating-linear-gradient(45deg, ${color} 0 7px, rgba(255,255,255,0.32) 7px 14px)`,
      // torn/zig edges left & right
      clipPath:
        'polygon(0% 12%, 4% 0%, 8% 14%, 12% 2%, 100% 2%, 96% 16%, 100% 30%, 96% 46%, 100% 62%, 96% 78%, 100% 98%, 12% 98%, 8% 86%, 4% 100%, 0% 88%)',
      boxShadow: '0 2px 6px rgba(180,110,140,0.18)',
      opacity: 0.92,
      ...style,
    }}
  />
);

/* ── Polaroid frame ────────────────────────────────────────────────── */
export const Polaroid: React.FC<{
  caption?: string;
  rotate?: number;
  width?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ caption, rotate = -3, width = 210, children, className, style }) => (
  <div
    className={`polaroid ${className || ''}`}
    style={{ width, transform: `rotate(${rotate}deg)`, ...style }}
  >
    <div className="polaroid-photo">{children}</div>
    {caption && <div className="polaroid-caption font-script">{caption}</div>}
  </div>
);

/* ── Sealed envelope (for the "letter" moment) ─────────────────────── */
export const Envelope: React.FC<SVGProps & { open?: boolean }> = ({ size = 150, className, style, open = false }) => {
  const d = nextId('env');
  return (
    <svg viewBox="0 0 200 140" width={size} height={(size * 140) / 200} className={className} style={style} aria-hidden="true">
      <defs>
        <filter id={d} x="-20%" y="-30%" width="140%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#c9538a" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter={`url(#${d})`}>
        <rect x="8" y="26" width="184" height="108" rx="10" fill="#fde9f0" stroke="#fff" strokeWidth="3" />
        {/* letter peeking out */}
        <rect x="30" y={open ? 2 : 34} width="140" height="86" rx="6" fill="#fffdfa" stroke="#f3d3e0" strokeWidth="2" />
        <g stroke="#f0bcd2" strokeWidth="3" strokeLinecap="round">
          <path d={`M46 ${open ? 26 : 58} h108`} />
          <path d={`M46 ${open ? 40 : 72} h88`} />
          <path d={`M46 ${open ? 54 : 86} h100`} />
        </g>
        {/* body + flap */}
        <path d="M8 36 L100 96 L192 36 L192 30 A8 8 0 0 0 184 26 H16 A8 8 0 0 0 8 30 Z" fill="#f9c9dd" stroke="#fff" strokeWidth="3" strokeLinejoin="round" opacity={open ? 0 : 1} />
        <path d="M8 134 L78 82 M192 134 L122 82" stroke="#f3b6ce" strokeWidth="2.5" fill="none" />
        {/* wax seal */}
        {!open && (
          <>
            <circle cx="100" cy="86" r="16" fill="#e97ba6" stroke="#fff" strokeWidth="3" />
            <circle cx="100" cy="86" r="9" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
          </>
        )}
      </g>
    </svg>
  );
};

/* ── Doodle star ───────────────────────────────────────────────────── */
export const Star: React.FC<SVGProps & { color?: string }> = ({ size = 28, className, style, color = '#ffd88a' }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} style={style} aria-hidden="true">
    <path
      d="M20 3 L25 15 L38 16.5 L28.5 25 L31.5 38 L20 31 L8.5 38 L11.5 25 L2 16.5 L15 15 Z"
      fill={color}
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
  </svg>
);
