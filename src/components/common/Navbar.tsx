import { Bell } from "lucide-react";
const Navbar = () => {
  return (
    <>
      <header className="h-16 flex items-center justify-end px-8 bg-white  border-b border-slate-200  z-10">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 ml-4 rounded transition-colors">
          <Bell size={18} />
        </button>
      </header>
    </>
  );
};
export default Navbar;
