import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <Link href='/'>Back to Landing Page</Link>
      <Head>
        <title>Alchemy Paay</title>
      </Head>
      <div>
        <h1>History</h1>
        <h1>Pay</h1>
      </div>
      <Link href='/profile'>View Profile</Link>
    </div>
  )
}