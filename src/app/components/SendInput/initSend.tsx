import React, { FormEvent, FormEventHandler, ReactNode } from 'react';
import styles from './sendInput.module.css';

interface HomeViewProps {
  showModal: () => void;
}

// Contains no request logic, only renders the sending form
const HomeView: React.FC<HomeViewProps> = ({showModal}) => {
  // Get wallet address for from field.
  // Get user balance for balance field. Here or at tx creation time.
  return (
    <div className={styles.container}>
      <div className="flex row-auto">
        <p className="font-bold text-5xl m-1">100</p>
      </div>
      <p className="text-gray-700 font-semibold">USDC Alchemy Paay Balance</p>
      <input className="bg-gray-200 text-gray-800 hover:text-white hover:bg-blue-600 m-4 p-3 rounded-xl cursor-pointer font-bold" type='submit' value='Send USDC' onClick={() => showModal()}/>
    </div>
  )
}

export default HomeView;