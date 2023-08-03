import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

export default function CreateAccount() {
  return (
    <main>
      <Head>
        <title>Create Account</title>
      </Head>
      <Link href="/">Back to Landing</Link>
      <h1>This is the create account page</h1>
      <Link href="/home">Create Account</Link>
    </main>
  )
}
