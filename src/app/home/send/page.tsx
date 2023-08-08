'use client';
import Link from "next/link";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar/navbar";
import HomeView from "@/app/components/SendInput/initSend";
import FriendCard from "@/app/components/friendCard";

const STATUS_NONE = 'none';
const STATUS_SEARCH = 'search';
const STATUS_CHOOSE_AMOUNT = 'choose-amount';
const STATUS_CONFIRM = 'confirm';
const STATUS_SENDING = 'sending';
const STATUS_CONFIRMED = 'confirmed';

export function Send() {
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState('');
  const [status, setStatus] = useState(STATUS_NONE);

  const textHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }

  /* UPDATES query SEARCH STATE.
   * DATABASE SEARCH LOGIC HERE.
   */
  useEffect(() => {
    console.log(query);
  }, [query])

  /*
   * 
   */
  const selectUser = (user: string) => {
    setUser(user);
    setStatus(STATUS_CHOOSE_AMOUNT);
  }

  /* 
   *
   */
  const chooseAmount = () => {
    setStatus(STATUS_CONFIRM);
  }

  /* Called when user confirms they want to send their transaction.
   * Render sending view, initiates transaction send.
   */
  const confirmTx = async () => {
    setStatus(STATUS_SENDING);
    await sendTx();
    finishTx();
  }

  /* Called by transaction confirmation.
   * Transaction sending logic goes here.
   */ 
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const sendTx = async () => {
    setStatus(STATUS_SENDING);
    await sleep(2000);
  }

  /* SHOWS FINAL MODAL VIEW.
   * DO ANY TX CLEANUP AND RESPONSE HANDLING HERE.
   */
  const finishTx = () => {
    setStatus(STATUS_CONFIRMED);
  }

  const closeModal = () => {
    setModalVisible(false);
    setStatus(STATUS_NONE);
  }

  const renderModal = () => {
    switch (status) {
      case 'search':
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Send to</p>
              <p className="text-sm text-gray-600">Choose a friend that you want to send USDC to.</p>
              <input className='flex-1 text-base p-1 m-3 max-h-10 rounded-md bg-slate-200' type='text' placeholder='Search by name or address' onChange={textHandler}/>
              <div className='overflow-scroll m-3'>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
              </div>
            </div>
          </>
        )
      case 'choose-amount':
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Choose amount</p>
              <input></input>
              <button className="btn-primary" onClick={chooseAmount}>Send</button>
            </div>
          </>
        )
      case 'confirm':
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Confirm Tx</p>
              <input></input>
              <button className="btn-primary" onClick={confirmTx}>Confirm</button>
            </div>
          </>
        )
      case 'sending':
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Sending...</p>
              <input></input>
              <div className="spinner"></div>
            </div>
          </>
        )
      case 'confirmed':
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Confirmed.</p>
              <input></input>
              <button className="btn-primary" onClick={closeModal}>Done</button>
            </div>
          </>
        )
    }
    
  }

  // Passes down setState so send button shows modal.
  const renderHome = () => {
    return <HomeView showModal={() => {
      setStatus(STATUS_SEARCH);
      setModalVisible(true);
    }} />
  }

  return (
    <main>
      {modalVisible ? renderModal() : renderHome()}
      <Link href='/'>Back to Landing Page</Link>
    </main>
  )
}

export default Send;