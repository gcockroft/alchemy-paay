import Navbar from "@/app/components/Navbar/navbar";
import History from "@/app/home/history/page";
import Send from "@/app/home/send/page";


export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Navbar></Navbar>
    </> 
  )
}