import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

export default function Profile() {
  return (
    <main>
      <Head>
        <title>This is the Profile Page</title>
      </Head>
      <Link href='/home/send'>Back to home</Link>
      <h1>View profile</h1>
    </main>
  )
}
