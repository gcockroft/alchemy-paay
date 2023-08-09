import Navbar from "@/app/components/Navbar/navbar";


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