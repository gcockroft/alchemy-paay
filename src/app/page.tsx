'use client';
import Button from '@/app/components/button';
import Image from 'next/image';
import styles from './Home.module.css';
import { useRef } from 'react';
import logo from './images/alchemy-paay-logo.png';

export default function Home() {
  const getStartedRef = 'home/send';

  // Get started button onClick() will trigger onboarding / login flow.
  return (
    <main>
      <Image width={450} src={logo} alt={''}/>
      <Button 
        className={styles.get_started} 
        label='GET STARTED' 
        onClick={() => console.log('We up in this')} 
        href={getStartedRef}
      />
    </main>
  )
}