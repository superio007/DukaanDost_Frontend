import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { ChevronDown, SquarePen, Plus, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/api";
import InventoryForm from "../../components/Inventory/InventoryForm";

const fetchInventory = async (page: number, limit: number) => {
  const res = await api.get(`/api/inventory?page=${page}&limit=${limit}`);
  return res?.data?.data;
};

const Inventory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [openModal, setOpenModal] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [fabricFilter, setFabricFilter] = useState("ALL");
  const [meterFilter, setMeterFilter] = useState("ALL");
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth/signin");
  }, [isAuthenticated, navigate]);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", page],
    queryFn: () => fetchInventory(page, 10),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const inventory = inventoryData?.inventory || [];
  const totalPages = inventoryData?.totalPages || 1;

  const fabricOptions: string[] = [
    "ALL",
    ...(inventory
      ? Array.from(new Set<string>(inventory.map((i: any) => i.fabricName)))
      : []),
  ];

  const filteredInventory =
    inventory?.filter((item: any) => {
      if (fabricFilter !== "ALL" && item.fabricName !== fabricFilter)
        return false;

      if (meterFilter !== "ALL") {
        if (meterFilter === "LOW" && item.availableMeters > 50) return false;
        if (
          meterFilter === "MEDIUM" &&
          (item.availableMeters <= 50 || item.availableMeters > 100)
        )
          return false;
        if (meterFilter === "HIGH" && item.availableMeters <= 100) return false;
      }

      return true;
    }) || [];

  const getColorStyle = (color: string) => {
    const map: Record<string, string> = {
      red: "bg-red-100 text-red-700",
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      white: "bg-slate-100 text-slate-700",
      black: "bg-slate-900 text-white",
      yellow: "bg-yellow-100 text-yellow-700",
      gray: "bg-gray-100 text-gray-700",
    };

    return map[color.toLowerCase()] || "bg-purple-100 text-purple-700";
  };

  useEffect(() => {
    document.body.style.overflow = openModal ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [openModal]);

  const closeModal = () => {
    setOpenModal(false);
    setSelectedInventoryId(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/api/inventory/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete inventory");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-background-light">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col mb-3 md:mb-6 md:flex-row md:items-center justify-between gap-4">
          <div className="">
            <h2 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h2>
            <p className="text-slate-500">
              Welcome back, Sarah. Here's what's happening today.
            </p>
          </div>
          <div className="flex md:flex-row flex-col gap-3">
            <button
              onClick={() => {
                setSelectedInventoryId(null);
                setOpenModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1c6bf2] hover:cursor-pointer text-white rounded text-sm font-medium hover:bg-[#1c6bf2]/90 transition-all shadow-lg shadow-[#1c6bf2]/20"
            >
              <Plus size={18} />
              <span>New Stock</span>
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* FABRIC FILTER */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilter(openFilter === "fabric" ? null : "fabric")
              }
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-semibold"
            >
              Fabric: {fabricFilter}
              <ChevronDown size={18} />
            </button>

            {openFilter === "fabric" && (
              <div className="absolute mt-2 bg-white border rounded shadow z-20 w-48">
                {fabricOptions.map((f: string) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFabricFilter(f);
                      setOpenFilter(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STOCK FILTER */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilter(openFilter === "meters" ? null : "meters")
              }
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded text-sm font-semibold"
            >
              Stock: {meterFilter}
              <ChevronDown size={18} />
            </button>

            {openFilter === "meters" && (
              <div className="absolute mt-2 bg-white border border-slate-200 rounded shadow z-20 w-44">
                {["ALL", "LOW", "MEDIUM", "HIGH"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMeterFilter(m);
                      setOpenFilter(null);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase">
                    Fabric
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase">
                    Color
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase">
                    GSM
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase">
                    Available Meters
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase">
                    Created
                  </th>
                  <th className="py-4 px-6 text-right text-[10px] font-bold uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#0077B6]" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item: any) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-6 font-semibold">
                        {item.fabricName}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${getColorStyle(
                            item.color,
                          )}`}
                        >
                          {item.color}
                        </span>
                      </td>
                      <td className="py-4 px-6">{item.gsm}</td>
                      <td className="py-4 px-6 font-bold">
                        {item.availableMeters} m
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInventoryId(item._id);
                              setOpenModal(true);
                            }}
                            className="p-2 rounded hover:text-[#1c6bf2] hover:cursor-pointer text-slate-600"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item._id)}
                            className="p-2 rounded hover:text-red-600 hover:cursor-pointer text-slate-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
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
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedInventoryId ? "Edit Stock" : "Add New Stock"}
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-500 hover:cursor-pointer text-sm"
              >
                <X size={18} color="#ff0000" />
              </button>
            </div>

            <InventoryForm
              key={selectedInventoryId ?? "new"}
              InventoryId={selectedInventoryId}
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
              Are you sure you want to delete this inventory item? This action
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
    </main>
  );
};

export default Inventory;
