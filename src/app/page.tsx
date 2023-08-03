import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <Head>
        <title>Landing Page</title>
      </Head>
      <h1>Waduppp! Welcome to Alchemy Paay</h1>
      <p>
        <Link href="/login">Login Page</Link>
      </p>
      <p>
        <Link href="/create-account">Create Account Page</Link>      
      </p>
    </main>
  )
}
