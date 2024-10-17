// components/CustomArrows.tsx
'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const PrevArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <button
    className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 hover:bg-opacity-100 p-2 rounded-full shadow ${className}`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Предыдущий"
  >
    <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
  </button>
);

export const NextArrow: React.FC<ArrowProps> = ({ className, style, onClick }) => (
  <button
    className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-75 hover:bg-opacity-100 p-2 rounded-full shadow ${className}`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Следующий"
  >
    <ChevronRightIcon className="h-5 w-5 text-gray-700" />
  </button>
);
