import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  className: string | undefined;
  label: string;
  onClick: () => void;
  href: string;
}

const Button: React.FC<ButtonProps> = ({className, label, onClick, href}) => {
  return (
    <Link className={className} href={href}>
        <button onClick={() => onClick()}>
          {label}
        </button>
    </Link>
  )
}

export default Button;