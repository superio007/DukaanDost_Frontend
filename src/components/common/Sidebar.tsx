import {
  GitGraph,
  LayoutDashboard,
  FileText,
  Archive,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Sample Requests", icon: FileText, path: "/sample-requests" },
  { name: "Inventory", icon: Archive, path: "/inventory" },
];

const Sidebar = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const filteredNavItems = navItems.filter((item) => {
    // remove Inventory for SALES and SAMPLING_HEAD
    if (
      (role === "SALES" || role === "SAMPLING_HEAD") &&
      item.name === "Inventory"
    ) {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-20 md:w-64 min-h-screen shrink-0 border-r border-slate-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <span className="bg-[#1c6bf2] text-white rounded p-2">
          <GitGraph size={18} />
        </span>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold leading-tight">Fabric ERP</h1>
          <p className="text-xs text-slate-500">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1c6bf2]/10 text-[#1c6bf2]"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden md:block">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t space-y-4 border-slate-200">
        <div className="bg-[#1c6bf2]/5 rounded p-4 hidden md:block">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#1c6bf2]">
              {user?.name || "Unknown User"}
            </p>

            <p className="text-xs text-slate-500">{user?.email}</p>

            <span className="font-semibold bg-[#1c6bf2]/50 text-white p-1 text-xs rounded">
              {user?.role || "-"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-[#1c6bf2]/80 text-white flex items-center gap-3 rounded font-bold text-lg hover:cursor-pointer hover:opacity-90 p-3"
        >
          <LogOut size={18} />
          <span className="hidden md:block">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
