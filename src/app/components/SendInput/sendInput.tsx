import React from 'react';
import styles from './sendInput.module.css';

interface SendInputProps {}

const SendInput: React.FC<SendInputProps> = ({}) => {
  return (
    <div className={styles.container}>
      <form>
        <input className={styles.address} type='hidden' name='from' value={''}/>
        <input className={styles.input} type='number' placeholder='0' name='quantity'/>
        <input className={styles.submit} type='submit' value='Send to Friend'/>
      </form>
    </div>
  )
}

export default SendInput;