import { ReactNode } from 'react';
import styles from './navbar.module.css';
import Link from 'next/link';

interface NavbarProps {
  children?: ReactNode;
}

const MENU_LIST = [
  { text: "Home", href: "/" },
  { text: "About Us", href: "/about" },
  { text: "Contact", href: "/contact" },
];

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  return (
    <div className={styles.navbar}>
      <Link href='/home/send'>Send</Link>
      <Link href='/home/history'>History</Link>
    </div>
  );
}

export default Navbar;


