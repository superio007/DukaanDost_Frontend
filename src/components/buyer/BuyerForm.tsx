import { useEffect } from "react";
import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import { buyerApi } from "../../utils/api";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

type BuyerFormType = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
};

type Props = {
  BuyerId?: string | null;
  onClose: () => void;
};

const fetchBuyer = async (id: string) => {
  const res = await buyerApi.getBuyerById(id);
  return res?.data?.data;
};

const ErrorText = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-red-600 text-sm mt-1">{msg}</p> : null;

const BuyerForm = ({ BuyerId, onClose }: Props) => {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BuyerFormType>({
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Fetch buyer data if editing
  const { data: buyer } = useQuery({
    queryKey: ["buyer", BuyerId],
    queryFn: () => fetchBuyer(BuyerId as string),
    enabled: !!BuyerId,
    refetchOnWindowFocus: false,
  });

  // Prefill form when editing
  useEffect(() => {
    if (buyer) {
      reset({
        name: buyer.name || "",
        contactPerson: buyer.contactPerson || "",
        email: buyer.email || "",
        phone: buyer.phone || "",
        address: buyer.address || "",
      });
    }
  }, [buyer, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: BuyerFormType) => buyerApi.createBuyer(data),
    onSuccess: () => {
      toast.success("Buyer created successfully");
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyers-active"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create buyer");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: BuyerFormType) =>
      buyerApi.updateBuyer(BuyerId as string, data),
    onSuccess: () => {
      toast.success("Buyer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer", BuyerId] });
      queryClient.invalidateQueries({ queryKey: ["buyers-active"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update buyer");
    },
  });

  const onSubmit = async (data: BuyerFormType) => {
    if (BuyerId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Buyer Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Buyer Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name", {
            required: "Buyer name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            errors.name ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="Enter buyer name"
        />
        <ErrorText msg={errors.name?.message} />
      </div>

      {/* Contact Person */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Contact Person <span className="text-red-500">*</span>
        </label>
        <input
          {...register("contactPerson", {
            required: "Contact person is required",
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            errors.contactPerson ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="Enter contact person name"
        />
        <ErrorText msg={errors.contactPerson?.message} />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            errors.email ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="buyer@example.com"
        />
        <ErrorText msg={errors.email?.message} />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          {...register("phone", {
            required: "Phone number is required",
            minLength: {
              value: 10,
              message: "Phone number must be at least 10 digits",
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            errors.phone ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="+1-555-0123"
        />
        <ErrorText msg={errors.phone?.message} />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("address", {
            required: "Address is required",
            minLength: {
              value: 10,
              message: "Address must be at least 10 characters",
            },
          })}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            errors.address ? "border-red-500" : "border-slate-300"
          }`}
          placeholder="Enter complete address"
        />
        <ErrorText msg={errors.address?.message} />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#1c6bf2] text-white rounded-lg text-sm font-medium hover:bg-[#1557c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : BuyerId
              ? "Update Buyer"
              : "Create Buyer"}
        </button>
      </div>
    </form>
  );
};

export default BuyerForm;
