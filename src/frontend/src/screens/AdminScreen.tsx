import {Navigate, Route, Routes} from "react-router-dom";
import {MemberList} from "../components/admin/MemberList";
import {
  MemberCreateForm,
  MemberUpdateForm,
} from "../components/admin/MemberForm";

export function AdminScreen() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="members" />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/member/create" element={<MemberCreateForm />} />
        <Route path="/member/:slug" element={<MemberUpdateForm />} />
      </Routes>
    </>
  );
}
