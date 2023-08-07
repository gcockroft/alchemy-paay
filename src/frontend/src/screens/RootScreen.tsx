import {Navigate, Route, Routes} from "react-router-dom";
import ProfileScreen from "./ProfileScreen";
import NavigationBar from "../components/NavigationBar";
import ProfileRedirect from "../components/profile/ProfileRedirect";
import {ChakraProvider} from "@chakra-ui/react";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "../clients/query";
import {MeProvider} from "../context/me";
import {AdminScreen} from "./AdminScreen";
import {BadgesScreen} from "./BadgesScreen";
import AboutScreen from "./AboutScreen";
import {MyWalletProvider} from "../context/myWallet";

export default function RootScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <MeProvider>
          <MyWalletProvider>
            <NavigationBar />
            <Routes>
              <Route path="/" element={<Navigate to="profile" />} />
              <Route path="profile" element={<ProfileRedirect />} />
              <Route path="profile/:slug" element={<ProfileScreen />} />
              <Route path="admin/*" element={<AdminScreen />} />
              <Route path="about/" element={<AboutScreen />} />
              <Route path="badges/*" element={<BadgesScreen />} />
            </Routes>
          </MyWalletProvider>
        </MeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
