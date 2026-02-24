import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <div className="flex w-full">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <Outlet />
        </div>
      </div>
    </>
  );
}
