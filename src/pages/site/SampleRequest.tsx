import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import {
  TextAlignCenter,
  ChevronDown,
  SquarePen,
  User,
  Plus,
  X,
  Calendar,
  Filter,
} from "lucide-react";
import SampleRequestForm from "../../components/Requests/RequestForm";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
const fetchSampleRequests = async (page: number) => {
  const res = await api.get(`/api/sample-requests?page=${page}&limit=10`);
  return res?.data?.data;
};
const SampleRequest = ({ isHomepage = false }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [isRole, setisRole] = useState("");
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [customerFilter, setCustomerFilter] = useState("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
    }
    setisRole(user?.role || "");
  }, [isAuthenticated, navigate]);
  const { data: requests, isLoading: isReqestsLoading } = useQuery({
    queryKey: [`sample-requests`, page],
    queryFn: () => fetchSampleRequests(page),
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
  const closeModal = () => {
    setOpenModal(false);
    setSelectedRequestId(null);
  };
  const totalPages = requests?.totalPages || 1;
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const filteredRequests =
    requests?.requests?.filter((request: any) => {
      const itemStatus = request.items?.[0]?.status || "REQUESTED";

      // STATUS
      if (statusFilter !== "ALL" && itemStatus !== statusFilter) {
        return false;
      }

      // DATE
      if (dateFilter !== "ALL") {
        const reqDate = new Date(request.requiredByDate);
        const now = new Date();

        if (dateFilter === "THIS_WEEK") {
          const weekAhead = new Date();
          weekAhead.setDate(now.getDate() + 7);
          if (reqDate > weekAhead) return false;
        }

        if (dateFilter === "THIS_MONTH") {
          if (
            reqDate.getMonth() !== now.getMonth() ||
            reqDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      // CUSTOMER
      if (customerFilter !== "ALL" && request.buyerName !== customerFilter) {
        return false;
      }

      return true;
    }) || [];
  const customerOptions = [
    "ALL",
    ...(requests?.requests
      ? Array.from(new Set(requests.requests.map((r: any) => r.buyerName)))
      : []),
  ];
  useEffect(() => {
    document.body.style.overflow = openModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openModal]);
  console.log(requests);
  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-background-light">
        <div className={`flex-1 ${!isHomepage && "p-8"} overflow-y-auto`}>
          <div
            className={`${isHomepage && "hidden"} flex flex-col mb-3 md:mb-6 md:flex-row md:items-center justify-between gap-4`}
          >
            <div className="">
              <h2 className="text-2xl font-bold tracking-tight">
                Sample Requests
              </h2>
              <p className="text-slate-500">
                Welcome back, Sarah. Here's what's happening today.
              </p>
            </div>
            <div className="flex md:flex-row flex-col gap-3">
              <button
                onClick={() => {
                  setSelectedRequestId(null);
                  setOpenModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 hover:cursor-pointer bg-[#1c6bf2] text-white rounded text-sm font-medium hover:bg-[#1c6bf2]/90 transition-all shadow-lg shadow-[#1c6bf2]/20"
              >
                <Plus size={18} />
                <span>New Request</span>
              </button>
            </div>
          </div>
          <div
            className={`${isHomepage && "hidden"} flex flex-wrap items-center gap-3 mb-6`}
          >
            {/* STATUS FILTER */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenFilter(openFilter === "status" ? null : "status")
                }
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <Filter size={18} />
                Status: {statusFilter}
                <ChevronDown size={18} />
              </button>

              {openFilter === "status" && (
                <div className="absolute mt-2 bg-white border rounded-lg shadow z-20 w-44">
                  {[
                    "ALL",
                    "REQUESTED",
                    "IN_SAMPLING",
                    "SENT",
                    "APPROVED",
                    "REJECTED",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setOpenFilter(null);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DATE FILTER */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenFilter(openFilter === "date" ? null : "date")
                }
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <Calendar size={18} />
                Date: {dateFilter}
                <ChevronDown size={18} />
              </button>

              {openFilter === "date" && (
                <div className="absolute mt-2 bg-white border rounded-lg shadow z-20 w-44">
                  {["ALL", "THIS_WEEK", "THIS_MONTH"].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setDateFilter(d);
                        setOpenFilter(null);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMER FILTER */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenFilter(openFilter === "customer" ? null : "customer")
                }
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              >
                <User size={18} />
                Customer: {customerFilter}
                <ChevronDown size={18} />
              </button>

              {openFilter === "customer" && (
                <div className="absolute mt-2 bg-white border rounded-lg shadow z-20 w-56 max-h-64 overflow-auto">
                  {customerOptions.map((c: any) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCustomerFilter(c);
                        setOpenFilter(null);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />
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
                    <th
                      className={`${isHomepage && "hidden"} ${isRole === "SALES" && "hidden"} py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                {isReqestsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tbody>
                    {filteredRequests?.map((request: any, index: number) => {
                      const latestStatus =
                        request.items?.[0]?.status || "REQUESTED";

                      const isOpen = expandedRows[request._id];

                      return (
                        <>
                          <tr
                            onClick={() => toggleRow(request._id)}
                            key={index}
                            className="border-b border-slate-100 hover:cursor-pointer hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-4 px-6 text-center">
                              <button className="text-slate-400 hover:cursor-pointer hover:text-[#1c6bf2] transition-transform">
                                <ChevronDown
                                  size={18}
                                  className={
                                    isOpen
                                      ? "rotate-180 transition-transform"
                                      : "transition-transform"
                                  }
                                />
                              </button>
                            </td>

                            <td className="py-4 px-6">
                              <h3 className="font-bold text-slate-900">
                                {request.buyerName}
                              </h3>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
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

                            <td
                              className={`${isHomepage && "hidden"} ${isRole === "SALES" && "hidden"} py-4 px-6 text-right`}
                            >
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedRequestId(request._id);
                                    setOpenModal(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-slate-50 hover:text-[#1c6bf2] hover:cursor-pointer text-slate-600"
                                >
                                  <SquarePen size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isOpen && (
                            <tr className="bg-slate-50">
                              <td colSpan={5}>
                                <div className="px-16 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {request.items.map(
                                    (item: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="size-8 rounded bg-slate-100  flex items-center justify-center">
                                            <TextAlignCenter size={18} />
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-slate-900 leading-tight">
                                              {item?.fabricName}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                              {item?.requiredMeters} Meters •{" "}
                                              {item?.color} • {item?.gsm} gsm
                                            </p>
                                          </div>
                                        </div>
                                        <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                                          Approved
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="px-4 py-2 text-sm font-bold">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpenModal(false)}
            />

            {/* MODAL */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Request Sample
                </h3>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-slate-500 hover:cursor-pointer text-sm"
                >
                  <X size={18} color="#ff0000" />
                </button>
              </div>

              <SampleRequestForm
                key={selectedRequestId ?? "new"}
                RequestId={selectedRequestId}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
};
export default SampleRequest;
