import AuthLayout from "@/app/components/auth_layout";
import Link from "next/link";
import Head from "next/head";
import { ReactElement } from "react";
import Navbar from "@/app/components/Navbar/navbar";

export function Send() {
  return (
    <main>
      <Link href='/'>Back to Landing Page</Link>
      <Head>
        <title>Alchemy Paay</title>
      </Head>
      <div>
        <Link href='/home/history'>History</Link>
        <h1>Pay</h1>
      </div>
      <Link href='/profile'>View Profile</Link>
    </main>
  )
}

export default Send;