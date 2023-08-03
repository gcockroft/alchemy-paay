import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

export default function Login() {
  return (
    <main>
      <Head>
        <title>Login</title>
      </Head>
      <Link href="/">Back to Landing</Link>
      <h1>This is the login page</h1>
      <Link href="/home">Login</Link>
    </main>
  )
}
