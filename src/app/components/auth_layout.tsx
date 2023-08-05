import Navbar from "@/app/components/Navbar/navbar";
import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      <Navbar/>
    </>
  );
};

export default AuthLayout;