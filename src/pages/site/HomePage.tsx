import {
  Bell,
  Search,
  BadgeCheck,
  ClipboardClock,
  ReceiptText,
  ClipboardCheck,
} from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";

const fetchDashboard = async () => {
  const res = await api.get("/api/dashboard/stats");
  return res.data.data;
};
const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
    }
  }, [isAuthenticated, navigate]);
  const { data: stats, isLoading: isStatLoading } = useQuery({
    queryKey: [`stats`],
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white  border-b border-slate-200  z-10">
          <div className="w-full max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1c6bf2] transition-colors">
                <Search size={18} />
              </span>
              <input
                className="w-full bg-slate-100  border-none rounded pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#1c6bf2]/20 transition-all"
                placeholder="Search orders, fabrics, or clients..."
                type="text"
              />
            </div>
          </div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 ml-4 rounded transition-colors">
            <Bell size={18} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Executive Overview
              </h2>
              <p className="text-slate-500">
                Welcome back, Sarah. Here's what's happening today.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white  p-6 rounded border border-slate-200  shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50  text-[#1c6bf2] rounded">
                  <ReceiptText size={18} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Total Requests
              </p>
              {isStatLoading ? (
                <>
                  <div className="w-full h-screen flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 tracking-tight">
                    {stats?.totalSampleRequests}
                  </h3>
                </>
              )}
            </div>
            <div className="bg-white  p-6 rounded border border-slate-200  shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50  text-amber-600 rounded">
                  <ClipboardClock size={18} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Pending Approvals
              </p>
              {isStatLoading ? (
                <>
                  <div className="w-full h-screen flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 tracking-tight">
                    {stats?.pendingSamples}
                  </h3>
                </>
              )}
            </div>
            <div className="bg-white  p-6 rounded border border-slate-200  shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50  text-indigo-600 rounded">
                  <ClipboardCheck size={18} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">Dispatched</p>
              {isStatLoading ? (
                <>
                  <div className="w-full h-screen flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 tracking-tight">
                    {stats?.sentToday}
                  </h3>
                </>
              )}
            </div>
            <div className="bg-white  p-6 rounded border border-slate-200  shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-rose-50  text-rose-600 rounded">
                  <BadgeCheck size={18} />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Approved Rate
              </p>
              {isStatLoading ? (
                <>
                  <div className="w-full h-screen flex justify-center items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mt-1 tracking-tight">
                    {stats?.approvalRatePercentage}%
                  </h3>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Sample Requests</h3>
                <Link
                  to={`/sample-requests`}
                  className="text-sm text-[#1c6bf2] hover:cursor-pointer font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="bg-white  border border-slate-200  rounded overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 /50 border-b border-slate-200 ">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 ">
                    <tr className="hover:bg-slate-50 /30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1c6bf2]">
                        #FAB-1024
                      </td>
                      <td className="px-6 py-4 text-sm">Nordic Designs Ltd.</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Oct 12, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700  ">
                          New
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 /30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1c6bf2]">
                        #FAB-1023
                      </td>
                      <td className="px-6 py-4 text-sm">Loom &amp; Thread</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Oct 11, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700  ">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 /30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1c6bf2]">
                        #FAB-1022
                      </td>
                      <td className="px-6 py-4 text-sm">Velvet &amp; Co.</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Oct 11, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700  ">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 /30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1c6bf2]">
                        #FAB-1021
                      </td>
                      <td className="px-6 py-4 text-sm">Urban Textile</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Oct 10, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700  ">
                          New
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 /30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1c6bf2]">
                        #FAB-1020
                      </td>
                      <td className="px-6 py-4 text-sm">Heritage Weaves</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        Oct 09, 2023
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700  ">
                          Cancelled
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
export default HomePage;
