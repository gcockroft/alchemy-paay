import {Route, Routes} from "react-router-dom";
import {BadgesList} from "../components/badges/BadgesList";
import {BadgePage} from "../components/badges/BadgePage";
import {BadgeCreatePage} from "../components/badges/BadgeCreatePage";

export function BadgesScreen() {
  return (
    <>
      <Routes>
        <Route path="/" element={<BadgesList />} />
        <Route path="/create" element={<BadgeCreatePage />} />
        <Route path="/:id" element={<BadgePage />} />
      </Routes>
    </>
  );
}
