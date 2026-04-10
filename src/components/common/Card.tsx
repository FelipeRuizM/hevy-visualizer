import React, { type ReactNode, type CSSProperties } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
};
