'use client';
import Button from '@/app/components/button';
import Image from 'next/image';
import styles from './Home.module.css';
import logo from './images/alchemy-paay-logo.png';

export default function Home() {
  const getStartedRef = 'home/send';

  // Get started button onClick() will trigger onboarding / login flow.
  return (
    <main>
      <Image width={550} src={logo} alt={''}/>
      <Button 
        className="flex justify-center align-middle m-14 pl-4 pr-4 pt-5 pb-5 bg-black text-white rounded-xl font-bold hover:bg-slate-800 shadow-md shadow-gray-400 text-2xl"
        label='GET STARTED' 
        onClick={() => console.log('We up in this')} 
        href={getStartedRef}
      />
    </main>
  )
}