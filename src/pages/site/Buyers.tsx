import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { SquarePen, Plus, X, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { buyerApi } from "../../utils/api";
import BuyerForm from "../../components/buyer/BuyerForm";
import toast from "react-hot-toast";

const fetchBuyers = async (page: number, limit: number, filters?: any) => {
  const res = await buyerApi.getBuyers(page, limit, filters);
  return res?.data?.data;
};

const Buyer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [openModal, setOpenModal] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  // const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
    }
    // Check if user is admin
    if (user?.role !== "ADMIN") {
      navigate("/");
      toast.error("Access denied. Admin only.");
    }
  }, [isAuthenticated, user, navigate]);

  const { data: buyersData, isLoading } = useQuery({
    queryKey: ["buyers", page, filters],
    queryFn: () => fetchBuyers(page, 10, filters),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const buyers = buyersData?.buyers || [];
  const totalPages = buyersData?.totalPages || 1;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => buyerApi.deleteBuyer(id),
    onSuccess: () => {
      toast.success("Buyer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyers-active"] });
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete buyer");
    },
  });

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSearch = () => {
    setFilters({ name: searchTerm });
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilters({});
    setPage(1);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedBuyerId(null);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-background-light">
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col mb-6 md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Buyer Management
            </h2>
            <p className="text-slate-500">
              Manage your buyers and their contact information
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBuyerId(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1c6bf2] text-white rounded-lg text-sm font-medium hover:bg-[#1557c7] transition-all shadow-lg shadow-[#1c6bf2]/20"
          >
            <Plus size={18} />
            <span>Add Buyer</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search buyers by name..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2]"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-[#1c6bf2] text-white rounded-lg hover:bg-[#1557c7] transition-colors"
          >
            Search
          </button>
          {filters.name && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Buyer Name
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#1c6bf2]" />
                      </div>
                    </td>
                  </tr>
                ) : buyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 text-slate-300">
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          No buyers found
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                          {filters.name
                            ? "Try adjusting your search"
                            : "Get started by adding your first buyer"}
                        </p>
                        {!filters.name && (
                          <button
                            onClick={() => {
                              setSelectedBuyerId(null);
                              setOpenModal(true);
                            }}
                            className="px-4 py-2 bg-[#1c6bf2] text-white rounded-lg hover:bg-[#1557c7]"
                          >
                            Add First Buyer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  buyers.map((buyer: any) => (
                    <tr
                      key={buyer._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {buyer.name}
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {buyer.contactPerson}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {buyer.email}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {buyer.phone}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        {new Date(buyer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBuyerId(buyer._id);
                              setOpenModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 hover:text-[#1c6bf2] text-slate-600 transition-colors"
                            title="Edit buyer"
                          >
                            <SquarePen size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(buyer._id)}
                            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors"
                            title="Delete buyer"
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

        {/* Pagination */}
        {!isLoading && buyers.length > 0 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedBuyerId ? "Edit Buyer" : "Add New Buyer"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <BuyerForm
              key={selectedBuyerId ?? "new"}
              BuyerId={selectedBuyerId}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Buyer
                </h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-slate-700 mb-6">
              Are you sure you want to delete this buyer? This will permanently
              remove the buyer from the system.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Buyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Buyer;
