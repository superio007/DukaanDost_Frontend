import {
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
import SampleRequest from "./SampleRequest";

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
              <SampleRequest isHomepage={true} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
export default HomePage;
