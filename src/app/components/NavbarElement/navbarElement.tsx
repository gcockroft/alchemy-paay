import { ReactNode } from 'react';
import styles from './navbarElement.module.css';
import Link from 'next/link';

interface NavbarProps {
  label: string;
  onClick: () => void;
  href: string;
}

const NavbarElement: React.FC<NavbarProps> = ({ label, onClick, href }) => {
  return (
    <Link href={href}>
      <button onClick={() => onClick()}>
        <div className={styles.container}>
          <p>{label}</p>
        </div>
      </button>
    </Link>
  );
}

export default NavbarElement;