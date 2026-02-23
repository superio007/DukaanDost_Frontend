import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import {
  Bell,
  TextAlignCenter,
  Search,
  ChevronDown,
  LoaderCircle,
  ClipboardClock,
  CircleCheck,
  SquarePen,
  CircleX,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
const fetchSampleRequests = async () => {
  const res = await api.get(`/api/sample-requests?page=1&limit=10`);
  return res?.data?.data;
};
const SampleRequest = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
    }
  }, [isAuthenticated, navigate]);
  const { data: requests, isLoading: isReqestsLoading } = useQuery({
    queryKey: [`stats`],
    queryFn: fetchSampleRequests,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const getStatusStyle = (status: any) => {
    const map: any = {
      REQUESTED: "bg-amber-100 text-amber-700",
      IN_SAMPLING: "bg-blue-100 text-blue-700",
      SENT: "bg-indigo-100 text-indigo-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };

    return map[status] || "bg-slate-100 text-slate-700";
  };
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  console.log(requests);
  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-background-light">
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
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900  tracking-tight">
                Sample Requests
              </h2>
              <p className="text-slate-500  mt-1">
                Review and manage fabric sampling approvals for production.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white  border border-slate-200  rounded-xl p-4 flex items-center gap-4 min-w-40 shadow-sm">
                <div className="size-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ClipboardClock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-xl font-black text-slate-900 ">12</p>
                </div>
              </div>
              <div className="bg-white  border border-slate-200  rounded-xl p-4 flex items-center gap-4 min-w-40 shadow-sm">
                <div className="size-10 rounded-lg bg-[#1c6bf2]/10 text-[#1c6bf2] flex items-center justify-center">
                  <LoaderCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-xl font-black text-slate-900 ">28</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-white  border border-slate-200  rounded-lg text-sm font-semibold hover:border-[#1c6bf2]/50 transition-colors">
              <Filter size={18} />
              Status: All
              <ChevronDown size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white  border border-slate-200  rounded-lg text-sm font-semibold hover:border-[#1c6bf2]/50 transition-colors">
              <Calendar size={18} />
              Date: This Week
              <ChevronDown size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white  border border-slate-200  rounded-lg text-sm font-semibold hover:border-[#1c6bf2]/50 transition-colors">
              <User size={18} />
              Customer: All
              <ChevronDown size={18} />
            </button>
            <div className="flex-1"></div>
          </div>
          <div className="bg-white  border border-slate-200  rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50  border-b border-slate-200 ">
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center"></th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Request Status
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests?.requests?.map((request: any) => {
                    const latestStatus =
                      request.items?.[0]?.status || "REQUESTED";
                    return (
                      <tr className="border-b border-slate-100  hover:bg-slate-50/50  transition-colors">
                        <td className="py-4 px-6 text-center">
                          <button className="text-slate-400 hover:text-[#1c6bf2] transition-colors">
                            <ChevronDown size={18} />
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <h3 className="font-bold text-slate-900 ">
                            {request.buyerName}
                          </h3>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-500  text-sm font-medium">
                            <Calendar size={18} />
                            {new Date(
                              request.requiredByDate,
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(
                              latestStatus,
                            )}`}
                          >
                            {latestStatus.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-2 rounded-lg hover:bg-green-50  text-green-600 transition-colors group relative"
                              title="Approve"
                            >
                              <CircleCheck size={18} />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-red-50  text-red-600 transition-colors"
                              title="Reject"
                            >
                              <CircleX size={18} />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-slate-50  text-slate-600  transition-colors"
                              title="Update Status"
                            >
                              <SquarePen size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 bg-white  border border-slate-200  rounded-xl font-bold text-slate-600  hover:bg-slate-50  transition-colors shadow-sm">
              Load More Requests
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};
export default SampleRequest;
