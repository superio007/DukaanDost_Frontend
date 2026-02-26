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
  Trash2,
  RefreshCw,
} from "lucide-react";
import SampleRequestForm from "../../components/Requests/RequestForm";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { sampleRequestApi } from "../../utils/api";
import toast from "react-hot-toast";

const fetchSampleRequests = async (page: number) => {
  const res = await api.get(`/api/sample-requests?page=${page}&limit=10`);
  return res?.data?.data;
};
// Add this right after the canChangeStatus function in SampleRequest.tsx

const SampleRequest = ({ isHomepage = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    requestId: string;
    itemId: string;
    newStatus: string;
    fabricName: string;
    requiredMeters: number;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      REQUESTED: "IN_SAMPLING",
      IN_SAMPLING: "SENT",
      SENT: "APPROVED",
    };
    return statusFlow[currentStatus] || null;
  };

  const canChangeStatus = () => {
    console.log("Current user role:", isRole);
    console.log(
      "Can change status:",
      isRole === "ADMIN" || isRole === "SAMPLING_HEAD",
    );
    return isRole === "ADMIN" || isRole === "SAMPLING_HEAD";
  };

  const handleStatusChange = async (
    requestId: string,
    itemId: string,
    newStatus: string,
    fabricName: string,
    requiredMeters: number,
  ) => {
    if (newStatus === "SENT") {
      setStatusChangeConfirm({
        requestId,
        itemId,
        newStatus,
        fabricName,
        requiredMeters,
      });
    } else {
      await updateItemStatus(requestId, itemId, newStatus);
    }
  };

  const updateItemStatus = async (
    requestId: string,
    itemId: string,
    newStatus: string,
  ) => {
    console.log("Updating status:", { requestId, itemId, newStatus });
    setUpdatingStatus(true);
    try {
      const response = await sampleRequestApi.updateItemStatus(
        requestId,
        itemId,
        newStatus,
      );
      console.log("Status update response:", response);
      await queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
      toast.success(`Status updated to ${newStatus.replaceAll("_", " ")}`);
      setStatusChangeConfirm(null);
    } catch (err: any) {
      console.error("Status update error:", err);
      console.error("Error response:", err?.response);
      const errorMsg =
        err?.response?.data?.message || "Failed to update status";
      toast.error(errorMsg);
    } finally {
      setUpdatingStatus(false);
    }
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

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/api/sample-requests/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
      setDeleteConfirm(null);
      toast.success("Sample request deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sample request");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* <div className="fixed top-0 right-0 bg-red-500 text-white p-2 z-50">
        Role: {isRole} | Can Change: {canChangeStatus() ? "YES" : "NO"}
      </div> */}
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
                              onClick={(e) => e.stopPropagation()}
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
                                <button
                                  onClick={() => setDeleteConfirm(request._id)}
                                  className={`${(isRole === "SALES" && "hidden") || (isRole === "SAMPLING_HEAD" && "hidden")} p-2 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:cursor-pointer text-slate-600`}
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isOpen && (
                            <tr className="bg-slate-50">
                              <td colSpan={5}>
                                <div className="px-16 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {request.items.map(
                                    (item: any, index: number) => {
                                      const nextStatus = getNextStatus(
                                        item.status,
                                      );
                                      const canUpdate =
                                        canChangeStatus() && nextStatus;

                                      return (
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
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusStyle(
                                                item.status,
                                              )}`}
                                            >
                                              {item.status.replaceAll("_", " ")}
                                            </span>
                                            {canUpdate && (
                                              <button
                                                onClick={() =>
                                                  handleStatusChange(
                                                    request._id,
                                                    item._id,
                                                    nextStatus,
                                                    item.fabricName,
                                                    item.requiredMeters,
                                                  )
                                                }
                                                className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-[#1c6bf2] text-slate-600 transition-colors"
                                                title={`Change to ${nextStatus.replaceAll("_", " ")}`}
                                              >
                                                <RefreshCw size={14} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    },
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
              className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <span className="px-4 py-2 text-sm font-bold">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* ADD/EDIT MODAL */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpenModal(false)}
            />

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

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this sample request? This action
                cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATUS CHANGE CONFIRMATION MODAL */}
        {statusChangeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setStatusChangeConfirm(null)}
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Confirm Status Change
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Inventory Deduction Warning
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Changing status to "SENT" will deduct{" "}
                  <span className="font-bold">
                    {statusChangeConfirm.requiredMeters} meters
                  </span>{" "}
                  of{" "}
                  <span className="font-bold">
                    {statusChangeConfirm.fabricName}
                  </span>{" "}
                  from inventory.
                </p>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to proceed?
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setStatusChangeConfirm(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50"
                  disabled={updatingStatus}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    updateItemStatus(
                      statusChangeConfirm.requestId,
                      statusChangeConfirm.itemId,
                      statusChangeConfirm.newStatus,
                    )
                  }
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default SampleRequest;
