import React from 'react';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'circle';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  shape = 'square',
  className = ''
}) => {
  const getInitials = (n: string) => {
    if (!n) return 'SPI';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl font-bold'
  }[size];

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClasses} ${roundedClass} object-cover border border-emerald-900/10 dark:border-emerald-500/20 shadow-xs ${className}`}
        onError={(e) => {
          // If image fails to load, hide image and let fallback render
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Consistent background hue from name
  const hues = [
    'bg-emerald-800 text-emerald-100',
    'bg-teal-800 text-teal-100',
    'bg-amber-800 text-amber-100',
    'bg-stone-800 text-stone-100',
    'bg-emerald-900 text-gold-300'
  ];
  const charCodeSum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorClass = hues[charCodeSum % hues.length];

  return (
    <div
      className={`${sizeClasses} ${roundedClass} ${colorClass} flex items-center justify-center font-medium tracking-wide shadow-xs border border-emerald-900/20 dark:border-emerald-500/30 flex-shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
