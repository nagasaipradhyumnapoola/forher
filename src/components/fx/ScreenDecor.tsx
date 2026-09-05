import React from 'react';
import { Bow, Teddy, Sparkle, Flower, Star, WashiTape } from './Stickers';
import { PixelCat, PixelSparkle, PixelFlower, PixelCloud } from './PixelArt';

/**
 * A light sprinkle of scrapbook stickers around a screen. Purely decorative —
 * absolutely positioned inside the screen container (so edge pieces "peek" in),
 * never interactive, and hidden for reduced-motion users' comfort is preserved
 * because the pieces only drift gently.
 */

type Variant = 'letter' | 'cards' | 'confession' | 'quiz' | 'ticket';

const S = (style: React.CSSProperties, rot?: string): React.CSSProperties =>
  rot ? ({ ...style, ['--rot' as string]: rot }) : style;

export const ScreenDecor: React.FC<{ variant?: Variant }> = ({ variant = 'cards' }) => {
  switch (variant) {
    case 'letter':
      return (
        <>
          <Bow size={70} color="#7fb0ea" className="sticker sticker-float" style={S({ top: '7%', left: '6%' }, '-14deg')} />
          <Teddy size={72} className="sticker sticker-float" style={S({ bottom: '6%', right: '5%' }, '9deg')} />
          <Sparkle size={22} className="sticker" style={{ top: '18%', right: '11%' }} />
          <Star size={24} className="sticker sticker-float" style={S({ bottom: '20%', left: '9%' }, '8deg')} />
          <WashiTape width={104} height={26} rotate={22} color="rgba(150,190,240,0.6)" className="sticker" style={{ top: '3%', right: '-22px' }} />
          <PixelCat coat="cream" scale={4} className="sticker sticker-float" style={S({ bottom: '7%', left: '11%' }, '-5deg')} />
          <PixelCloud scale={3} className="sticker sticker-float" style={S({ top: '11%', right: '24%' }, '4deg')} />
          <PixelSparkle scale={3} className="sticker" style={{ bottom: '40%', right: '3%' }} />
        </>
      );
    case 'confession':
      return (
        <>
          <Bow size={64} className="sticker sticker-float" style={S({ top: '9%', right: '7%' }, '12deg')} />
          <Flower size={34} className="sticker sticker-float" style={S({ top: '22%', left: '8%' }, '-10deg')} />
          <Sparkle size={20} className="sticker" style={{ bottom: '26%', right: '12%' }} />
          <Sparkle size={16} color="#9dc4f2" className="sticker" style={{ top: '14%', left: '20%' }} />
          <Star size={22} className="sticker sticker-float" style={S({ bottom: '10%', left: '7%' }, '-6deg')} />
          <PixelCat coat="ginger" scale={4} className="sticker sticker-float" style={S({ bottom: '8%', right: '9%' }, '6deg')} />
          <PixelSparkle scale={3} color="#f7a9c8" className="sticker" style={{ top: '30%', right: '16%' }} />
        </>
      );
    case 'quiz':
      return (
        <>
          <Flower size={32} className="sticker sticker-float" style={S({ top: '8%', left: '5%' }, '-12deg')} />
          <Sparkle size={18} className="sticker" style={{ top: '13%', right: '8%' }} />
          <Star size={20} color="#9dc4f2" className="sticker sticker-float" style={S({ bottom: '9%', right: '6%' }, '10deg')} />
          <WashiTape width={88} height={22} rotate={-24} color="rgba(246,170,205,0.6)" className="sticker" style={{ bottom: '4%', left: '-20px' }} />
          <PixelCat coat="grey" scale={3} className="sticker sticker-float" style={S({ top: '7%', right: '15%' }, '-6deg')} />
          <PixelFlower scale={3} className="sticker" style={{ bottom: '22%', left: '10%' }} />
        </>
      );
    case 'ticket':
      return (
        <>
          <Bow size={66} color="#7fb0ea" className="sticker sticker-float" style={S({ top: '5%', left: '5%' }, '-12deg')} />
          <Teddy size={64} className="sticker sticker-float" style={S({ top: '8%', right: '4%' }, '10deg')} />
          <Flower size={30} className="sticker" style={{ bottom: '8%', left: '8%' }} />
          <Sparkle size={20} className="sticker" style={{ bottom: '14%', right: '9%' }} />
          <PixelCat coat="cream" scale={4} className="sticker sticker-float" style={S({ bottom: '6%', right: '12%' }, '5deg')} />
          <PixelSparkle scale={3} className="sticker" style={{ top: '26%', left: '13%' }} />
        </>
      );
    case 'cards':
    default:
      return (
        <>
          <Bow size={58} className="sticker sticker-float" style={S({ top: '6%', right: '6%' }, '10deg')} />
          <Flower size={30} className="sticker sticker-float" style={S({ bottom: '10%', left: '6%' }, '-8deg')} />
          <Sparkle size={18} className="sticker" style={{ top: '16%', left: '9%' }} />
          <Star size={20} color="#9dc4f2" className="sticker" style={{ bottom: '18%', right: '8%' }} />
          <PixelCat coat="ginger" scale={4} className="sticker sticker-float" style={S({ bottom: '7%', right: '10%' }, '-5deg')} />
          <PixelCloud scale={3} className="sticker sticker-float" style={S({ top: '9%', left: '18%' }, '3deg')} />
        </>
      );
  }
};
