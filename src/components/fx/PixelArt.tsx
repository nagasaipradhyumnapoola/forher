import React from 'react';

/**
 * Tiny pixel-art sprites drawn as crisp SVG rects (shapeRendering="crispEdges"),
 * so they scale to any size and stay perfectly pixelated. No image files.
 *
 * A sprite is just an array of equal-length strings; each character maps to a
 * colour in the palette. '.' = transparent.
 */

export const PixelSprite: React.FC<{
  grid: string[];
  palette: Record<string, string>;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ grid, palette, scale = 4, className, style }) => {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < h; y++) {
    const row = grid[y];
    for (let x = 0; x < w; x++) {
      const fill = palette[row[x]];
      if (!fill) continue;
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
};

/* ── Sitting cat ───────────────────────────────────────────────────── */
const CAT = [
  '................',
  '..XX........XX..',
  '.XwwX......XwwX.',
  '.XwpwX....XwpwX.',
  '.XwwwwXXXXwwwwX.',
  '.XwwwwwwwwwwwwX.',
  '.XwwwwwwwwwwwwX.',
  '.XwEEwwwwwwEEwX.',
  '.XwwwwwPwwwwwwX.',
  '.XwBwwwwwwwwBwX.',
  '..XwwwwwwwwwwX..',
  '..XwwwwwwwwwwX..',
  '..XwwwwwwwwwwXX.',
  '..XwwwwwwwwwwXwX',
  '..XXwwwwwwwwXXwX',
  '....XXXXXXXX..XX',
];

const CAT_COATS: Record<string, string> = {
  cream: '#fffaf5',
  ginger: '#f7c99b',
  grey: '#dfe3ee',
  pink: '#fde0ec',
};

export const PixelCat: React.FC<{
  coat?: keyof typeof CAT_COATS;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ coat = 'cream', scale = 3, className, style }) => (
  <PixelSprite
    grid={CAT}
    scale={scale}
    className={className}
    style={style}
    palette={{
      X: '#c79bb0', // soft mauve outline — keeps the sprite gentle, not inky
      w: CAT_COATS[coat],
      p: '#f6c3d6',
      E: '#8a6274',
      P: '#f0a0bd',
      B: '#fbd0de',
    }}
  />
);

/* ── Sparkle ───────────────────────────────────────────────────────── */
const SPARK = [
  '...X...',
  '...X...',
  '..XXX..',
  'XXXXXXX',
  '..XXX..',
  '...X...',
  '...X...',
];

export const PixelSparkle: React.FC<{
  color?: string;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ color = '#ffd98a', scale = 3, className, style }) => (
  <PixelSprite grid={SPARK} scale={scale} className={className} style={style} palette={{ X: color }} />
);

/* ── Flower ────────────────────────────────────────────────────────── */
const FLOWER = [
  '..PP.PP..',
  '.PPPPPPP.',
  '.PPPYPPP.',
  '.PPPPPPP.',
  '..PP.PP..',
  '....G....',
  '...GG....',
  '....G....',
  '....G....',
];

export const PixelFlower: React.FC<{
  color?: string;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ color = '#f7a9c8', scale = 3, className, style }) => (
  <PixelSprite
    grid={FLOWER}
    scale={scale}
    className={className}
    style={style}
    palette={{ P: color, Y: '#ffe08a', G: '#a8cf9a' }}
  />
);

/* ── Little cloud ──────────────────────────────────────────────────── */
const CLOUD = [
  '....XXXX....',
  '..XXwwwwXX..',
  '.XwwwwwwwwX.',
  'XwwwwwwwwwwX',
  'XwwwwwwwwwwX',
  '.XXXXXXXXXX.',
];

export const PixelCloud: React.FC<{
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ scale = 3, className, style }) => (
  <PixelSprite grid={CLOUD} scale={scale} className={className} style={style} palette={{ X: '#e8c2d6', w: '#fffdfb' }} />
);
