'use client'
import { ReactNode } from 'react';
import styles from './navbar.module.css';
import Link from 'next/link';
import NavbarElement from '@/app/components/NavbarElement/navbarElement';

interface NavbarProps {
  children?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  return (
    <div className={styles.navbar}>
      <NavbarElement label='Send' href='/home/send' onClick={() => {}}/>
      <NavbarElement label='History' href='/home/history' onClick={() => {}}/>
    </div>
  );
}

export default Navbar;


