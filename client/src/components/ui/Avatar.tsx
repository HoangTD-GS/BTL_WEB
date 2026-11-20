import { useState } from 'react';
import type { CSSProperties } from 'react';
import { initials } from '../../utils/format';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function Avatar({ name = 'Đầu bếp', size = 'md', className = '', style }: AvatarProps) {
  const [level, setLevel] = useState<0 | 1 | 2>(0);

  // Chọn ngẫu nhiên nhưng cố định 1 trong 151 Pokemon Gen 1 đáng yêu theo tên người dùng
  const pokeId = (Math.abs(hashString(name)) % 151) + 1;
  const pokeUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
  const dicebearUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  return (
    <span
      className={`avatar ${sizeClass} ${className}`.trim()}
      title={name}
      aria-label={name}
      style={style}
    >
      {level === 0 && (
        <img
          src={pokeUrl}
          alt={name}
          loading="lazy"
          onError={() => setLevel(1)}
        />
      )}
      {level === 1 && (
        <img
          src={dicebearUrl}
          alt={name}
          loading="lazy"
          onError={() => setLevel(2)}
        />
      )}
      {level === 2 && <span className="avatar-fallback">{initials(name)}</span>}
    </span>
  );
}
