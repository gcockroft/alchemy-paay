'use client';
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import HomeView from "@/app/views/SendInput/HomeView";
import FriendCard from "@/app/components/friendCard";
import Keypad from "@/app/components/Keypad/keypad";

const STATUS_NONE = 'none';
const STATUS_SEARCH = 'search';
const STATUS_CHOOSE_AMOUNT = 'choose-amount';
const STATUS_CONFIRM = 'confirm';
const STATUS_SENDING = 'sending';
const STATUS_CONFIRMED = 'confirmed';

export function Send() {
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [amount, setAmount] = useState(0);
  const [user, setUser] = useState('');
  const [status, setStatus] = useState(STATUS_NONE);
  const [balance, setBalance] = useState(80); // Add getBalance() contract logic here.

  const textHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }

  const amountHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setAmount(parseFloat(event.currentTarget.value));
  }

  const keypadHandler = (num: number) => {
    console.log("pressed: " + num);
    setAmount(amount ? parseInt(amount.toString() + num.toString()) : num);
  }

  /* 
   * DATABASE SEARCH LOGIC HERE ON QUERY LISTEN.
   */
  useEffect(() => {
    console.log('user: ' + user);
    console.log('query: ' + query);
    console.log('amount: ' + amount);
  }, [query, amount, user])

  /* Selects a user searched from the database.
   * Get to: address here for sending the transaction.
   */
  const selectUser = (user: string) => {
    setUser(user);
    setStatus(STATUS_CHOOSE_AMOUNT);
  }

  /* Builds transaction object.
   * Check amountn against balance here.
   */
  const chooseAmount = () => {
    setAmount(amount);
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

  // Contains all modal stages via state changes.
  const renderModal = () => {
    switch (status) {
      case STATUS_SEARCH:
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <span className="modal-header">Send to</span>
              <span className="text-sm text-gray-600 ml-3 mr-3">Choose a friend that you want to send USDC to.</span>
              <input className='flex-1 text-base p-1 m-3 max-h-10 rounded-md bg-slate-200 focus:outline-none' type='text' placeholder='Search by name or address' onChange={textHandler}/>
              <div className='overflow-scroll m-3'>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Keshav' onClick={selectUser}/>
                <FriendCard name='Ava' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Keshav' onClick={selectUser}/>
                <FriendCard name='Ava' onClick={selectUser}/>
                <FriendCard name='Gareth' onClick={selectUser}/>
                <FriendCard name='Keshav' onClick={selectUser}/>
                <FriendCard name='Ava' onClick={selectUser}/>
              </div>
            </div>
          </>
        )
      case STATUS_CHOOSE_AMOUNT:
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <p className="modal-header">Choose amount</p>
              <div className="modal-body-container">
                <input type="number" className="font-bold text-5xl focus:outline-none text-center" placeholder="0" min="0" onChange={amountHandler} value={amount}></input>
                <Keypad onClick={keypadHandler} />
                <button className="btn-primary" onClick={chooseAmount}>Send</button>
              </div>
            </div>
          </>
        )
      case STATUS_CONFIRM:
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <span className="modal-header">Confirm Tx</span>
              <div className="flex h-1/4 flex-row items-center justify-between bg-slate-100 rounded-lg m-2 pl-3 pr-3">
                <span>To: </span>
                <span>{user}</span>
              </div>
              <div className="h-3/4 flex-col content-center justify-between bg-slate-100 rounded-lg m-2 mt-0">
                <div className="h-1/3 flex flex-row items-center justify-between border-b border-slate-300 pl-3 pr-3">
                  <span>Amount: </span>
                  <span>{amount}</span>
                </div>
                <div className="h-1/3 flex flex-row items-center justify-between border-b border-slate-300 pl-3 pr-3">
                  <span>Fee: </span>
                  <span>{amount}</span>
                </div>
                <div className="h-1/3 flex flex-row items-center justify-between pl-3 pr-3">
                  <span>Total:</span>
                  <span>{amount}</span>
                </div>
              </div>
              <div>

              </div>
              <button className="btn-primary" onClick={confirmTx}>Confirm</button>
            </div>
          </>
        )
      case STATUS_SENDING:
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <span className="modal-header">Sending...</span>
              <span className="text-sm text-gray-600 ml-3 mr-3">You are sending {amount} USDC to @{user}.</span>
              <div className="modal-body-container justify-center">
                <div className="spinner"/>
              </div>
            </div>
          </>
        )
      case STATUS_CONFIRMED:
        return (
          <>
            <div className="modal-wrapper" onClick={() => {setModalVisible(false)}}/>
            <div className="main-modal">
              <span className="modal-header">Confirmed.</span>
              <div className="modal-body-container justify-end">
                <button className="btn-primary" onClick={closeModal}>Done</button>
              </div>
            </div>
          </>
        )
    }
    
  }

  // Passes down setState so send button shows modal.
  const renderHome = () => {
    return <HomeView 
      balance={balance}
      showModal={() => {
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